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
function dragElement(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    const header = elmnt.querySelector('.window-header');
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

// Initialize dragging for the console specifically
dragElement(document.getElementById('console-window'));

// Apply drag functionality to dynamically created windows
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('window-header')) {
        const windowElement = event.target.closest('.window-frame');
        dragElement(windowElement); // Ensure draggable functionality is applied
    }
});
// Function to create and open a new window
function openWindow(contentType) {
    // Check if a window of the same type is already open
    const existingWindow = document.querySelector(`.window-frame[data-type="${contentType}"]`);
    if (existingWindow) {
        existingWindow.style.display = 'block'; // Bring the existing window to view
        return; // Exit without creating a new window
    }

    // Create the window container
    const windowContainer = document.createElement('div');
    windowContainer.className = 'window-frame';
    windowContainer.setAttribute('data-type', contentType); // Set the data attribute

    // Create window structure with header and content based on type
    windowContainer.innerHTML = `
        <div class="window-header">
            <span class="window-title">${contentType.charAt(0).toUpperCase() + contentType.slice(1)}</span>
            <div class="window-controls">
                <button class="window-btn minimize-btn" onclick="minimizeWindow(this.parentElement.parentElement.parentElement)">
                    <svg width="12" height="12" viewBox="0 0 12 12">
                        <rect y="10" width="12" height="2" fill="black"></rect>
                    </svg>
                </button>
                <button class="window-btn maximize-btn" onclick="toggleMaximizeWindow(this.parentElement.parentElement.parentElement)">
                    <svg width="12" height="12" viewBox="0 0 12 12">
                        <rect x="1" y="1" width="10" height="10" fill="none" stroke="black" stroke-width="1.5"></rect>
                    </svg>
                </button>
                <button class="window-btn close-btn" onclick="closeWindow(this.parentElement.parentElement.parentElement)">
                    <svg width="12" height="12" viewBox="0 0 12 12">
                        <line x1="1" y1="1" x2="11" y2="11" stroke="black" stroke-width="1.5"></line>
                        <line x1="11" y1="1" x2="1" y2="11" stroke="black" stroke-width="1.5"></line>
                    </svg>
                </button>
            </div>
        </div>
        <div class="window-content ${contentType}-panel">
            ${getContentForType(contentType)} <!-- Dynamically load content based on type -->
        </div>
    `;

    document.body.appendChild(windowContainer);
    makeDraggable(windowContainer);

    // Special handling for console type
    if (contentType === 'console') {
        initializeConsole(windowContainer.querySelector('.window-content')); // Initialize the console specifics
    }
}

// Minimize, Maximize, Close functions
let isMinimized = false; // Track the minimized state
let minimizedButton = null; // Store the minimized button element
let isFullscreen = false; // Track the fullscreen state

document.addEventListener('DOMContentLoaded', () => {
    createMinimizedTab(); // Create the minimized tab on page load

    // Correctly bind the maximize button's event listener
    document.querySelector('.maximize-btn').addEventListener('click', toggleMaximizeConsole);
});

// Toggle fullscreen mode
function toggleMaximizeConsole() {
    const consoleWindow = document.getElementById('console-window');

    if (isFullscreen) {
        // Revert to original size and position
        resetConsolePosition();
        consoleWindow.classList.remove('fullscreen'); // Remove fullscreen class
        isFullscreen = false; // Update state
    } else {
        // Set console window to fullscreen but keep the taskbar visible
        consoleWindow.style.position = 'fixed';
        consoleWindow.style.top = '0';
        consoleWindow.style.left = '0';
        consoleWindow.style.width = '100vw'; // Full viewport width
        consoleWindow.style.height = 'calc(100vh - 40px)'; // Full viewport height minus taskbar
        consoleWindow.style.zIndex = '1000'; // Ensure it's on top of other elements
        consoleWindow.classList.add('fullscreen'); // Add fullscreen class
        isFullscreen = true; // Update state
    }
}

// Function to reset console to initial size and position
function resetConsolePosition() {
    const consoleWindow = document.getElementById('console-window');
    consoleWindow.style.position = 'absolute';
    consoleWindow.style.width = '800px'; // Set to your preferred width
    consoleWindow.style.height = '400px'; // Set to your preferred height
    consoleWindow.style.top = '50px'; // Set to your preferred top position
    consoleWindow.style.left = '50px'; // Set to your preferred left position
    consoleWindow.style.zIndex = '10'; // Reset z-index for standard positioning
}

// Create a minimized tab on the taskbar
function createMinimizedTab() {
    const minimizedContainer = document.getElementById('minimized-windows-container');

    if (!minimizedButton) {
        minimizedButton = document.createElement('button');
        minimizedButton.className = 'minimized-window-tab active'; // Initially active
        minimizedButton.innerText = 'Hapiuk Console'; // Customize text if needed
        minimizedButton.onclick = toggleConsole; // Set click behavior to toggle the console

        minimizedContainer.insertBefore(minimizedButton, minimizedContainer.firstChild);
    }

    isMinimized = false; // Default state is not minimized
}

// Minimize the console
function minimizeConsole() {
    const consoleWindow = document.getElementById('console-window');

    consoleWindow.style.display = 'none'; // Hide the console window
    isMinimized = true; // Set state to minimized

    // Ensure the minimized tab exists and is visible
    createMinimizedTab();
    minimizedButton.classList.add('inactive'); // Set as inactive
}

// Toggle console visibility from the minimized tab
function toggleConsole() {
    const consoleWindow = document.getElementById('console-window');

    if (isMinimized) {
        consoleWindow.style.display = 'block'; // Show the console window
        minimizedButton.classList.add('active'); // Highlight as active
        minimizedButton.classList.remove('inactive'); // Remove inactive styling

        // Ensure the console is in the correct state when restored
        if (isFullscreen) {
            toggleMaximizeConsole(); // Toggle off fullscreen if it was on
        } else {
            resetConsolePosition(); // Reset position when restoring
        }

        isMinimized = false; // Update state
    } else {
        consoleWindow.style.display = 'none'; // Hide the console window
        minimizedButton.classList.add('inactive'); // Dim as inactive
        minimizedButton.classList.remove('active'); // Remove active styling
        isMinimized = true; // Update state to minimized
    }
}

// Close the console
function closeConsole() {
    const consoleWindow = document.getElementById('console-window');
    consoleWindow.style.display = 'none';

    // Remove any minimized tabs for this console
    const minimizedWindowsContainer = document.getElementById('minimized-windows-container');
    minimizedWindowsContainer.innerHTML = ''; // Clear minimized tabs related to this console
}

// Restore the console from the taskbar tab
function restoreConsoleFromTaskbar() {
    const consoleWindow = document.getElementById('console-window');

    if (isMinimized) {
        consoleWindow.style.display = 'block'; // Show the console
        minimizedButton.classList.add('active'); // Highlight as active
        isMinimized = false; // Update state
    } else {
        consoleWindow.style.display = 'none'; // Hide the console
        minimizedButton.classList.add('inactive'); // Dim as inactive
        isMinimized = true; // Update state
    }
}

// Restore the console without duplication of minimized tab
function restoreConsole() {
    const consoleWindow = document.getElementById('console-window');
    const minimizedContainer = document.getElementById('minimized-windows-container');
    consoleWindow.style.display = 'block';
    if (minimizedButton) {
        minimizedContainer.removeChild(minimizedButton); // Remove the taskbar item
        minimizedButton = null;
    }
    isMinimized = false; // Update state
}

function sendCommandToServer(command) {
    // Check if the command is a style change command
    if (command.startsWith('style-')) {
        // Handle the style change on the client side only
        const style = command.split('-')[1];
        changeStyle(style); // Call the change style function
        displayResponse(`Switched to ${style} style.`); // Display a confirmation in the console
        return; // Stop further processing and prevent sending to the server
    }

    // Existing code for sending commands to the server
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

// Function to change style
function changeStyle(style) {
    // Disable all themes first
    document.querySelectorAll('[id^="theme-"]').forEach(link => link.disabled = true);

    // Enable the selected theme
    document.getElementById(`theme-${style}`).disabled = false;

    // Update the body class to match the style
    document.body.className = style;

    const consoleWindow = document.getElementById('console-window');
    const taskbar = document.getElementById('taskbar');

    // Handle DOS theme specifically
    if (style === 'dos') {
        taskbar.style.display = 'none'; // Hide the taskbar in DOS mode
        consoleWindow.classList.add('dos-fullscreen'); // Add a class for fullscreen DOS

        // Reset position and size to fullscreen
        consoleWindow.style.top = '0';
        consoleWindow.style.left = '0';
        consoleWindow.style.width = '100vw'; // Full viewport width
        consoleWindow.style.height = '100vh'; // Full viewport height
    } else {
        // Restore taskbar visibility for other themes
        taskbar.style.display = 'flex';
        consoleWindow.classList.remove('dos-fullscreen');

        // Reset console window to default size and position
        consoleWindow.style.width = '800px'; // Example default width
        consoleWindow.style.height = '400px'; // Example default height
        consoleWindow.style.top = '50px'; // Example default top position
        consoleWindow.style.left = '50px'; // Example default left position
    }

    // Optionally log style changes or perform additional actions
    console.log(`Applied class: ${style}`); 
}

// Handle the actions from the server response
function handleAction(action) {
    if (action === 'clear') {
        document.getElementById('output').innerHTML = '';
    } else if (action && action.startsWith('style-')) {
        const style = action.split('-')[1];
        changeStyle(style); // Use the changeStyle function to update the theme
    }
}

// JavaScript for Taskbar Start Button
const startButton = document.getElementById('start-button');
const startMenu = document.getElementById('start-menu');

startButton.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent window click from closing the menu
    startMenu.style.display = startMenu.style.display === 'block' ? 'none' : 'block';
});

// Close the start menu when clicking outside
window.addEventListener('click', (event) => {
    if (!startButton.contains(event.target) && !startMenu.contains(event.target)) {
        startMenu.style.display = 'none';
    }
});

function updateClock() {
    const clockElement = document.getElementById('taskbar-clock');
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

    // Format the clock display
    clockElement.innerHTML = `<span class="clock-time">${time}</span> <span class="clock-date">${date}</span>`;
}

// Update Clock Time and Date
function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    document.getElementById('clock-time').textContent = `${hours}:${minutes}`;
    document.getElementById('clock-date').textContent = `${day}/${month}/${year}`;
}

// Update the clock every minute
setInterval(updateClock, 60000);
updateClock(); // Initial call to display the time immediately

// Toggle calendar popup on click
const taskbarClock = document.getElementById('taskbar-clock');
const calendarPopup = document.getElementById('calendar-popup');

taskbarClock.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent closing when clicking on the clock itself
    calendarPopup.style.display = calendarPopup.style.display === 'block' ? 'none' : 'block';
    populateCalendar(); // Populate the calendar when it is shown
});

// Close calendar popup when clicking outside
window.addEventListener('click', (event) => {
    if (!taskbarClock.contains(event.target) && !calendarPopup.contains(event.target)) {
        calendarPopup.style.display = 'none';
    }
});

// Populate calendar with days of the current month
function populateCalendar() {
    const calendarGrid = document.querySelector('.calendar-grid');
    calendarGrid.innerHTML = ''; // Clear existing dates
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    // Create day labels
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayLabels.forEach(day => {
        const dayLabel = document.createElement('div');
        dayLabel.classList.add('calendar-day');
        dayLabel.textContent = day;
        calendarGrid.appendChild(dayLabel);
    });

    // Create empty squares for days before the first of the month
    for (let i = 0; i < firstDay; i++) {
        const emptySquare = document.createElement('div');
        calendarGrid.appendChild(emptySquare);
    }

    // Create squares for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateSquare = document.createElement('div');
        dateSquare.classList.add('calendar-date');
        
        // Example availability assignment, adjust based on your logic
        if (day % 7 === 0) {
            dateSquare.classList.add('unavailable'); // Red for unavailable
        } else if (day % 5 === 0) {
            dateSquare.classList.add('limited'); // Orange for limited availability
        } else {
            dateSquare.classList.add('available'); // Green for available
        }
        
        dateSquare.textContent = day;
        calendarGrid.appendChild(dateSquare);
    }
}

// Function to create and open a new window
function openWindow(contentType) {
    // Check if a window of the same type is already open
    const existingWindow = document.querySelector(`.window-frame[data-type="${contentType}"]`);
    if (existingWindow) {
        existingWindow.style.display = 'block'; // Bring the existing window to view
        return; // Exit without creating a new window
    }

    const windowContainer = document.createElement('div');
    windowContainer.className = 'window-frame';
    windowContainer.setAttribute('data-type', contentType); // Set the data attribute

    // Create window structure with header and content based on type
    windowContainer.innerHTML = `
        <div class="window-header">
            <span class="window-title">${contentType.charAt(0).toUpperCase() + contentType.slice(1)}</span>
            <div class="window-controls">
                <button class="window-btn minimize-btn" onclick="minimizeWindow(this.parentElement.parentElement.parentElement)">
                    <svg width="12" height="12" viewBox="0 0 12 12">
                        <rect y="10" width="12" height="2" fill="black"></rect>
                    </svg>
                </button>
                <button class="window-btn maximize-btn" onclick="toggleMaximizeWindow(this.parentElement.parentElement.parentElement)">
                    <svg width="12" height="12" viewBox="0 0 12 12">
                        <rect x="1" y="1" width="10" height="10" fill="none" stroke="black" stroke-width="1.5"></rect>
                    </svg>
                </button>
                <button class="window-btn close-btn" onclick="closeWindow(this.parentElement.parentElement.parentElement)">
                    <svg width="12" height="12" viewBox="0 0 12 12">
                        <line x1="1" y1="1" x2="11" y2="11" stroke="black" stroke-width="1.5"></line>
                        <line x1="11" y1="1" x2="1" y2="11" stroke="black" stroke-width="1.5"></line>
                    </svg>
                </button>
            </div>
        </div>
        <div class="window-content ${contentType}-panel">
            ${getContentForType(contentType)} <!-- Dynamically load content based on type -->
        </div>
    `;

    document.body.appendChild(windowContainer);
    makeDraggable(windowContainer);
}

// Function to dynamically load content based on type
function getContentForType(contentType) {
    switch (contentType) {
        case 'console':
            return `
                <div id="output">Welcome to the console. Type "help" to begin.</div>
                <div class="input-line">
                    <span class="prompt">$</span>
                    <input type="text" id="console-input" autofocus>
                </div>
            `;
        case 'contact':
            return `<p>Contact Panel</p>`;
        case 'about':
            return `<p>About Panel</p>`;
        case 'services':
            return `<p>Services Panel</p>`;
        case 'portfolio':
            return `<p>Portfolio Panel</p>`;
        // Add cases for other content types
        default:
            return `<p>Content not found.</p>`;
    }
}

// Add draggable functionality
function makeDraggable(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    const header = elmnt.querySelector('.window-header');
    if (header) {
        header.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// Minimize, Maximize, and Close window functions
function minimizeWindow(windowElement) {
    windowElement.style.display = 'none';

    // Create a taskbar tab if it doesn't exist
    const minimizedContainer = document.getElementById('minimized-windows-container');
    const minimizedButton = document.createElement('button');
    minimizedButton.className = 'minimized-window-tab inactive';
    minimizedButton.innerText = windowElement.querySelector('.window-title').innerText;
    minimizedButton.onclick = () => {
        windowElement.style.display = 'block'; // Show window on click
        minimizedButton.remove(); // Remove tab after restoring
    };
    minimizedContainer.appendChild(minimizedButton);
}

function maximizeWindow(windowElement) {
    windowElement.style.position = 'fixed';
    windowElement.style.top = '0';
    windowElement.style.left = '0';
    windowElement.style.width = '100vw';
    windowElement.style.height = '100vh';
    windowElement.style.zIndex = '1000';
}

function closeWindow(windowElement) {
    document.body.removeChild(windowElement);
}

document.getElementById('console-input').addEventListener('keydown', function(event) {
    const inputField = event.target;

    if (event.key === 'Enter') {
        const command = inputField.value.trim();
        if (command) {
            // Display the command in the console
            displayResponse(`$ ${command}`); // Prefix user input with $

            // Clear input after displaying
            inputField.value = '';

            // Process the command as needed
            sendCommandToServer(command);
        }
    }
});

// Function to display console-like responses, ensuring all lines are prefixed with $
function displayResponse(response) {
    const output = document.getElementById('output');
    if (response) {
        const responseLine = document.createElement('div');
        responseLine.textContent = `$ ${response}`; // Prefix with $
        output.appendChild(responseLine);
        output.scrollTop = output.scrollHeight; // Auto-scroll to the bottom
    }
}

// Function to initialize console with the welcome message
function initializeConsole() {
    const output = document.getElementById('output');
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'console-line'; // Ensure it matches console line style
    welcomeMessage.innerHTML = `$ Welcome to the console. Type "help" to begin.`;
    output.appendChild(welcomeMessage);
}

// Call initializeConsole when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeConsole);

