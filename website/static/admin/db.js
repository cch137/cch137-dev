var DB
var page = {
    'startTime': new Date(),
    'activeCell': null,
    'editing': false,
    'sheet': null,
    'nCol': 26,
    'nRow': 1000,
    'clipBoard': null,
    'copyingCell': null,
    'cutting': false,
    'undoList': [],
    'redoList': [],
    'isMobile': window.screen.width <= 500
}

function copyToClipboard(text) {
    let x = document.createElement('input')
    x.value = text
    page['clipBoard'] = text
    document.body.appendChild(x)
    x.select()
    document.execCommand('copy')
    document.body.removeChild(x)
    return text
}

function init() {
    let data = document.getElementById('data').innerHTML.split('\n')
    
    for (let i = 0; i < data.length; i++) {
        data[i] = data[i].split('\t')
        if (data[i].length > page['nCol']) {
            page['nCol'] = data[i].length
        }
    }
    while (data[data.length - 1].length == 1 && data[data.length - 1][0] == '') data.pop()
    if (data.length > page['nRow']) page['nRow'] = data.length

    let table = document.createElement('table'), thead = document.createElement('thead'), tbody = document.createElement('tbody'), tfoot = document.createElement('tfoot'), tr = document.createElement('tr'), td
    
    tr.appendChild(indexCell())
    for (let i = 0; i < page['nCol']; i++) {
        td = indexCell(numToAbc(i + 1))
        tr.appendChild(td)
    }
    thead.appendChild(tr)

    for (let i = 0; i < page['nRow']; i++) {
        tr = document.createElement('tr')
        td = indexCell(i + 1)
        tr.appendChild(td)
        for (let j = 0; j < page['nCol']; j++) {
            td = document.createElement('td')
            td.classList.add('cell')
            try {
                if (data[i][j] == undefined) data[i][j] = ''
                td.innerText = data[i][j]
            }
            catch {
                td.innerText = ''
            }
            tr.appendChild(td)
        }
        tbody.appendChild(tr)
    }
    tbody.onmousedown = function(e) {
        selectCell(e.target)
    }
    tbody.ondblclick = function(e) {
        focusCell(e.target)
    }

    page['sheet'] = table
    table.append(thead,tbody,tfoot)
    table.setAttribute('cellspacing',1)
    document.body.innerHTML = ''
    document.body.appendChild(table)

    td = tbody.getElementsByClassName('cell')
    page['activeCell'] = td[1]
    selectCell(td[0])
    label()
}

function indexCell(y='') {
    let x = document.createElement('td')
    x.innerText = y
    x.classList.add('index')
    return x
}

function label(sheetname='cell') {
    let table = page['sheet'].getElementsByTagName('tr')
    let td = table[0].getElementsByTagName('td')
    td[0].id = 'selectAll'
    for (let j = 1; j < td.length; j++) {
        td[j].id = `col-${numToAbc(j)}`
    }
    for (let i = 1; i < table.length; i++) {
        td = table[i].getElementsByTagName('td')
        td[0].id = `row-${i}`
        for (let j = 1; j < td.length; j++) {
            td[j].id = `'${sheetname}'!${numToAbc(j)}${i}`
        }
    }
}

document.onkeydown = function(e) {
    let tar = page['activeCell'], action = true
    let coor = parseCoordinate(tar.id) // x, y
    switch (e.key) {
        case 'Enter':
            if (tar.classList[0] == 'cell') {
                if (page['editing'] == false) {
                    focusCell(tar)
                    break
                }
            }
            if (e.shiftKey) {
                if (coor[1] > 1) {
                    coor[1] --
                    selectCell(getCellByCoor(coor))
                }
                break
            }
        case 'ArrowDown':
            if(coor[1] < page['nRow']) {
                if (!page['editing'] || e.key == 'Enter') {
                    coor[1] ++
                    selectCell(getCellByCoor(coor))
                }
            }
            break
        case 'Tab':
            if (e.shiftKey) {
                if (coor[0] > 1) {
                    coor[0] --
                    selectCell(getCellByCoor(coor))
                }
                break
            }
        case 'ArrowRight':
            if(coor[0] < page['nCol']) {
                if (!page['editing'] || e.key == 'Tab') {
                    coor[0] ++
                    selectCell(getCellByCoor(coor))
                }
            }
            break
        case 'ArrowUp':
            if(coor[1] > 1 && !page['editing']) {
                coor[1] --
                selectCell(getCellByCoor(coor))
            }
            break
        case 'ArrowLeft':
            if(coor[0] > 1 && !page['editing']) {
                coor[0] --
                selectCell(getCellByCoor(coor))
            }
            break
        case 'Delete':
            if (!page['editing']) tar.innerHTML = ''
            break
        case 'X':
        case 'x':
        case 'C':
        case 'c':
            if(!page['editing']) {
                if (page['copyingCell']) page['copyingCell'].classList.remove('copying')
                page['copyingCell'] = tar
                tar.classList.add('copying')
                copyToClipboard(tar.innerHTML)
                if (e.key == 'X' || e.key == 'x') {
                    page['cutting'] = true
                }
                else page['cutting'] = false
            }
            else action = false
            break
        case 'V':
        case 'v':
            if(!page['editing']) {
                if (page['clipBoard']) {
                    tar.innerHTML = page['clipBoard']
                    page['copyingCell'].classList.remove('copying')
                }
                if (page['cutting']) {
                    page['copyingCell'].innerHTML = ''
                    page['copyingCell'] = null
                    page['clipBoard'] = null
                }
            }
            else action = false
            break
        default:
            action = false
    }
    if(action) e.preventDefault()
}

setTimeout(init,0)

class sheet {
    constructor (dom) {
        this.nCol = 26
        this.nRow = 100
        
    }
}

class Cell {
    constructor (x, y) {
        this.row = x
        this.col = y
        this.coor = [this.col, this.row]
    }

    remove(obj) {
        obj.parentNode.removeChild(obj)
    }

}

function isInViewport(dom){
    let viewPortHeight = window.innerHeight || documentElement.clientHeight
    let viewPortWidth = window.innerWidth || documentElement.clientWidth
    let { top, left, bottom, right } = dom.getBoundingClientRect()
    return (
        top >=0 &&
        left >=0 &&
        bottom <= viewPortHeight &&
        right <= viewPortWidth
    )
}

function getCellByCoor(coor) {
    return document.getElementById(`'cell'!${numToAbc(coor[0])}${coor[1]}`)
}

function selectCell(tar) {
    if (tar.classList[0] == 'cell') {
        if (page['activeCell'] == tar && page.isMobile) {
            focusCell(tar)
            return 1
        }
        page['activeCell'].removeAttribute('contentEditable')
        page['activeCell'].classList.remove('selected')
        page['activeCell'] = tar
        tar.classList.add('selected')
        page['editing'] = false
    }
    return 0
}

function focusCell(tar) {
    if (page['activeCell'] != tar) selectCell(tar)
    if (tar.classList[0] == 'cell') {
        tar.contentEditable = true
        page['editing'] = true
        let sel = window.getSelection()
        let range = document.createRange()
        sel.removeAllRanges()
        range.selectNodeContents(tar)
        range.collapse(false)
        sel.addRange(range)
        tar.focus()
    }
}

function parseCoordinate(coor) {
    let abc, i = 0, base = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    coor = coor.split('\'!')[1]
    while (base.indexOf(coor[++i]) != -1);
    abc = coor.substring(0,i)
    num = parseInt(coor.substring(i))
    return [abcToNum(abc),num]
}

function numToAbc(num=0) {
    if (!num) return ''
    let abc = [], n
    while (num > 0) {
        n = num % 26
        abc.push("ZABCDEFGHIJKLMNOPQRSTUVWXY"[n])
        num = Math.floor(num/26)
        if (n == 0) {
            num -= 1
        }
    }
    return abc.reverse().join('')
}

function abcToNum(abc=0) {
    let num = 0, base = "ABCDEFGHIJKLMNOPQRSTUVWXYZ", bit = 0
    abc = abc.split('')
    while (abc.length) {
        num += (base.indexOf(abc.pop()) + 1) * Math.pow(26, bit++)
    }
    return num
}