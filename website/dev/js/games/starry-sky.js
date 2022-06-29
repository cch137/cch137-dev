window.onload = function() {
    for (let i = 0; i < 2048; i ++) {
        new_cell()
    }
}

function new_cell() {
    history.replaceState(0,0,location.pathname)
    const rand_x = Math.random()
    const rand_y = Math.random()
    const rand_rgb = []
    for (let i = 0; i < 3; i ++) {
        rand_rgb.push(`${Math.random() * 255}`)
    }
    const style =  `--x: ${rand_x}; --y: ${rand_y}; --color: rgb(${rand_rgb.join(',')})`
    
    const el = document.createElement('div')
    el.classList.add('cell')
    el.style = style

    document.body.appendChild(el)
    
    setTimeout(new_cell,0)
}