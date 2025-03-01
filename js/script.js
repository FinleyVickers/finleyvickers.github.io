document.addEventListener('DOMContentLoaded', function() {
    const terminal = document.getElementById('terminal-content');
    const currentCommand = document.getElementById('current-command');
    const commandsHistory = document.getElementById('commands-history');
    const contentPages = document.getElementById('content-pages');
    
    let commandHistory = [];
    let historyIndex = -1;

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

    // Handle key events
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
        // Create a temporary invisible input to trigger keyboard on mobile
        const tempInput = document.createElement('input');
        tempInput.style.position = 'absolute';
        tempInput.style.opacity = '0';
        tempInput.style.height = '0';
        tempInput.style.width = '0';
        
        document.body.appendChild(tempInput);
        tempInput.focus();
        
        // Track the previous input value to prevent duplicates
        let previousValue = '';
        
        // Handle input from the temporary field - completely new approach
        tempInput.addEventListener('input', function(e) {
            // Get the difference between current and previous value
            const newInput = e.target.value.slice(previousValue.length);
            
            // Only add new input if there is any
            if (newInput) {
                currentCommand.textContent += newInput;
            }
            
            // Store current value for next comparison
            previousValue = e.target.value;
        });
        
        // Handle special keys for the temporary input
        tempInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                executeCommand();
                // Reset tracking after command execution
                previousValue = '';
                e.target.value = '';
                e.preventDefault();
            } else if (e.key === 'Backspace') {
                if (currentCommand.textContent.length > 0) {
                    currentCommand.textContent = currentCommand.textContent.slice(0, -1);
                    // Update tracking value to match the backspace
                    previousValue = previousValue.slice(0, -1);
                    e.target.value = previousValue;
                }
                e.preventDefault();
            } else if (e.key === 'ArrowUp') {
                navigateHistory('up');
                // Update tracking value when using history
                previousValue = currentCommand.textContent;
                e.target.value = previousValue;
                e.preventDefault();
            } else if (e.key === 'ArrowDown') {
                navigateHistory('down');
                // Update tracking value when using history
                previousValue = currentCommand.textContent;
                e.target.value = previousValue;
                e.preventDefault();
            } else if (e.key === 'Tab') {
                autocompleteCommand();
                // Update tracking value after autocomplete
                previousValue = currentCommand.textContent;
                e.target.value = previousValue;
                e.preventDefault();
            }
        });
        
        // Remove the field when user clicks elsewhere
        document.addEventListener('click', function removeTemp(e) {
            if (e.target !== terminal && e.target.parentElement !== terminal) {
                document.body.removeChild(tempInput);
                document.removeEventListener('click', removeTemp);
            }
        });
    });

    // Show help by default when the page loads
    setTimeout(() => {
        processCommand('help');
    }, 1000);
});