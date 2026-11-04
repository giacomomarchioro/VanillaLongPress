// we assume that the mapping is already loaded, we should have a MAPPING variable.
var currentLetter = null
// we get the textarea
const log = document.getElementById("log");
log.addEventListener("keydown", logKey);
// 
function writeCharacter(e){
    log.value+=e.target.value
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
function logKey(e) {
    if (e.repeat && e.key != "Backspace") {
    // we remove the last letter
    if (deleteLastChr){
        log.value = log.value.slice(0, -1);
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
    }
}
selectField = document.getElementById("selectGly")
selectField.addEventListener("keyup", ({key}) => {
    if (key === "Enter") {
        value = MAPPING[currentLetter][selectField.value]
        log.value+=value
        selectField.value = ""
        lgEl = document.getElementById("log")
        lgEl.focus()
        lgEl.selectionStart = lgEl.value.length;
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