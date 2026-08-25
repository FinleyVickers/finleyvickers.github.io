document.addEventListener('DOMContentLoaded', function() {
    const terminal = document.getElementById('terminal-content');
    const currentCommand = document.getElementById('current-command');
    const commandsHistory = document.getElementById('commands-history');
    const commandButtons = document.getElementById('command-buttons');
    const workSection = document.getElementById('work');
    const helpSection = document.getElementById('help');

    if (workSection) {
        workSection.innerHTML = `
            <h2>Professional Highlights</h2>

            <article class="case-study-card">
                <span class="case-study-kicker">Real-time communications</span>
                <h3>Voice and telephony platforms</h3>
                <div class="project-tags">
                    <span class="tag">Kotlin</span>
                    <span class="tag">PostgreSQL</span>
                    <span class="tag">WebSockets</span>
                    <span class="tag">Telephony</span>
                </div>
                <p>Built backend and product capabilities for AI-powered customer communications across voice, messaging, and email. Worked on call handling, transfers, queues, media streaming, and provider integrations with a focus on reliability.</p>
            </article>

            <article class="case-study-card">
                <span class="case-study-kicker">Applied AI</span>
                <h3>Review, sentiment, and routing systems</h3>
                <div class="project-tags">
                    <span class="tag">LLMs</span>
                    <span class="tag">Audio AI</span>
                    <span class="tag">Human Feedback</span>
                    <span class="tag">React</span>
                </div>
                <p>Developed AI-assisted review, sentiment, and routing features that combine model output with structured signals and human feedback. Added evaluation and safety controls to make automated decisions more useful and explainable.</p>
            </article>

            <article class="case-study-card">
                <span class="case-study-kicker">Security and reliability</span>
                <h3>Safer execution and more resilient services</h3>
                <div class="project-tags">
                    <span class="tag">Application Security</span>
                    <span class="tag">Multi-tenancy</span>
                    <span class="tag">Authentication</span>
                    <span class="tag">Performance</span>
                </div>
                <p>Improved application security, multi-tenant isolation, authentication, and secret handling across the platform. Diagnosed and resolved performance, concurrency, and recovery issues spanning APIs, databases, and frontend state.</p>
            </article>

            <article class="case-study-card">
                <span class="case-study-kicker">Platform engineering</span>
                <h3>Observability and production infrastructure</h3>
                <div class="project-tags">
                    <span class="tag">AWS</span>
                    <span class="tag">Kubernetes</span>
                    <span class="tag">OpenTelemetry</span>
                    <span class="tag">Grafana</span>
                </div>
                <p>Built observability, dashboards, alerting, and deployment improvements across AWS and Kubernetes. Contributed from application code through infrastructure-as-code and production rollout.</p>
            </article>
        `;
    }

    if (helpSection) {
        const workHelpItem = Array.from(helpSection.querySelectorAll('.command-item'))
            .find(item => item.querySelector('code')?.textContent === 'work');
        const description = workHelpItem?.querySelector('span');
        if (description) {
            description.textContent = '- View professional highlights';
        }
    }

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
                currentCommand.textContent = this.dataset.command || '';
                window.setTimeout(executeCommand, 160);
            });
        });
    }

    function executeCommand() {
        const commandText = currentCommand.textContent.trim();
        if (!commandText) return;

        addToCommandHistory(commandText);
        appendCommandLine(commandText);
        processCommand(commandText);
        currentCommand.textContent = '';
        scrollToBottom();
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
            commands[mainCommand]();
        } else {
            showUnknownCommand(rawCommand);
        }
    }

    function showSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        displayCommandOutput(section.innerHTML);
    }

    function showAbout() {
        showSection('about');
    }

    function showResume() {
        showSection('resume');
    }

    function showWork() {
        showSection('work');
    }

    function showProjects() {
        showSection('projects');
    }

    function showContact() {
        showSection('contact');
    }

    function showHelp() {
        showSection('help');
    }

    function clearTerminal() {
        commandsHistory.replaceChildren();
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
    }

    function displayCommandOutput(content) {
        const output = document.createElement('div');
        output.className = 'output';
        output.innerHTML = content;
        commandsHistory.appendChild(output);
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
