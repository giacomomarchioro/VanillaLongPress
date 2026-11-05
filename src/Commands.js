// Optional command input for #log. Load a mapping defining COMMANDS first:
// COMMANDS = { "<per<": "ꝑ" };
// Capture-phase handling keeps commands literal even when AutoSub is loaded.
(function () {
    function setupCommands() {
        const textarea = document.getElementById("log");
        if (!textarea) return;

        let command = null;
        let updatingText = false;

        function cancelCommand() {
            command = null;
        }

        function checkCommand() {
            if (updatingText) return;
            if (command && (textarea.value !== command.value ||
                textarea.selectionStart !== command.end || textarea.selectionEnd !== command.end)) {
                cancelCommand();
            }
        }

        function replace(event, text, start, end) {
            event.preventDefault();
            // setRangeText can fire select synchronously, before our state catches up.
            updatingText = true;
            try {
                textarea.setRangeText(text, start, end, "end");
                if (command) {
                    command.end = textarea.selectionEnd;
                    command.value = textarea.value;
                }
            } finally {
                updatingText = false;
            }
            textarea.dispatchEvent(new Event("input", { bubbles: true }));
        }

        textarea.addEventListener("blur", cancelCommand);
        textarea.addEventListener("pointerdown", cancelCommand);
        textarea.addEventListener("compositionstart", cancelCommand);
        textarea.addEventListener("select", checkCommand);
        textarea.addEventListener("input", checkCommand);
        textarea.addEventListener("keydown", function (event) {
            if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "Escape", "Tab"].includes(event.key) ||
                (event.repeat && event.key === "<")) cancelCommand();
        }, true);

        // Use an ancestor so this runs before target listeners in every browser.
        document.addEventListener("beforeinput", function (event) {
            if (event.target !== textarea) return;
            checkCommand();
            if (event.defaultPrevented || !event.cancelable || event.isComposing) {
                cancelCommand();
                return;
            }

            if (command && event.inputType === "deleteContentBackward") {
                const text = textarea.value.slice(command.start, command.end);
                const start = command.end - [...text].pop().length;
                if (start === command.start) cancelCommand();
                replace(event, "", start, textarea.selectionEnd);
                return;
            }

            if (event.inputType !== "insertText" || !event.data || /[\r\n]/.test(event.data)) {
                cancelCommand();
                return;
            }

            if (command) {
                if (event.data === "<") {
                    const key = textarea.value.slice(command.start, command.end) + "<";
                    const start = command.start;
                    cancelCommand();
                    const replacement = typeof COMMANDS !== "undefined" &&
                        Object.prototype.hasOwnProperty.call(COMMANDS, key) ? COMMANDS[key] : undefined;
                    if (typeof replacement === "string") {
                        replace(event, replacement, start, textarea.selectionEnd);
                    } else {
                        // Consume the delimiter too, keeping unknown commands literal.
                        replace(event, "<", textarea.selectionStart, textarea.selectionEnd);
                    }
                } else {
                    replace(event, event.data, textarea.selectionStart, textarea.selectionEnd);
                }
            } else if (event.data === "<" && typeof COMMANDS !== "undefined") {
                command = { start: textarea.selectionStart };
                replace(event, "<", textarea.selectionStart, textarea.selectionEnd);
            }
        }, true);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setupCommands, { once: true });
    } else {
        setupCommands();
    }
})();
