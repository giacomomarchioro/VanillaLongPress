# VanillaLongPress Keyboard
The aim of this respository is to allow to input more easilly in text areas of an a HTML page characters without switching the keyboardlayout.

Hold down a supported key until its alternatives appear.
The user can then select the desired charachter using the numeric label.

Similar approaches have been developed in the past, see [ApplePressAndHold accent menu](https://support.apple.com/en-qa/guide/mac-help/mh27474/mac)
and [jQuery Longpress](https://github.com/vaidik/jquery-longpress) here we offer an implementation using Vanilla Javascript.


# Charachter mapping
To modify the character mapping create or modify a Javascript file.

# Notes for Mac user 
You can disable ApplePressAndHold:
```
defaults write com.google.Chrome ApplePressAndHoldEnabled -bool false
defaults read com.google.Chrome ApplePressAndHoldEnabled
```

