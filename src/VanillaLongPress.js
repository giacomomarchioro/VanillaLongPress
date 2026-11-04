// we assume that the mapping is already loaded, we should have a MAPPING variable.
var currentLetter = null
// we get the textarea
const log = document.getElementById("log");
log.addEventListener("keydown", logKey);
// Insert at the textarea's selection, which is preserved while choosing a number.
function insertCharacter(character){
    log.setRangeText(character, log.selectionStart, log.selectionEnd, "end")
    log.focus()
}
function writeCharacter(e){
    insertCharacter(e.currentTarget.value)
}
function populate(key){
    btndiv = document.getElementById("buttonslist")
    btndiv.innerHTML = ""
    for (let index = 0; index < MAPPING[key].length; index++) {
        const btn = document.createElement('button');
        btn.value = MAPPING[key][index]
        if (key != "<"){
            btn.innerHTML = MAPPING[key][index] + "<sup>" + index + "</sup>"
        }else{
            btn.innerHTML = "◌"+MAPPING[key][index] + "<sup>" + index + "</sup>"
        }
        btn.addEventListener("click", writeCharacter);
        btndiv.appendChild(btn)
    }
}
var  deleteLastChr = true
var characterStart = null
function logKey(e) {
    if (!Object.prototype.hasOwnProperty.call(MAPPING, e.key)) return
    if (e.repeat && e.key != "Backspace") {
    // Remove the held letter where it was typed, not at the end of the text.
    if (deleteLastChr){
        if (characterStart === null) return
        log.setRangeText("", characterStart, characterStart + e.key.length, "end")
        deleteLastChr = false
    }
    // we prevent for inserting the normal letter
    e.preventDefault();
    // now we should select the correct glyph
    // log.value += "&"
    // log.value +=MAPPING[e.key]
    currentLetter = e.key
    populate(e.key)
    document.getElementById("selectGly").focus()
    document.getElementById("selectGly").select()
    }else{
        deleteLastChr = true
        characterStart = log.selectionStart
    }
}
selectField = document.getElementById("selectGly")
selectField.addEventListener("keyup", ({key}) => {
    if (key === "Enter") {
        value = MAPPING[currentLetter][selectField.value]
        insertCharacter(value)
        selectField.value = ""
    }else{
        btndiv = document.getElementById("buttonslist")
        for (let index = 0; index < btndiv.childNodes.length; index++) {
            btn = btndiv.children[index]
            if(selectField.value == index){
                btn.style.backgroundColor = 'orange'
            }else{
                btn.style.backgroundColor = ''
            }
        }
    }
})
