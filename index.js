const iohook = require("iohook")
const robotjs = require("./node_modules/robotjs/index.js")
const [down, up] = ["down", "up"]
let awaitRobot = false
let toggled = []

const toToggle = [29, 42]

iohook.on("keyup", evt => {
    if(awaitRobot){
        awaitRobot = false
    }else if(toToggle.includes(evt.keycode)){
         toggle(evt.keycode)
    }
})
iohook.start()
writeToggled()

function toggle(key){
    let removed = []
    toggled.forEach((key) => {
        setKeyState(key, up)
        removed.push(key)
    })
    if(!removed.includes(key)){
        setKeyState(key, down)
    }
    writeToggled()
}

async function setKeyState(key, state){
    if(state == up){
        awaitRobot = true
        do{
            i = toggled.indexOf(key)
            toggled.splice(i, 1)
        }while(i)
    }else if(state == down){
        toggled.push(key)
    }
    robotjs.keyToggle(getKey(key), state)
}

function getKey(key){
    switch(key){
        case 29:
            return "control"
        break
        case 42:
            return "shift"
        break
        default:
            return key
        break
    }
}

function writeToggled(){
    process.stdout.cursorTo(0, 0, () => {
        process.stdout.clearScreenDown(()=>{
            console.log("Toggled: ")
            toggled.forEach((key) => console.log(getKey(key)))
        })
    })
}