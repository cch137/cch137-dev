const table64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

function range(a,b,c) {
    // for i in range(10)
    // for i in range(2,10)
    // for i in range(2,10,2)
    if (b == undefined) {
        b = a
        a = 0
    }
    if (!c) {
        c = 1
    }
    const x = []
    for (let i = a; i < b; i += c) {
        x.push(i)
    }
    return x
}

function randomName(d=8) {
    const s = []
    for (const i of range(d)) {
        s.push(table64[Math.floor(Math.random() * table64.length)])
    }
    return s.join('')
}

function random_rgb(init,final) {
    return `rgb(${rand_rgb_unit(init,final)},${rand_rgb_unit(init,final)},${rand_rgb_unit(init,final)})`
}

function rand_rgb_unit(init,final) {
    return init + Math.random() * (final - init)
}