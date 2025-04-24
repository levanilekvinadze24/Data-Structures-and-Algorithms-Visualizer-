document.addEventListener('DOMContentLoaded', () => {
    const sortButton = document.querySelector('.sortButton');
    const generateButton = document.querySelector('.generateButton');
    const restartButton = document.querySelector('.restartButton');
    const numberInput = document.getElementById('numberInput');
    const container = document.querySelector('.figures-container');
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    
    let originalElements = [];
    
    // Initialize with default values
    const defaultValues = [17, 20, 18, 16, 14, 12, 10];
    generateBars(defaultValues);
    
    // Update speed value display
    speedSlider.addEventListener('input', () => {
        speedValue.textContent = `${speedSlider.value}ms`;
    });
    
    // Event listeners
    generateButton.addEventListener('click', () => {
        const inputText = numberInput.value.trim();
        const numbers = parseInput(inputText);
        
        if (numbers.length > 0) {
            generateBars(numbers);
        } else {
            alert('Please enter valid numbers separated by commas (e.g., 5,3,8,1)');
        }
    });
    
    sortButton.addEventListener('click', async () => {
        if (container.children.length === 0) return;
        
        sortButton.disabled = true;
        generateButton.disabled = true;
        restartButton.disabled = true;
        speedSlider.disabled = true;
        
        const figures = Array.from(container.children);
        
        // Reset any previous animations
        figures.forEach(fig => {
            fig.classList.remove('celebrating', 'celebrating-final', 'sorted', 'comparing', 'merge-range');
            fig.style.transform = '';
        });
        
        const elements = figures.map(figure => ({
            element: figure,
            value: parseInt(figure.querySelector('.text').textContent),
            originalIndex: figures.indexOf(figure)
        }));
        
        await mergeSortWithContinuousAnimation(elements);
        await celebrationAnimation();
        
        sortButton.disabled = false;
        generateButton.disabled = false;
        restartButton.disabled = false;
        speedSlider.disabled = false;
    });
    
    restartButton.addEventListener('click', () => {
        if (originalElements.length > 0) {
            container.innerHTML = '';
            originalElements.forEach(el => {
                container.appendChild(el.cloneNode(true));
            });
        }
    });
    
    function parseInput(input) {
        if (!input) return [];
        
        // Split by commas and/or spaces, then convert to numbers
        return input.split(/[, ]+/)
                    .map(num => parseInt(num.trim()))
                    .filter(num => !isNaN(num));
    }
    
    function generateBars(numbers) {
        container.innerHTML = '';
        originalElements = [];
        
        if (numbers.length === 0) return;
        
        // Find max value for scaling
        const maxValue = Math.max(...numbers);
        const minHeight = 50;
        const maxHeight = 250;
        
        numbers.forEach((num, index) => {
            const height = minHeight + ((num / maxValue) * (maxHeight - minHeight));
            const bar = document.createElement('div');
            bar.className = 'bar';
            bar.style.height = `${height}px`;
            
            const text = document.createElement('div');
            text.className = 'text';
            text.textContent = num.toString();
            
            bar.appendChild(text);
            container.appendChild(bar);
            
            // Store original elements for reset
            originalElements.push(bar.cloneNode(true));
        });
    }
    
    function getSpeed() {
        // Convert slider value (150-600) to delay (600-150)
        // So right end of slider = faster (150ms), left end = slower (600ms)
        return 750 - speedSlider.value; // 600 - (val - 150) simplified
    }
    
    async function mergeSortWithContinuousAnimation(elements) {
        // Create a working copy
        const arr = elements.map((el, index) => ({...el, currentIndex: index}));
        
        // Main merge sort function
        async function mergeSort(start, end) {
            if (start >= end) return;
            
            const mid = Math.floor((start + end) / 2);
            await mergeSort(start, mid);
            await mergeSort(mid + 1, end);
            await merge(start, mid, end);
        }
        
        async function merge(start, mid, end) {
            const left = arr.slice(start, mid + 1);
            const right = arr.slice(mid + 1, end + 1);
            let i = 0, j = 0, k = start;
            
            // Highlight the current merge range
            highlightRange(start, end, true);
            await sleep(getSpeed());
            
            while (i < left.length && j < right.length) {
                // Highlight the two elements being compared
                left[i].element.classList.add('comparing');
                right[j].element.classList.add('comparing');
                await sleep(getSpeed() * 1.5); // Longer delay for comparisons
                
                if (left[i].value <= right[j].value) {
                    await moveElementToPosition(left[i], k);
                    arr[k] = left[i];
                    i++;
                } else {
                    await moveElementToPosition(right[j], k);
                    arr[k] = right[j];
                    j++;
                }
                
                left[i]?.element.classList.remove('comparing');
                right[j]?.element.classList.remove('comparing');
                k++;
            }
            
            // Move remaining elements
            while (i < left.length) {
                await moveElementToPosition(left[i], k);
                arr[k] = left[i];
                i++;
                k++;
            }
            
            while (j < right.length) {
                await moveElementToPosition(right[j], k);
                arr[k] = right[j];
                j++;
                k++;
            }
            
            // Remove range highlight
            highlightRange(start, end, false);
            await sleep(getSpeed() * 0.8);
            
            // Mark the sorted portion
            for (let i = start; i <= end; i++) {
                arr[i].element.classList.add('sorted');
                await sleep(getSpeed() * 0.3); // Faster for this animation
            }
        }
        
        async function moveElementToPosition(element, newPosition) {
            const currentPosition = arr.findIndex(item => item.originalIndex === element.originalIndex);
            if (currentPosition === newPosition) return;
            
            element.element.classList.add('moving');
            await sleep(getSpeed() * 0.7);
            
            // Calculate new position in DOM
            const referenceElement = container.children[newPosition] || null;
            if (referenceElement) {
                container.insertBefore(element.element, referenceElement);
            } else {
                container.appendChild(element.element);
            }
            
            await sleep(getSpeed() * 0.7);
            element.element.classList.remove('moving');
        }
        
        function highlightRange(start, end, highlight) {
            for (let i = start; i <= end; i++) {
                if (highlight) {
                    arr[i].element.classList.add('merge-range');
                } else {
                    arr[i].element.classList.remove('merge-range');
                }
            }
        }
        
        // Start the sorting
        await mergeSort(0, arr.length - 1);
    }
    
    async function celebrationAnimation() {
        const figures = Array.from(container.children);
        
        // Stage 1: Sequential pulse animation
        for (const figure of figures) {
            figure.classList.add('celebrating');
            await sleep(getSpeed() * 0.5);
        }
        await sleep(getSpeed() * 3);
        
        // Stage 2: Remove pulse and prepare for bounce
        figures.forEach(fig => {
            fig.classList.remove('celebrating');
            fig.style.transform = '';
        });
        
        // Stage 3: Group bounce animation
        for (let i = 0; i < 2; i++) {
            figures.forEach(fig => fig.classList.add('bounce'));
            await sleep(getSpeed());
            figures.forEach(fig => fig.classList.remove('bounce'));
            await sleep(getSpeed());
        }
        
        // Stage 4: Final glow effect
        figures.forEach(fig => {
            fig.classList.add('celebrating-final');
        });
        await sleep(getSpeed() * 4);
        
        // Clean up
        figures.forEach(fig => {
            fig.classList.remove('celebrating-final');
            fig.classList.add('sorted');
        });
    }
    
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
});