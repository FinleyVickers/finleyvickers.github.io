document.addEventListener('DOMContentLoaded', function() {
    const terminal = document.getElementById('terminal-content');
    const currentCommand = document.getElementById('current-command');
    const commandsHistory = document.getElementById('commands-history');
    const contentPages = document.getElementById('content-pages');
    const commandButtons = document.getElementById('command-buttons');
    
    let commandHistory = [];
    let historyIndex = -1;
    let isMobileDevice = false;
    let isProcessingInput = false; // Flag to prevent double input

    // Check if the device is mobile
    function checkMobileDevice() {
        isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        return isMobileDevice;
    }

    // Initialize mobile detection
    checkMobileDevice();

    // Available commands
    const commands = {
        'about': showAbout,
        'resume': showResume,
        'projects': showProjects,
        'contact': showContact,
        'help': showHelp,
        'clear': clearTerminal
    };

    // Cursor blinking effect
    setInterval(() => {
        const cursor = document.querySelector('.cursor');
        if (cursor) {
            cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
        }
    }, 500);

    // Create a hidden input element to capture keyboard input
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'text';
    hiddenInput.style.position = 'absolute';
    hiddenInput.style.opacity = '0';
    hiddenInput.style.height = '0';
    hiddenInput.style.width = '0';
    document.body.appendChild(hiddenInput);

    // Focus the hidden input when the terminal is clicked
    terminal.addEventListener('click', function() {
        if (!isMobileDevice) {
            hiddenInput.focus();
            
            // Scroll to the active command line
            const activeCommandLine = document.querySelector('.command-line.active');
            if (activeCommandLine) {
                activeCommandLine.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });

    // Handle input from the hidden input field
    hiddenInput.addEventListener('input', function(e) {
        if (isProcessingInput) return; // Prevent double input
        isProcessingInput = true;
        
        // Get the input value and clear the hidden input
        const inputValue = hiddenInput.value;
        hiddenInput.value = '';
        
        // Add the input to the current command
        if (inputValue) {
            currentCommand.textContent += inputValue;
        }
        
        isProcessingInput = false;
    });

    // Handle special keys
    hiddenInput.addEventListener('keydown', function(e) {
        if (isProcessingInput) return; // Prevent double input
        isProcessingInput = true;
        
        if (e.key === 'Enter') {
            e.preventDefault();
            executeCommand();
        } else if (e.key === 'Backspace') {
            e.preventDefault();
            currentCommand.textContent = currentCommand.textContent.slice(0, -1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            navigateHistory('up');
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            navigateHistory('down');
        } else if (e.key === 'Tab') {
            e.preventDefault();
            autocompleteCommand();
        }
        
        isProcessingInput = false;
    });

    // Handle command button clicks
    if (commandButtons) {
        const buttons = commandButtons.querySelectorAll('.cmd-btn');
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                const command = this.getAttribute('data-command');
                
                // Set the command text
                currentCommand.textContent = command;
                
                // Execute after a short delay to show the command
                setTimeout(() => {
                    executeCommand();
                }, 200);
            });
        });
    }

    // Handle command execution
    function executeCommand() {
        const commandText = currentCommand.textContent.trim();
        if (commandText) {
            addToCommandHistory(commandText);
            
            // Add command to terminal
            const cmdLine = document.createElement('div');
            cmdLine.className = 'command-line';
            cmdLine.innerHTML = `<span class="prompt">finley@portfolio:~$</span> <span class="command">${commandText}</span>`;
            commandsHistory.appendChild(cmdLine);
            
            // Process command
            processCommand(commandText);
            
            // Clear current command
            currentCommand.textContent = '';
            
            // Scroll to bottom
            terminal.scrollTop = terminal.scrollHeight;
        }
    }

    // Process command
    function processCommand(cmd) {
        const cmdLower = cmd.toLowerCase();
        const cmdParts = cmdLower.split(' ');
        const mainCmd = cmdParts[0];
        
        if (commands[mainCmd]) {
            commands[mainCmd]();
        } else {
            showUnknownCommand(cmd);
        }
    }

    // Command handling functions
    function showAbout() {
        const aboutContent = document.getElementById('about').innerHTML;
        displayCommandOutput(aboutContent);
    }
    
    function showResume() {
        const resumeContent = document.getElementById('resume').innerHTML;
        displayCommandOutput(resumeContent);
    }
    
    function showProjects() {
        const projectsContent = document.getElementById('projects').innerHTML;
        displayCommandOutput(projectsContent);
    }
    
    function showContact() {
        const contactContent = document.getElementById('contact').innerHTML;
        displayCommandOutput(contactContent);
    }
    
    function showHelp() {
        const helpContent = document.getElementById('help').innerHTML;
        displayCommandOutput(helpContent);
    }
    
    function clearTerminal() {
        commandsHistory.innerHTML = '';
    }
    
    function showUnknownCommand(cmd) {
        const output = document.createElement('div');
        output.className = 'output';
        output.innerHTML = `Command not found: <span class="highlight">${cmd}</span>. Type <span class="highlight">help</span> to see available commands.`;
        commandsHistory.appendChild(output);
    }

    // Display command output
    function displayCommandOutput(content) {
        const output = document.createElement('div');
        output.className = 'output';
        output.innerHTML = content;
        commandsHistory.appendChild(output);
    }

    // Add to command history
    function addToCommandHistory(cmd) {
        commandHistory.push(cmd);
        historyIndex = commandHistory.length;
    }

    // Navigate through command history
    function navigateHistory(direction) {
        if (commandHistory.length === 0) return;
        
        if (direction === 'up') {
            historyIndex = Math.max(0, historyIndex - 1);
        } else if (direction === 'down') {
            historyIndex = Math.min(commandHistory.length, historyIndex + 1);
        }
        
        if (historyIndex < commandHistory.length) {
            currentCommand.textContent = commandHistory[historyIndex];
        } else {
            currentCommand.textContent = '';
        }
    }

    // Autocomplete command
    function autocompleteCommand() {
        const inputCmd = currentCommand.textContent.toLowerCase();
        
        if (!inputCmd) return;
        
        const matchingCmds = Object.keys(commands).filter(cmd => cmd.startsWith(inputCmd));
        
        if (matchingCmds.length === 1) {
            currentCommand.textContent = matchingCmds[0];
        }
    }

    // Focus the hidden input on page load for desktop
    if (!isMobileDevice) {
        hiddenInput.focus();
    }

    // Show help by default when the page loads
    setTimeout(() => {
        processCommand('help');
    }, 1000);
});