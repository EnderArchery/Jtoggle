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
    //console.log(`pressed ${getKey(key)} while robot ${awaitRobot.includes(key)}`)
        if(!awaitRobot.includes(key)){
            if(!held.includes(key)){
                held.push(key)
                keyDownHandler(key)
            }
        }else{
            removeKey(key, awaitRobot)
        }
})

iohook.on("keyup", (evt) => {
    let key = evt.keycode
    //console.log(`released ${getKey(key)} while robot ${awaitRobot.includes(key)}`)
        if(!awaitRobot.includes(key)){
            if(held.includes(key)){
                removeKey(key, held)
                keyUpHandler(key)
            }
        }else{
            removeKey(key, awaitRobot)
        }
})

iohook.start()
writeTriggered()

function keyDownHandler(key){
    possibleTriggers.push(key)
    let timer = setTimeout(function(){
        removeKey(key, possibleTriggers)
    }, triggerSpeed)
    processGroups(key, false)
}

function keyUpHandler(key){
    processGroups(key, true)
    writeTriggered()
}

function processGroups(key, allowTrigger){
    let found = false
    triggerGroups.forEach((group)=>{
        if(group.includes(key)){
            found = true
            group.forEach((key)=>{
                if(triggered.includes(key)){
                    removed.push(key)
                    setState(key, states.up)
                }else if(allowTrigger){
                    if(possibleTriggers.includes(key) && !removed.includes(key)){
                        setState(key, states.down)
                    }
                    removeKey(key, removed)
                }
            })
        }
    })
    return found
}

function setState(key, state){
    let isHeld = held.includes(key)
    switch(state){
        case states.down:
            triggered.push(key)
        break
        case states.up:
            removeKey(key, triggered)
        break
    }
    awaitRobot.push(key)
    robotjs.keyToggle(getKey(key), state)
}

function getKey(key){
    return keys[key] ? keys[key] : key
}

function removeKey(key, array){
    let i = array.indexOf(key)
    if(i>=0){
        array.splice(i, 1)
    }
}

function writeTriggered(){
    process.stdout.cursorTo(0, 0, () => {
        process.stdout.clearScreenDown(()=>{
            console.log("Toggled: ")
            triggered.forEach((key) => console.log(getKey(key)))
        })
    })
    //console.log("Toggled: ")
    //triggered.forEach((key) => console.log(getKey(key)))
}
