// Load a substitutions file before this script, for example:
// <script src="../mapping/MUFI/substitutions.js"></script>
// <script src="../src/AutoSub.js"></script>
// The mapping should define SUBSTITUTIONS, e.g. { "s": "ſ" } or { ":": "ː" }.
(function () {
    function setupAutoSub() {
        const textarea = document.getElementById("log");
        if (!textarea) return;

        function replace(event, replacement, start, end) {
            event.preventDefault();
            textarea.setRangeText(replacement, start, end, "end");
            // Programmatic edits do not fire input automatically.
            textarea.dispatchEvent(new Event("input", { bubbles: true }));
        }

        function lookup(mapping, key) {
            if (mapping && Object.prototype.hasOwnProperty.call(mapping, key) &&
                typeof mapping[key] === "string") return mapping[key];
        }

        textarea.addEventListener("beforeinput", function (event) {
            if (event.defaultPrevented || !event.cancelable || event.isComposing) return;
            if (event.inputType !== "insertText") return;

            const substitutions = typeof SUBSTITUTIONS === "undefined" ? null : SUBSTITUTIONS;
            const replacement = lookup(substitutions, event.data);
            if (replacement !== undefined) {
                replace(event, replacement, textarea.selectionStart, textarea.selectionEnd);
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setupAutoSub, { once: true });
    } else {
        setupAutoSub();
    }
})();
