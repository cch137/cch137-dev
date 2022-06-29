function post_renderer(ctn) {
    for (const i of ctn.querySelectorAll('.unrendered')) {
        text_render(i)
        i.classList.replace('unrendered','rendered')
    }
    for (const i of ctn.querySelectorAll('img')) {
        if (i.draggable) {
            i.draggable = false
        }
    }
}

function text_render(el) {
    const lines = el.innerText.split('\n')
    const y = []
    let x = []
    for (const i of lines) {
        for (const j of split_line(i)) {
            if (is_url(j)) {
                if (x.length) {
                    y.push(create_span(x.join('')))
                    x = []
                }
                y.push(create_a(j,j))
            }
            else {
                x.push(j)
            }
        }
        if (x.length) {
            y.push(create_span(x.join('')))
            x = []
        }
        y.push(create_br())
    }
    el.innerHTML = ''
    for (const i of y) {
        el.appendChild(i)
    }
    return y
}

function create_br() {
    return document.createElement('br')
}

function create_span(text,classList=[]) {
    const x =document.createElement('span')
    x.innerText = text
    for (const i of classList) {
        x.classList.add(i)
    }
    return x
}

function create_a(link,text,classList=[]) {
    const x =document.createElement('a')
    const reg = /(https?|ftp|file):\/{2}/g
    if (!(reg.test(link))) {
        link = `http:\/\/${link}`
    }
    x.href = link
    x.innerText = text
    x.rel = 'noopener noreferrer'
    x.target = '_blank'
    for (const i of classList) {
        x.classList.add(i)
    }
    return x
}

function is_url(url) {
    const reg = /((https?|ftp|file):\/\/)?([-A-Z0-9\.]{2,256}\.)?[-A-Z0-9]{2,256}\.[A-Z]{2,6}(\/[-A-Z0-9+&@#/%?=~_|!.,:;\u0250-\uffff]{1,})?\/?(?!\w|\S)/gi
    return reg.test(url)
}

function split_line(s) {
    const y = []
    let x = []
    for (const i of s) {
        if (/\s/.test(i)) {
            y.push(x.join(''))
            x = []
            y.push(i)
        }
        else {
            x.push(i)
        }
    }
    if (x.length) {
        y.push(x.join(''))
    }
    return y
}