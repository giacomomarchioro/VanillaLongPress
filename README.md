# VanillaLongPress Keyboard
The aim of this respository is to allow to input more easilly in text areas of an a HTML page characters without switching the keyboardlayout.

Hold down a supported key until its alternatives appear.
The user can then select the desired charachter using the numeric label.

Similar approaches have been developed in the past, see [ApplePressAndHold accent menu](https://support.apple.com/en-qa/guide/mac-help/mh27474/mac)
and [jQuery Longpress](https://github.com/vaidik/jquery-longpress) here we offer an implementation using Vanilla Javascript.


# Charachter mapping
To modify the character mapping create or modify a Javascript file.

# Optional typing helpers
The [combined MUFI demo](examples/MUFICombined.html) loads three independent layers:

- `src/VanillaLongPress.js` with `mapping/MUFI/simple_mapping.js`: long-press alternatives.
- `src/AutoSub.js` with `mapping/MUFI/substitutions.js`: substitutions such as `e` → `ꝫ`.
- `src/Commands.js` with `mapping/MUFI/commands.js`: commands such as `<per<` → `⸪`.

Load each mapping before its script. Scripts target the textarea with `id="log"`;
they can be omitted independently. AutoSub and Commands can be loaded in either order,
including in the document head. The original MUFI demo loads only LongPress.

Commands keep text literal between two `<` characters, suspending AutoSub there.
Unknown commands remain unchanged. Backspace edits the command; removing its opening
`<`, moving the cursor, clicking, leaving the field, or pressing Escape cancels command
mode. Holding `<` cancels it too, allowing the LongPress diacritics menu to open.
Paste and composition input are not substituted and cancel command mode.
For example, define `COMMANDS = { "<per<": "ꝑ" }` for a different replacement.

These helpers use `setRangeText()`; native undo behavior needs browser testing.
LongPress currently assumes automatic replacements have the same UTF-16 length as
the original key (as in the supplied MUFI mapping).

Run helper tests with `node --test tests/typing.test.cjs`.

# Notes for Mac user 
You can disable ApplePressAndHold:
```
defaults write com.google.Chrome ApplePressAndHoldEnabled -bool false
defaults read com.google.Chrome ApplePressAndHoldEnabled
```
# Demos
A demo of the application can be accessed [here](https://giacomomarchioro.github.io/VanillaLongPress/)
