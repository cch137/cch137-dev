var VIEW = undefined, PATHNAME = '', TREE = '', ROOT_PATH = '/admin/os/', CURRENT_PATH = {}
const appName = '137DB'

function pin() {
    const x = new XMLHttpRequest
    x.open('post',`/admin/`,true)
    // x.onerror = function() {
    //     console.warn('Request error.')
    // }
    x.onload = function() {
        console.log(x.responseText)
    }
    x.send()
}

window.onload = function() {
    VIEW = document.querySelector('#view')
    PATHNAME = document.querySelector('#pathname')
    let f = document.getElementById('data')
    TREE = JSON.parse(f.innerText)
    f.parentNode.removeChild(f)
    f = document.location.pathname
    while (['/','.'].indexOf(f[f.length-1]) != -1) {
        f = f.slice(0,f.length-1)
    }
    history.replaceState(0,0,`${document.location.origin}${f}`)
    buildView(currentPath())
}

function currentPath() {
    return document.location.pathname.replace(ROOT_PATH,'').replace(ROOT_PATH.slice(0,ROOT_PATH.length-1),'')
}

function buildListItem(obj,filename=null) {
    if (!filename) {
        filename = obj.path.split('/').pop()
    }
    let filetype = 'file'
    if (obj.isdir) {
        filetype = 'folder'
    }
    let x = buildElement('a','item',[buildItemIcon(filetype),buildElement('div','item-name',filename)])
    let y = CURRENT_PATH
    if (y) {
        y += '/'
    }
    if (obj.isdir) {
        x.href = `javascript:buildList('${ROOT_PATH}${y}${obj.path}')`
    }
    else {
        x.href = `${ROOT_PATH}${y}${obj.path}`
        x.target = '_blank'
        if (obj.mimetype) {
            x.title = obj.mimetype
        }
    }
    return x
}

function buildList(url_path='') {
    const path = url_path.replace(ROOT_PATH,'')
    document.title = `${appName}/${path}`
    history.replaceState(0,0,`${ROOT_PATH}${path}`)

    // 发送请求获得文件路径目录，建立视窗列表
    // 如果不在 TREE 中存在则等待请求完成后，再建立视窗列表
    const xhr = new XMLHttpRequest, newPath = !TREE[path]
    xhr.open('post',`${url_path}?key=${getKey()}`,true)
    xhr.onerror = function() {
        alert('Request failed.')
        buildView(currentPath())
    }
    xhr.onload = function() {
        if (xhr.responseText) {
            let r = JSON.parse(xhr.responseText), y = r[CURRENT_PATH]
            for (const i in r) {
                TREE[i] = r[i]
            }
            if (newPath) {
                buildView(path)
                return 0
            }
            else {
                if (!y) {
                    return 0
                }
                let x = TREE[CURRENT_PATH], k = []
                for (const i of x) {
                    k.push(i.path)
                }
                x = k
                for (const i of y) {
                    k = x.indexOf(i.path)
                    if (k == -1) {
                        x = [0]
                        break
                    }
                    x.splice(k,1)
                }
                if (x.length == 0) {
                    return 0
                }
                buildView(CURRENT_PATH)
                return 1
            }
        }
        document.location = document.location
    }
    xhr.send()
    if(newPath) {
        // 清除列表，添加 Loading...
        clearView()
        VIEW.append(buildElement('span','folder-loading','Loading...'))
        return 1
    }
    buildView(path)
}

function buildView(path) {
    // 清除列表
    clearView()

    // 建立列表物件（文件夹优先）
    let x, y = [], z = []
    CURRENT_PATH = path
    for (const i of TREE[path]) {
        if (i.isdir) {
            VIEW.append(buildListItem(obj=i))
        }
        else {
            y.push(i)
        }
    }

    // 建立列表物件（文件）
    for (const i of y) {
        VIEW.append(buildListItem(obj=i))
    }

    // 更换路径名
    while (PATHNAME.children.length) {
        PATHNAME.removeChild(PATHNAME.children[0])
    }
    if (path) {
        x = buildElement('a','',appName)
        x.draggable = false
        x.href = `javascript:buildList(ROOT_PATH)`
    }
    else {
        x = buildElement('span','',appName)
    }
    PATHNAME.append(x)
    x = path.split('/')
    y = x.pop()
    for (const i of x) {
        z.push(i)
        let k = buildElement('a','',i)
        k.draggable = false
        k.href = `javascript:buildList('${ROOT_PATH}${z.join('/')}')`
        PATHNAME.append(buildElement('span','','/'))
        PATHNAME.append(k)
    }
    PATHNAME.append(buildElement('span','',`/${y}`))

    // 结束
    return 0
}

function clearView() {
    while (VIEW.children.length) {
        VIEW.removeChild(VIEW.children[0])
    }
}

function buildElement(tagname='div',cn='',children=[]) {
    let x = document.createElement(tagname)
    if (cn) {
        if (cn instanceof Array) {
            cn = cn.join(' ')
        }
        x.className = cn
    }
    if (!(children instanceof Array)) {
        children = [children]
    }
    for (const i of children) {
        x.append(i)
    }
    return x
}

function buildItemIcon(key='') {
    key = key.toLowerCase()
    let x = []
    switch (key) {
        case 'folder':
            x = [buildElement('div','icon-folder-1',[buildElement('div','icon-folder-1-1')]),buildElement('div','icon-folder-2')]
            break;
        default:
            x = [buildElement('div','icon-file-none-1'),buildElement('div','icon-file-none-2')]
            break;
    }
    return buildElement('div','item-icon',[buildElement('div',`icon-${key}`,x)])
}