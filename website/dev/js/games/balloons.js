var map, score
var village = {}

const minSize = 10
const maxSize = 30
const gapSize = maxSize - minSize
const b64char = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_'

history.replaceState(0,0,`${document.location.origin}${document.location.pathname}`)

window.onload = function() {
    map = document.getElementById('map')
    map.style.setProperty('--maxSize',`${maxSize}px`)
    map.style.setProperty('--minSize',`${minSize}px`)
    score = document.getElementById('score')
    saveScore(readScore())
    // score.ondblclick= function() {
    //     if(confirm('Reset score?')) {
    //         saveScore(0)
    //     }
    // }
    let x = window.innerWidth * window.innerHeight / 10000
    if (x < 16) x = 16
    // if (x > 128) x = 128
    for (let i = 0; i < x; i++) {
        spawn()
    }
    setTimeout(() => {
        map.classList.add('genesis')
    },500)
    setTimeout(() => {
        map.classList.remove('sleeping')
        map.classList.remove('genesis')
        map.classList.add('allowGlow')
    },1000)
}

function randomRGB() {
    return `rgb(${randRgbUnit()},${randRgbUnit()},${randRgbUnit()})`
}
function randRgbUnit() {
    return 100+Math.random()*155
}

function villagerNamer(bits=8) {
    let n = []
    for (let i = 0; i < bits; i ++) {
        n.push(b64char[Math.floor(Math.random()*64)])
    }
    return n.join('')
}

function spawn(jump=0) {
    const el = document.createElement('div')
    let n = villagerNamer()
    const f = 500 + Math.random() * 500
    while (n in village) {
        n = villagerNamer()
    }
    village[n] = el
    el.id = n
    el.classList.add('villager')
    el.style.setProperty('--x',`${window.innerWidth/2}px`)
    el.style.setProperty('--y',`${window.innerHeight/2}px`)
    el.style.setProperty('--size',`${minSize+Math.random()*gapSize}px`)
    el.style.setProperty('--step',`${1+Math.random()*4}`)
    el.style.setProperty('--item-bg',randomRGB())
    el.style.setProperty('--frequency',`${f/1000*2}s`)
    el.style.setProperty('--energy',`${el.style.getPropertyValue('--step') / (f/1000*2)}`)
    el.style.setProperty('--score',`${Math.ceil(gapSize * el.style.getPropertyValue('--energy') / el.style.getPropertyValue('--size').replace('px',''))}`)
    el.onclick = function() {
        kill(el.id,true)
    }
    if (jump) {
        el.style.setProperty('--x',`${Math.random()*window.innerWidth}px`)
        el.style.setProperty('--y',`${Math.random()*window.innerHeight}px`)
    }
    map.appendChild(el)
    wander(el,f)
    for (let i = 0; i < 4; i++) {
        wander(el,f,true)
    }
    return el
}

function wander(el,f,once=false) {
    setTimeout(() => {
        const size = el.style.getPropertyValue('--size').replace('px','') * 1
        const step = el.style.getPropertyValue('--step') * 1
        let x = el.style.getPropertyValue('--x').replace('px','') * 1
        let y = el.style.getPropertyValue('--y').replace('px','') * 1
        x += step * ((Math.random() * 2 * size) - size)
        y += step * ((Math.random() * 2 * size) - size)
        if (x < 0) x = 0
        if (y < 0) y = 0
        if (x > window.innerWidth) x = window.innerWidth
        if (y > window.innerHeight) y = window.innerHeight
        el.style.setProperty('--x',`${x}px`)
        el.style.setProperty('--y',`${y}px`)
        if(!once) wander(el,f)
    },f)
}

function kill(v,respawn=false) {
    const el = village[v]
    saveScore(readScore() + el.style.getPropertyValue('--score') * 1)
    el.classList.add('dying')
    delete village[el.id]
    setTimeout(() => {
        el.parentNode.removeChild(el)
    },500)
    if (respawn) {
        const newV = spawn(1)
        newV.classList.add('dying')
        setTimeout(() => {
            newV.classList.remove('dying')
        },250)
        return newV
    }
    return v
}

function readScore() {
    return DocCookies.getItem('score') * 1 || 0
}

function saveScore(v) {
    score.innerText = v
    return DocCookies.setItem('score',v,Infinity,'./')
}