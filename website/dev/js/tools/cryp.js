const Page = {
    params: new URL_PARAMS
}

function an(x) {
    if (x == 'de') {
        return 'en'
    }
    return 'de'
}

function cryp(m) {
    m = m.substring(0,2)
    const x = new XMLHttpRequest()
    document.body.classList.add('lock')
    x.open('POST',location.pathname,true)
    x.setRequestHeader("Content-Type", "application/json");
    x.send(JSON.stringify({
        'type': document.querySelector('#cryp_mode').value,
        'mode': `${m.toUpperCase()}CODE`,
        'text': document.querySelector(`#${an(m)}`).value
    }))
    x.onload = function() {
        document.body.classList.remove('lock')
        if(x.status == 200) {
            document.querySelector(`#${m}`).value = x.responseText
            Page.params.params = {
                'de': document.querySelector(`#de`).value,
                'en': document.querySelector(`#en`).value
            }
            Page.params.pushState()
        }
        else {
            alert('Oops! Something went wrong.')
        }
    }
    return x
}

function writeUrlParams() {
    Page.params.load()
    for (const i in Page.params.params) {
        try {
            document.querySelector(`#${i}`).value = Page.params.get(i)
        }
        catch(e){}
    }
}

function analysis(v) {
    const x = {}, y = {}
    for (const i of v) {
        if (x[i]) {
            x[i] ++
        }
        else {
            x[i] = 1
        }
    }
    for (const i in x) {
        y[i] = Math.round(x[i] / v.length * 10000) / 10000
    }
    console.log(`Length: ${v.length}`)
    console.log('Count:',x,'Statistics:',y)
}

window.onload = function() {
    writeUrlParams()
    Page.params.runWhenPopstate(writeUrlParams)
    for (const i of document.querySelectorAll('.btn-cryp')) {
        i.onclick = function() {
            cryp(this.id)
        }
    }
    for (const i of document.querySelectorAll('.btn-clear')) {
        i.onclick = function() {
            document.querySelector(`#${i.id.substring(0,2)}`).value = ''
        }
    }
    for (const i of document.querySelectorAll('.title')) {
        i.onclick = function() {
            analysis(document.querySelector(`#${i.id.substring(0,2)}`).value)
        }
    }
}