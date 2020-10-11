const iohook = require("iohook")
const robotjs = require("./node_modules/robotjs/index.js")
const states = {down: "down", up: "up"}
const keys = {29: "control", 42: "shift"}
const awaitRobot = []
const held = []
const possibleTriggers =[]
const triggered = []
const removed = []

const triggerGroups = [
    [
        29,
        42
    ]
]

const triggerSpeed = 150

iohook.on("keydown", (evt) => {
    let key = evt.keycode
    if(!held.includes(key)){
        held.push(key)
        if(!awaitRobot.length){
            keyDownHandler(key)
        }else{
            removeKey(key, awaitRobot)
        }
    }
})

iohook.on("keyup", (evt) => {
    let key = evt.keycode
    if(held.includes(key)){
        let i = held.indexOf(key)
        held.splice(i, 1)
        if(!awaitRobot.length){
            keyUpHandler(key)
        }else{
            removeKey(key, awaitRobot)
        }
    }
})

iohook.start()
writeTriggered()

function keyDownHandler(key){
    possibleTriggers.push(key)
    let timer = setTimeout(function(){
        removeKey(key, possibleTriggers)
    }, triggerSpeed)
    keyRelease(key)
}

function keyUpHandler(key){
    if(keyRelease(key)){
        if(possibleTriggers.includes(key) && !removed.includes(key)){
            setState(key, states.down)
        }
    }
    removed.splice(0, removed.length)
    writeTriggered()
}

function keyRelease(key){
    let found = false
    triggerGroups.forEach((group)=>{
        if(group.includes(key)){
            found = true
            group.forEach((key)=>{
                if(triggered.includes(key)){
                    removed.push(key)
                    setState(key, states.up)
                }
            })
        }
    })
    return found
}

function setState(key, state){
    switch(state){
        case states.down:
            triggered.push(key)
            awaitRobot.push(key)
        break
        case states.up:
            removeKey(key, triggered)
        break
    }
    robotjs.keyToggle(getKey(key), state)
}

function getKey(key){
    return keys[key] ? keys[key] : key
}

function removeKey(key, array){
    let i = array.indexOf(key)
    array.splice(i, 1)
}

function writeTriggered(){
    process.stdout.cursorTo(0, 0, () => {
        process.stdout.clearScreenDown(()=>{
            console.log("Toggled: ")
            triggered.forEach((key) => console.log(getKey(key)))
        })
    })
}
