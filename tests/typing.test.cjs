const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Minimal textarea/event model: capture listeners precede ordinary listeners.
function editor(scripts, loading = false, mappings = {}) {
    const listeners = {};
    const documentListeners = [];
    const textarea = {
        value: '', selectionStart: 0, selectionEnd: 0,
        addEventListener(type, callback, capture = false) {
            (listeners[type] ??= []).push({ callback, capture: capture === true });
        },
        dispatchEvent(event) {
            if (event.type === 'beforeinput') {
                event.target = this;
                documentListeners.forEach(callback => callback(event));
            }
            for (const capture of [true, false]) {
                for (const listener of listeners[event.type] ?? []) {
                    if (listener.capture === capture) listener.callback(event);
                }
            }
        },
        setRangeText(text, start, end) {
            this.value = this.value.slice(0, start) + text + this.value.slice(end);
            this.selectionStart = this.selectionEnd = start + text.length;
            // Browsers may notify selection changes during setRangeText itself.
            this.dispatchEvent(new Event('select'));
        }
    };
    const ready = [];
    const document = {
        readyState: loading ? 'loading' : 'complete',
        getElementById: () => textarea,
        addEventListener(type, callback) {
            if (type === 'beforeinput') documentListeners.push(callback);
            else ready.push(callback);
        }
    };
    const context = vm.createContext({ document, Event,
        SUBSTITUTIONS: { e: 'ꝫ', s: 'ſ' }, COMMANDS: { '<per<': 'ꝑ' }, ...mappings });
    for (const script of scripts) {
        vm.runInContext(fs.readFileSync(path.join(__dirname, '../src', script), 'utf8'), context);
    }
    ready.forEach(callback => callback());
    function input(data, options = {}) {
        const event = { type: 'beforeinput', inputType: 'insertText', data,
            cancelable: true, preventDefault() { this.defaultPrevented = true; }, ...options };
        textarea.dispatchEvent(event);
        if (!event.defaultPrevented) {
            const start = textarea.selectionStart;
            if (event.inputType === 'deleteContentBackward') {
                textarea.setRangeText('', Math.max(0, start - 1), textarea.selectionEnd);
            } else if (data) {
                textarea.setRangeText(data, start, textarea.selectionEnd);
            }
            textarea.dispatchEvent(new Event('input'));
        }
    }
    return { textarea, input, type(text) { for (const char of text) input(char); } };
}

for (const scripts of [['AutoSub.js', 'Commands.js'], ['Commands.js', 'AutoSub.js']]) {
    test(`commands suspend substitutions: ${scripts.join(', ')}`, () => {
        const e = editor(scripts, true);
        e.type('e<per<e<unknown<e');
        assert.equal(e.textarea.value, 'ꝫꝑꝫ<unknown<ꝫ');
    });
}

test('helpers work independently', () => {
    const auto = editor(['AutoSub.js']);
    auto.type('<per<');
    assert.equal(auto.textarea.value, '<pꝫr<');
    const commands = editor(['Commands.js']);
    commands.type('e<per<e');
    assert.equal(commands.textarea.value, 'eꝑe');
    const missing = editor(['Commands.js', 'AutoSub.js'], false,
        { COMMANDS: undefined, SUBSTITUTIONS: undefined });
    missing.type('<per<e');
    assert.equal(missing.textarea.value, '<per<e');
});

test('backspace corrects commands and deleting opening delimiter cancels', () => {
    const e = editor(['AutoSub.js', 'Commands.js']);
    e.type('<pex');
    e.input(null, { inputType: 'deleteContentBackward' });
    e.type('r<');
    assert.equal(e.textarea.value, 'ꝑ');
    e.type('<');
    e.input(null, { inputType: 'deleteContentBackward' });
    e.type('e');
    assert.equal(e.textarea.value, 'ꝑꝫ');
});

test('commands replace only their range and respect selected text', () => {
    const e = editor(['Commands.js', 'AutoSub.js']);
    e.textarea.value = 'abc XYZ';
    e.textarea.selectionStart = 4;
    e.textarea.selectionEnd = 7;
    e.type('<per<');
    assert.equal(e.textarea.value, 'abc ꝑ');
    assert.equal(e.textarea.selectionStart, 5);
});

test('navigation, selection, blur, pointer and long-press cancel commands', () => {
    for (const event of [new Event('blur'), new Event('pointerdown'),
        { type: 'keydown', key: 'ArrowLeft' }, { type: 'keydown', key: 'Escape' },
        { type: 'keydown', key: '<', repeat: true }]) {
        const e = editor(['AutoSub.js', 'Commands.js']);
        e.type('<p');
        e.textarea.dispatchEvent(event);
        e.type('e');
        assert.equal(e.textarea.value, '<pꝫ');
    }
    const e = editor(['Commands.js', 'AutoSub.js']);
    e.type('<p');
    e.textarea.selectionStart = e.textarea.selectionEnd = 0;
    e.textarea.dispatchEvent(new Event('select'));
    e.type('e');
    assert.equal(e.textarea.value, 'ꝫ<p');
});

test('paste and composition stay literal and cancel command mode', () => {
    for (const options of [{ inputType: 'insertFromPaste' }, { isComposing: true }]) {
        const e = editor(['AutoSub.js', 'Commands.js']);
        e.type('<p');
        e.input('e', options);
        e.type('e');
        assert.equal(e.textarea.value, '<peꝫ');
    }
});

test('input notifications and empty command replacements', () => {
    const e = editor(['AutoSub.js', 'Commands.js'], false, { COMMANDS: { '<per<': '' } });
    let notifications = 0;
    e.textarea.addEventListener('input', () => notifications++);
    e.type('<per<e');
    assert.equal(e.textarea.value, 'ꝫ');
    assert.equal(notifications, 6);
});
