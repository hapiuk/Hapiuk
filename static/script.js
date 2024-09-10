// JavaScript to focus on the input when the console area is clicked
document.querySelectorAll('.console').forEach(consoleElement => {
    consoleElement.addEventListener('click', () => {
        const inputField = consoleElement.querySelector('#console-input');
        if (inputField) {
            inputField.focus(); // Focus on the input field when the console is clicked
        }
    });
});

// Array to store command history and an index to track current position
let commandHistory = [];
let historyIndex = -1;

// Handle Enter key press for submitting commands
document.getElementById('console-input').addEventListener('keydown', function(event) {
    const inputField = event.target;

    if (event.key === 'Enter') {
        const command = inputField.value.toLowerCase();
        sendCommandToServer(command);

        // Add the command to history and reset the index
        if (command.trim() !== '') {
            commandHistory.push(command);
            historyIndex = commandHistory.length; // Set to the end of the history
        }

        inputField.value = '';
    } else if (event.key === 'ArrowUp') {
        // Show the previous command
        if (historyIndex > 0) {
            historyIndex--;
            inputField.value = commandHistory[historyIndex];
        } else if (historyIndex === 0) {
            inputField.value = commandHistory[0];
        }
    } else if (event.key === 'ArrowDown') {
        // Show the next command
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            inputField.value = commandHistory[historyIndex];
        } else if (historyIndex === commandHistory.length - 1) {
            historyIndex++;
            inputField.value = ''; // Clear the input if we go past the last command
        }
    }
});

// Apply resizable functionality to the console window
document.querySelectorAll('.resize-handle').forEach(handle => {
    handle.addEventListener('mousedown', initResize);
});

function initResize(e) {
    e.preventDefault();
    const consoleWindow = document.getElementById('console-window');

    // Stop window drag while resizing
    e.stopPropagation();

    window.addEventListener('mousemove', startResizing);
    window.addEventListener('mouseup', stopResizing);

    function startResizing(event) {
        const rect = consoleWindow.getBoundingClientRect();
        if (e.target.classList.contains('right')) {
            consoleWindow.style.width = event.clientX - rect.left + 'px';
        } else if (e.target.classList.contains('bottom')) {
            consoleWindow.style.height = event.clientY - rect.top + 'px';
        } else if (e.target.classList.contains('bottom-right')) {
            consoleWindow.style.width = event.clientX - rect.left + 'px';
            consoleWindow.style.height = event.clientY - rect.top + 'px';
        } else if (e.target.classList.contains('top')) {
            const newHeight = rect.bottom - event.clientY;
            if (newHeight > 100) {
                consoleWindow.style.height = newHeight + 'px';
                consoleWindow.style.top = event.clientY + 'px';
            }
        } else if (e.target.classList.contains('left')) {
            const newWidth = rect.right - event.clientX;
            if (newWidth > 200) {
                consoleWindow.style.width = newWidth + 'px';
                consoleWindow.style.left = event.clientX + 'px';
            }
        } else if (e.target.classList.contains('top-left')) {
            const newWidth = rect.right - event.clientX;
            const newHeight = rect.bottom - event.clientY;
            if (newWidth > 200 && newHeight > 100) {
                consoleWindow.style.width = newWidth + 'px';
                consoleWindow.style.height = newHeight + 'px';
                consoleWindow.style.left = event.clientX + 'px';
                consoleWindow.style.top = event.clientY + 'px';
            }
        } else if (e.target.classList.contains('top-right')) {
            consoleWindow.style.width = event.clientX - rect.left + 'px';
            const newHeight = rect.bottom - event.clientY;
            if (newHeight > 100) {
                consoleWindow.style.height = newHeight + 'px';
                consoleWindow.style.top = event.clientY + 'px';
            }
        } else if (e.target.classList.contains('bottom-left')) {
            const newWidth = rect.right - event.clientX;
            if (newWidth > 200) {
                consoleWindow.style.width = newWidth + 'px';
                consoleWindow.style.left = event.clientX + 'px';
            }
            consoleWindow.style.height = event.clientY - rect.top + 'px';
        }
    }

    function stopResizing() {
        window.removeEventListener('mousemove', startResizing);
        window.removeEventListener('mouseup', stopResizing);
    }
}

// Improved Drag Functionality
dragElement(document.getElementById('console-window'));

function dragElement(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    // Only make the header draggable
    const header = document.getElementById('window-header');
    if (header) {
        header.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // Ensure dragging only starts if not resizing
        if (e.target.closest('.resize-handle')) return; // Exit if resize handle was clicked

        // Capture initial cursor position
        pos3 = e.clientX;
        pos4 = e.clientY;
        // Add mouse move and mouse up event listeners
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // Calculate the cursor's new position
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // Update the element's position directly
        elmnt.style.top = (elmnt.offsetTop - pos2) + 'px';
        elmnt.style.left = (elmnt.offsetLeft - pos1) + 'px';
    }

    function closeDragElement() {
        // Remove the event listeners when dragging stops
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// Minimize, Maximize, Close functions
function minimizeConsole() {
    const consoleWindow = document.getElementById('console-window');
    const taskbar = document.getElementById('taskbar');
    consoleWindow.style.display = 'none';
    taskbar.style.display = 'block';
}

function maximizeConsole() {
    const consoleWindow = document.getElementById('console-window');
    consoleWindow.style.width = '100%';
    consoleWindow.style.height = '100%';
    consoleWindow.style.top = '0';
    consoleWindow.style.left = '0';
}

function closeConsole() {
    const consoleWindow = document.getElementById('console-window');
    consoleWindow.style.display = 'none';
}

function restoreConsole() {
    const consoleWindow = document.getElementById('console-window');
    const taskbar = document.getElementById('taskbar');
    consoleWindow.style.display = 'block';
    taskbar.style.display = 'none';
}

function sendCommandToServer(command) {
    fetch('/process-command', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command: command }),
    })
    .then(response => response.json())
    .then(data => {
        displayResponse(data.response);
        handleAction(data.action);
    })
    .catch(error => {
        displayResponse('Error processing command.');
        console.error('Error:', error);
    });
}

function displayResponse(response) {
    const output = document.getElementById('output');
    if (response) {
        output.innerHTML += `<div>${response}</div>`;
    }
}

function handleAction(action) {
    const consoleWindow = document.getElementById('console-window');
    if (action === 'clear') {
        document.getElementById('output').innerHTML = '';
    } else if (action && action.startsWith('style-')) {
        const style = action.split('-')[1];
        consoleWindow.className = `console-window ${style}`;

        // Reset inline styles when switching to DOS to ensure fullscreen works properly
        if (style === 'dos') {
            consoleWindow.style.left = '';
            consoleWindow.style.top = '';
            consoleWindow.style.width = '';
            consoleWindow.style.height = '';
            consoleWindow.style.transform = ''; // In case transforms are used
        }
        
        console.log(`Applied class: ${style}`); // Debugging output
    }
}
