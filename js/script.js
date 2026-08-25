document.addEventListener('DOMContentLoaded', function() {
    const terminal = document.getElementById('terminal-content');
    const currentCommand = document.getElementById('current-command');
    const commandsHistory = document.getElementById('commands-history');
    const commandButtons = document.getElementById('command-buttons');

    let commandHistory = [];
    let historyIndex = -1;
    let isProcessingInput = false;

    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    const commands = {
        about: showAbout,
        resume: showResume,
        work: showWork,
        experience: showWork,
        projects: showProjects,
        contact: showContact,
        help: showHelp,
        clear: clearTerminal
    };

    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'text';
    hiddenInput.setAttribute('aria-label', 'Terminal command input');
    hiddenInput.autocomplete = 'off';
    hiddenInput.spellcheck = false;
    hiddenInput.style.position = 'fixed';
    hiddenInput.style.opacity = '0';
    hiddenInput.style.pointerEvents = 'none';
    hiddenInput.style.height = '1px';
    hiddenInput.style.width = '1px';
    document.body.appendChild(hiddenInput);

    terminal.addEventListener('click', function() {
        if (!isMobileDevice) {
            hiddenInput.focus();
        }
    });

    hiddenInput.addEventListener('input', function() {
        if (isProcessingInput) return;
        isProcessingInput = true;

        if (hiddenInput.value) {
            currentCommand.textContent += hiddenInput.value;
            hiddenInput.value = '';
        }

        isProcessingInput = false;
    });

    hiddenInput.addEventListener('keydown', function(event) {
        if (isProcessingInput) return;
        isProcessingInput = true;

        if (event.key === 'Enter') {
            event.preventDefault();
            executeCommand();
        } else if (event.key === 'Backspace') {
            event.preventDefault();
            currentCommand.textContent = currentCommand.textContent.slice(0, -1);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            navigateHistory('up');
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            navigateHistory('down');
        } else if (event.key === 'Tab') {
            event.preventDefault();
            autocompleteCommand();
        }

        isProcessingInput = false;
    });

    if (commandButtons) {
        commandButtons.querySelectorAll('.cmd-btn').forEach(button => {
            button.addEventListener('click', function() {
                const command = this.dataset.command || '';
                const scrollMode = command === 'clear' ? 'none' : 'output';

                currentCommand.textContent = command;
                window.setTimeout(() => executeCommand({ scrollMode }), 160);
            });
        });
    }

    function executeCommand({ scrollMode = 'bottom' } = {}) {
        const commandText = currentCommand.textContent.trim();
        if (!commandText) return;

        addToCommandHistory(commandText);
        appendCommandLine(commandText);
        const output = processCommand(commandText);
        currentCommand.textContent = '';

        if (scrollMode === 'output' && output) {
            scrollToElementStart(output);
        } else if (scrollMode === 'bottom') {
            scrollToBottom();
        }
    }

    function appendCommandLine(commandText) {
        const commandLine = document.createElement('div');
        commandLine.className = 'command-line';

        const prompt = document.createElement('span');
        prompt.className = 'prompt';
        prompt.textContent = 'finley@portfolio:~$';

        const command = document.createElement('span');
        command.className = 'command';
        command.textContent = commandText;

        commandLine.append(prompt, command);
        commandsHistory.appendChild(commandLine);
    }

    function processCommand(rawCommand) {
        const mainCommand = rawCommand.toLowerCase().split(/\s+/)[0];

        if (commands[mainCommand]) {
            return commands[mainCommand]();
        }

        return showUnknownCommand(rawCommand);
    }

    function showSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return null;
        return displayCommandOutput(section.innerHTML);
    }

    function showAbout() {
        return showSection('about');
    }

    function showResume() {
        return showSection('resume');
    }

    function showWork() {
        return showSection('work');
    }

    function showProjects() {
        return showSection('projects');
    }

    function showContact() {
        return showSection('contact');
    }

    function showHelp() {
        return showSection('help');
    }

    function clearTerminal() {
        commandsHistory.replaceChildren();
        return null;
    }

    function showUnknownCommand(commandText) {
        const output = document.createElement('div');
        output.className = 'output';
        output.append('Command not found: ');

        const command = document.createElement('span');
        command.className = 'highlight';
        command.textContent = commandText;
        output.append(command, '. Type ');

        const help = document.createElement('span');
        help.className = 'highlight';
        help.textContent = 'help';
        output.append(help, ' to see available commands.');

        commandsHistory.appendChild(output);
        return output;
    }

    function displayCommandOutput(content) {
        const output = document.createElement('div');
        output.className = 'output';
        output.innerHTML = content;
        commandsHistory.appendChild(output);
        return output;
    }

    function addToCommandHistory(commandText) {
        commandHistory.push(commandText);
        historyIndex = commandHistory.length;
    }

    function navigateHistory(direction) {
        if (commandHistory.length === 0) return;

        if (direction === 'up') {
            historyIndex = Math.max(0, historyIndex - 1);
        } else {
            historyIndex = Math.min(commandHistory.length, historyIndex + 1);
        }

        currentCommand.textContent = historyIndex < commandHistory.length
            ? commandHistory[historyIndex]
            : '';
    }

    function autocompleteCommand() {
        const inputCommand = currentCommand.textContent.toLowerCase();
        if (!inputCommand) return;

        const matchingCommands = Object.keys(commands).filter(command => command.startsWith(inputCommand));
        if (matchingCommands.length === 1) {
            currentCommand.textContent = matchingCommands[0];
        }
    }

    function scrollToElementStart(element) {
        const terminalBody = document.querySelector('.terminal-body');
        if (!terminalBody || !element) return;

        if (terminalBody.scrollHeight > terminalBody.clientHeight) {
            const terminalRect = terminalBody.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            terminalBody.scrollTop += elementRect.top - terminalRect.top - 8;
        } else {
            element.scrollIntoView({ block: 'start' });
        }
    }

    function scrollToBottom() {
        const terminalBody = document.querySelector('.terminal-body');
        if (terminalBody) {
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }
    }

    if (!isMobileDevice) {
        hiddenInput.focus();
    }

    window.setTimeout(() => {
        processCommand('help');
        scrollToBottom();
    }, 700);
});
