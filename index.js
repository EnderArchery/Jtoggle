const iohook = require("iohook")
const robotjs = require("./node_modules/robotjs/index.js")
const states = {down: "down", up: "up"}
const keys = {29: "control", 42: "shift"}
const awaitRobot = []
const held = []
const possibleTriggers = []
const triggered = []
const removed = []
let processing = false

const triggerGroups = [
    [
        29,
        42
    ]
]

const triggerSpeed = 150

iohook.on("keydown", (evt) => {
    let key = evt.keycode
    if(!awaitRobot.includes(key)){
        if(!held.includes(key)){
            held.push(key)
            if(!processing){
                processing = true
                keyDownHandler(key)
                processing = false
            }
        }
    }else{
        removeKey(key, awaitRobot)
    }
})

iohook.on("keyup", (evt) => {
    let key = evt.keycode
    if(!awaitRobot.includes(key)){
        if(held.includes(key)){
            removeKey(key, held)
            if(!processing){
                processing = true
                keyUpHandler(key)
                processing = false
            }
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
    let found = []
    let done = false
    triggerGroups.forEach((group)=>{
        if(group.includes(key)){
            group.forEach((key)=>{
                if(!found.includes(key)){
                    found.push(key)
                    if(triggered.includes(key)){
                        removed.push(key)
                        setState(key, states.up)
                    }else if(allowTrigger){
                        if(possibleTriggers.includes(key) && !removed.includes(key) && !done){
                            done = true
                            setState(key, states.down)
                        }
                    }
                    if(allowTrigger){
                        removeKey(key, removed)
                    }
                }
            })
        }
    })
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
    if(i >= 0){
        array.splice(i, 1)
    }
}

function writeTriggered(){
    //process.stdout.cursorTo(0, 0, ()=>{
    //    process.stdout.clearScreenDown(()=>{
            console.log("Toggled: ")
            triggered.forEach((key) => console.log(getKey(key)))
    //    })
    //})
}