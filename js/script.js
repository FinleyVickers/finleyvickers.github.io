document.addEventListener('DOMContentLoaded', function() {
    const terminal = document.getElementById('terminal-content');
    const currentCommand = document.getElementById('current-command');
    const commandsHistory = document.getElementById('commands-history');
    const contentPages = document.getElementById('content-pages');
    const virtualKeyboard = document.getElementById('virtual-keyboard');
    
    let commandHistory = [];
    let historyIndex = -1;
    let isMobileDevice = false;

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

    // Handle key events for desktop
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            executeCommand();
        } else if (event.key === 'Backspace') {
            currentCommand.textContent = currentCommand.textContent.slice(0, -1);
        } else if (event.key === 'ArrowUp') {
            navigateHistory('up');
        } else if (event.key === 'ArrowDown') {
            navigateHistory('down');
        } else if (event.key === 'Tab') {
            event.preventDefault();
            autocompleteCommand();
        } else if (event.key.length === 1) {
            // Only append printable characters
            currentCommand.textContent += event.key;
        }
    });

    // Handle virtual keyboard clicks
    if (virtualKeyboard) {
        const keys = virtualKeyboard.querySelectorAll('.key');
        keys.forEach(key => {
            key.addEventListener('click', function() {
                const keyValue = this.getAttribute('data-key');
                
                if (keyValue === 'Enter') {
                    executeCommand();
                } else if (keyValue === 'Backspace') {
                    currentCommand.textContent = currentCommand.textContent.slice(0, -1);
                } else {
                    // For regular command keys, add their text to the command
                    currentCommand.textContent = keyValue;
                }
                
                // Scroll to the bottom of the terminal
                terminal.scrollTop = terminal.scrollHeight;
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

    // Also listen for clicks on the terminal for mobile users
    terminal.addEventListener('click', function() {
        // For mobile devices, we'll just focus on the terminal
        // The virtual keyboard will be used instead of the device keyboard
        if (isMobileDevice) {
            // Scroll to the active command line
            const activeCommandLine = document.querySelector('.command-line.active');
            if (activeCommandLine) {
                activeCommandLine.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            // For desktop, we'll still use the original behavior
            // This is just to ensure the cursor is visible
            terminal.focus();
        }
    });

    // Show help by default when the page loads
    setTimeout(() => {
        processCommand('help');
    }, 1000);
});