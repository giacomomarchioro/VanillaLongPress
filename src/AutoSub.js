// Load a substitutions file before this script, for example:
// <script src="../mapping/MUFI/substitutions.js"></script>
// <script src="../src/AutoSub.js"></script>
// The mapping should define SUBSTITUTIONS, e.g. { "s": "ſ" } or { ":": "ː" }.
(function () {
    function setupAutoSub() {
        const textarea = document.getElementById("log");
        if (!textarea) return;

        textarea.addEventListener("beforeinput", function (event) {
            if (event.defaultPrevented || !event.cancelable || event.isComposing) return;
            if (event.inputType !== "insertText") return;
            if (typeof SUBSTITUTIONS === "undefined") return;
            if (!Object.prototype.hasOwnProperty.call(SUBSTITUTIONS, event.data)) return;

            const replacement = SUBSTITUTIONS[event.data];
            if (typeof replacement !== "string") return;

            event.preventDefault();
            textarea.setRangeText(replacement, textarea.selectionStart, textarea.selectionEnd, "end");
            // Programmatic edits do not fire input automatically.
            textarea.dispatchEvent(new Event("input", { bubbles: true }));
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setupAutoSub, { once: true });
    } else {
        setupAutoSub();
    }
})();
