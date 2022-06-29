// function readFile(f) {
//     const reader = new FileReader()
//     reader.onload = function() {
//         const x = document.createElement('img')
//         x.src = this.result
//         x.alt = f.name
//         x.className = 'image-preview'
//         document.body.append(x)
//     }
//     reader.readAsDataURL(f)
//     return reader
// }

/* file size string */
function fileSizeStr(v) {
    let prefix = 0
    while (v>1000&&prefix<4) {
        v /= 1024
        prefix++
    }
    return`${v.toFixed(2)} ${['','K','M','G','T'][prefix]}B`
}

function get_folder(item_id) {
    const xhr = new XMLHttpRequest()
    xhr.open('post','/drive/',false)
    xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=UTF-8;")
    xhr.send(`action=get-folder&item_id=${item_id||''}`)
    return JSON.parse(xhr.responseText)
}

function delete_item(item_id) {
    const xhr = new XMLHttpRequest()
    xhr.open('post','/drive/',false)
    xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=UTF-8;")
    xhr.send(`action=delete&item_id=${item_id}`)
}

function getFilePath(item_id) {
    return `${root_path}${item_id}`
}

function openFile(item_id) {
    return window.open(getFilePath(item_id))
}

function closeMenu() {
    const el = Page.file_menu
    if (el.classList.contains('opened')) {
        el.classList.remove('opened')
    }
}

function buildList() {
    Page.data = get_folder()
    const items = Page.data.list
    let v = document.createElement('div')
    v.id = 'view'
    Page.view.replaceWith(v)
    Page.view = v
    let x = (new DOMParser()).parseFromString(Page.template,'text/html')
    x = x.getElementsByClassName('item')[0]
    Page.view.appendChild(x)
    // create view list
    Vue.createApp({
        data() {
            const x = []
            for (const i in items) {
                items[i].item_id = i
                if (items[i].size) {
                    items[i].size = fileSizeStr(+items[i].size)
                }
                x.push(items[i])
            }
            return {
                items: x
            }
        },
        methods: {
            activate(e) {
                const el = e.currentTarget
                const cur_item = Page.current_item || el
                if (!(el.classList.contains('selected'))) {
                    cur_item.classList.remove('selected')
                    el.classList.add('selected')
                    Page.current_item = el
                }
            },
            open_menu(key) {
                Page.current_item_id = key
                const e = event
                e.preventDefault()
                this.activate(e)
                Page.file_menu.style.setProperty('--x',`${e.clientX}px`)
                Page.file_menu.style.setProperty('--y',`${e.clientY}px`)
                Page.file_menu.classList.add('opened')
            },
            close_menu() {
                closeMenu()
            },
            openItem(item_id) {
                openFile(item_id)
            }
        }
    }).mount('#view')
}

function unselected_item() {
    try {
        Page.current_item.classList.remove('selected')
    }
    catch(e){}
}

const Page = {
    cmd_url: '/drive/',
    view: 0,
    file_menu: 0,
    current_item: 0,
    current_item_id: 0,
    upload: {
        ctn: 0,
        btn: 0,
        form: 0
    },
    data: 0
}

const root_path = '/drive/d/'

window.onload = function() {
    history.replaceState(0,0,location.pathname)
    // declare Page
    Page.view = document.getElementById('view')
    Page.template = Page.view.innerHTML

    // file_menu
    Page.file_menu = document.getElementById('file_menu')
    Page.file_menu.oncontextmenu = function(e){e.preventDefault()}
    Page.file_menu.querySelector('[href="open"]').onclick = function() {
        openFile(Page.current_item_id)
    }
    Page.file_menu.querySelector('[href="download"]').onclick = function() {
        let x = document.createElement('a')
        x.href = getFilePath(Page.current_item_id)
        x.download = 'new'
        x.click()
        x.remove()
    }
    Page.file_menu.querySelector('[href="rename"]').onclick = function() {
        alert('暂不支援此功能')
    }
    Page.file_menu.querySelector('[href="delete"]').onclick = function() {
        delete_item(Page.current_item_id)
        buildList()
    }
    document.body.onclick = function() {
        closeMenu()
    }
    document.querySelector('header').onclick = unselected_item
    document.querySelector('#sidebar').onclick = unselected_item
    document.querySelector('#infobar').onclick = unselected_item

    // files upload
    Page.upload.ctn = document.querySelector('#upload')
    Page.upload.form = Page.upload.ctn.querySelector('form')
    Page.upload.btn = Page.upload.form.querySelector('input[type="file"]')
    Page.upload.ctn.onclick = function() {
        Page.upload.btn.click()
    }
    Page.upload.btn.onchange = function() {
        // UPLOAD FILES
        let form = new FormData()
        let x = 0
        for (const i of Page.upload.btn.files) {
            form.append(x++,i)
        }
        form.append('action','upload')
        Page.upload.form.reset()
        x = new XMLHttpRequest()
        x.open('post',Page.cmd_url,false)
        x.onload = function() {
            buildList()
        }
        x.upload.onprogress = function(e) {
            console.log(Math.round(e.loaded/e.total*100)/100)
        }
        x.upload.onloadend = function() {
            console.log('Sending')
        }
        x.send(form)
    }
    
    buildList()

    // file upload
    // Page.view.ondrop = function(e) {
    //     console.log('hello')
    //     e.preventDefault()
    //     let f = 0
    //     if (e.dataTransfer.items) {
    //         for (const i of e.dataTransfer.items) {
    //             if (i.kind === 'file') {
    //                 f = i.getAsFile()
    //                 break
    //             }
    //         }
    //     } else if (e.dataTransfer.files) {
    //         f = e.dataTransfer.files[0]
    //     }
    //     if (f) {
    //         f = readFile(f)
    //         console.log(f)
    //     }
    // }
}

