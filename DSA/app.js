let stack = [];
let stackCapacity = 0;

// DOM Elements
const capacityInput = document.getElementById('capacityInput');
const pushInput = document.getElementById('pushInput');
const stackContainer = document.getElementById('stackContainer');
const capacityDisplay = document.getElementById('capacityDisplay');
const messageBox = document.getElementById('messageBox');

function init() {
    setupEventListeners();
    updateCapacityDisplay();
    renderStack();
}

function setupEventListeners() {
    capacityInput.addEventListener('keypress', (e) => e.key === 'Enter' && setCapacity());
    pushInput.addEventListener('keypress', (e) => e.key === 'Enter' && handlePush());
}

function setCapacity() {
    const newCapacity = parseInt(capacityInput.value);
    
    if (isNaN(newCapacity)) {
        showError('Please enter a valid number for capacity');
        return;
    }
    
    if (newCapacity <= 0) {
        showError('Capacity must be greater than 0');
        return;
    }
    
    stackCapacity = newCapacity;
    stack = [];
    renderStack();
    showMessage(Stack capacity set to ${stackCapacity});
    capacityInput.value = '';
    capacityInput.focus();
}

function renderStack() {
    stackContainer.innerHTML = '';
    
    if (stackCapacity > 10) {
        stackContainer.classList.add('scroll-enabled');
    } else {
        stackContainer.classList.remove('scroll-enabled');
    }

    // Calculate how many empty slots we need at the BOTTOM
    const emptySlots = Math.max(0, stackCapacity - stack.length);

    // 1. First render the stack items from newest to oldest (top to bottom)
    // We don't need to reverse anymore since we want newest at top
    stack.forEach((item, index) => {
        const isTop = (index === stack.length - 1); // Last in array is top
        createStackItem(item, isTop);
    });

    // 2. Then render empty slots at the BOTTOM
    for (let i = 0; i < emptySlots; i++) {
        createStackItem('', false);
    }

    setTimeout(() => {
        if (stackCapacity > 10) {
            stackContainer.scrollTop = 0; // Scroll to top for large stacks
        }
    }, 10);
    
    updateCapacityDisplay();
}

function createStackItem(value, isTop) {
    const item = document.createElement('div');
    item.className = item ${value === '' ? 'empty' : ''};
    
    if (value !== '') {
        const num = document.createElement('div');
        num.className = 'num';
        num.textContent = value;
        item.appendChild(num);
        
        if (isTop) {
            const topLabel = document.createElement('div');
            topLabel.className = 'stack-label';
            topLabel.textContent = 'TOP';
            item.appendChild(topLabel);
        }
    }
    
    stackContainer.appendChild(item);
}

function handlePush() {
    if (stackCapacity > 0 && stack.length >= stackCapacity) {
        showError('Stack overflow! Cannot push more elements.');
        return;
    }
    
    const newElement = pushInput.value.trim();
    if (newElement === '') {
        showError('Please enter an element to push');
        return;
    }
    
    stack.push(newElement);
    pushInput.value = '';
    renderStack();
    showMessage(Pushed: ${newElement});
    pushInput.focus();
}

function handlePop() {
    if (stack.length === 0) {
        showError('Stack underflow! No elements to pop.');
        return;
    }
    
    const poppedElement = stack.pop();
    renderStack();
    showMessage(Popped: ${poppedElement});
}

function updateCapacityDisplay() {
    capacityDisplay.textContent = stackCapacity > 0 
        ? Capacity: ${stack.length}/${stackCapacity} 
        : Items: ${stack.length};
}

function showMessage(message) {
    messageBox.textContent = message;
    messageBox.className = 'message-box info';
    setTimeout(() => messageBox.className = 'message-box', 2500);
}

function showError(message) {
    messageBox.textContent = message;
    messageBox.className = 'message-box error';
    setTimeout(() => messageBox.className = 'message-box', 2500);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);