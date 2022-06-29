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

const Page = {
    narrowScreen: false,
    scrolling: {
        gap: 10,
        speed: 5,
        sensitivity: 1,
        running: 0,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        scroll_map: function() {
            const order = Page.scrolling
            if (order.top) {
                order.scroll_top()
            }
            else if (order.bottom) {
                order.scroll_bottom()
            }
            if (order.left) {
                order.scroll_left()
            }
            else if (order.right) {
                order.scroll_right()
            }
            if (order.top||order.bottom||order.left||order.right) {
                setTimeout(Page.scrolling.scroll_map,order.gap)
            }
            else {
                order.running = false
            }
        },
        scroll_top: function() {
            Page.map.scrollTop -= Page.scrolling.speed * Page.scrolling.sensitivity
        },
        scroll_bottom: function() {
            Page.map.scrollTop += Page.scrolling.speed * Page.scrolling.sensitivity
        },
        scroll_left: function() {
            Page.map.scrollLeft -= Page.scrolling.speed * Page.scrolling.sensitivity
        },
        scroll_right: function() {
            Page.map.scrollLeft += Page.scrolling.speed * Page.scrolling.sensitivity
        }
    }
}

window.onload = function() {
    if (screen.width < 500) {
        Page.narrowScreen = true
        document.body.classList.add('isNarrowScreen')
    }
    if ('ontouchstart' in document.documentElement) {
        document.body.classList.add('isTouchScreen')
    }
    setTimeout(map_init,0)
    history.replaceState(0,0,location.pathname)
}

function map_init() {

    const coor = []
    const size = 64
    const initial = -Math.round(size/2)
    const final = Math.round((size/2)+1)

    for (const i of range(initial,final)) {
        const k = []
        for (const j of range(initial,final)) {
            k.push(`${i}_${j}`)
        }
        coor.push(k)
    }

    const app = {
        data() {
            return {
                dir: ['top-scroll','bottom-scroll','left-scroll','right-scroll'],
                coor: coor,
                controls: [
                    {
                        name: '土壤',
                        id: 'place_dirt',
                        item: 'dirt',
                        key: '1',
                        click: app.methods.set_block
                    },
                    {
                        name: '草地',
                        id: 'place_grass',
                        item: 'grass',
                        key: '2',
                        click: app.methods.set_block
                    },
                    {
                        name: '水',
                        id: 'place_water',
                        item: 'water',
                        key: '3',
                        click: app.methods.set_block
                    },
                    {
                        name: '苹果',
                        id: 'place_apple',
                        item: 'apple',
                        key: '4',
                        click: app.methods.place_object
                    },
                    {
                        name: '收获',
                        id: 'harvest',
                        item: '',
                        key: 'Q',
                        click: app.methods.harvest
                    },
                    {
                        name: '迷雾',
                        id: 'delete',
                        item: 'fog',
                        key: 'X',
                        click: app.methods.set_block
                    }
                ]
            }
        },
        methods: {
            close_panel: function() {
                if (panel.classList.contains('play')) {
                    panel.classList.remove('play')
                }
                if (Page.narrowScreen) {
                    map.classList.remove('inactive')
                    map.style = 'transition: none !important;'
                    setTimeout(() => {
                        map.style = ''
                    },0)
                }
            },
            save_block_name: function() {
                try {
                    const input = Page.panel.querySelector('#name')
                    input.innerHTML = input.innerText.split(/\s/g).join(' ')
                    if (Page.selected.classList.contains('block')) {
                        Page.selected.setAttribute('name',input.innerText)
                    }
                }
                catch(e) {
                    console.log(e)
                }
            },
            set_block: function(x) {
                const cl = Page.selected.classList
                if (cl.contains('block')) {
                    if (!cl.contains(x)) {
                        Page.selected.className = `block selected ${x}`
                        cl.add(x)
                    }
                }
                if (Page.narrowScreen) {
                    app.methods.close_panel()
                }
            },
            place_object: function(itemname) {
                const sl = Page.selected
                if (sl.classList.contains('block')) {
                    if (!sl.children.length) {
                        const x = document.createElement('div')
                        x.classList.add('object')
                        x.classList.add(itemname)
                        sl.appendChild(x)
                    }
                }
                if (Page.narrowScreen) {
                    app.methods.close_panel()
                }
            },
            harvest: function(){
                const sl = Page.selected
                if (sl.classList.contains('block')) {
                    const x = []
                    for (const i of sl.children) {
                        x.push(i)
                    }
                    if (x.length) {
                        let y = []
                        x.forEach(function(i){
                            i.classList.remove('object')
                            y.push(i.classList)
                            i.remove()
                        })
                        y = y.join(' ')
                        app.methods.prompt_message(`你收获了一个 ${y}`)
                        return y
                    }
                }
                app.methods.prompt_message(`没有收获`)
                if (Page.narrowScreen) {
                    app.methods.close_panel()
                }
                return false
            },
            close_message: function() {
                if (Page.narrowScreen) {
                    app.methods.close_panel()
                }
                message.classList.remove('play')
                map.classList.remove('inactive')
                map.style = 'transition: none !important;'
                setTimeout(() => {
                    map.style = ''
                },0)
                document.body.appendChild(panel)
            },
            prompt_message: function(text) {
                Page.message_content.innerText = text
                message.classList.add('play')
                map.classList.add('inactive')
                map.appendChild(panel)
            },
            select_block: function(el) {
                if (!el) {
                    return 0
                }
                if (!el.classList.contains('selected')) {
                    const s = document.querySelector('.selected')
                    if (s) {
                        s.classList.remove('selected')
                    }
                    Page.selected = el
                    el.classList.add('selected')
                }
                if (el.classList.contains('block')) {
                    const coor = el.id.split('_')
                    const el_coor = `(${coor[1]},${coor[2]})`
                    const el_name = el.getAttribute('name') || ''
                    if (panel.querySelector('#coor').innerText != el_coor) {
                        panel.querySelector('#coor').innerText = el_coor
                    }
                    if (panel.querySelector('#name').innerText != el_name) {
                        panel.querySelector('#name').innerText = el_name
                    }
                    if (!panel.classList.contains('play')) {
                        panel.classList.add('play')
                        if (Page.narrowScreen) {
                            map.classList.add('inactive')
                        }
                    }
                }
                else {
                    app.methods.close_panel()
                }
            },
            get_block: function(x,y) {
                const coor = ['#',x,y].join('_')
                return map.querySelector(coor)
            },
            typing_start: function() {
                Page.typing = true
            },
            typing_end: function() {
                Page.typing = false
            }
        }
    }
    const game = Vue.createApp(app).mount('#map')

    const map = document.querySelector('#map')
    const panel = document.querySelector('#panel')
    const message = document.querySelector('#message-box')

    const click_short_key = {}
    for (const i of game.controls) {
        click_short_key[i.key] = panel.querySelector(`#${i.id}`)
    }
    
    Page.click_short_key = click_short_key

    Page.game = game
    Page.map = map
    Page.panel = panel
    Page.message = message
    Page.message_content = Page.message.querySelector('#message-content')
    document.body.appendChild(panel)
    document.body.appendChild(message)

    const scroll = Page.scrolling
    for (const i of document.querySelectorAll('.scroll-detect')) {
        const _id = i.id.split('-')[0]
        i.onmouseenter = function() {
            scroll[_id] = true
            if (!scroll.running) {
                scroll.scroll_map()
                scroll.running = true
            }
        }
        i.onmouseout = function() {
            scroll[_id] = false
        }
    }

    map.scrollTop = map.scrollHeight / 2 - screen.height / 2
    map.scrollLeft = map.scrollWidth / 2 - screen.width / 2

    map.addEventListener('click',function(e) {
        const el = e.target

        if (el.classList.contains('object')) {
            Page.game.select_block(el.parentElement)
            if (Page.narrowScreen) {
                Page.game.close_panel()
            }
            if (Page.game.harvest()) {
                return 0
            }
        }
        
        if (e.path.indexOf(panel) == -1 && e.path.indexOf(message) == -1) {
            Page.game.select_block(el)
        }
    })

    map.addEventListener('contextmenu',function(e) {
        e.preventDefault()
    })

    document.addEventListener('keydown',function(e) {
        const key = e.key.toUpperCase()
        if (click_short_key[key]) {
            click_short_key[key].click()
            return true
        }
        if (Page.selected) {
            if (Page.selected.classList.contains('block') && !Page.typing) {
                let coor = Page.selected.id.split('_').splice(1)
                switch (key) {
                    case 'W': case 'ARROWUP':
                        coor[1] = +coor[1] + 1
                        break
                    case 'A': case 'ARROWLEFT':
                        coor[0] = +coor[0] - 1
                        break
                    case 'S': case 'ARROWDOWN':
                        coor[1] = +coor[1] - 1
                        break
                    case 'D': case 'ARROWRIGHT':
                        coor[0] = +coor[0] + 1
                        break
                    default:
                        coor = false
                }
                if (coor) {
                    game.select_block(game.get_block(...coor))
                }
                return true
            }
        }
        if (key == 'ENTER') {
            if (Page.message.classList.contains('play')) {
                game.close_message()
                return true
            }
        }
        return 0
    })

    map.classList.add('play')

    for (const i of document.querySelectorAll('.before-load')) {
        i.classList.add('faded')
        setTimeout(() => {
            if (!Page.narrowScreen) {
                Page.game.prompt_message('鼠标放在地图边缘可以滚动地图')
            }
        },1000)
        setTimeout(() => {
            i.remove()
        },2000)
    }
}

// function key_in() {
//     const fb_msg = {
//         freeze: 0,
//         list() {
//             return document.querySelectorAll('[role="grid"]')[1]
//         },
//     }
//     fb_msg.list().addEventListener('DOMNodeInserted', function(e) {
//         if (!fb_msg.freeze) {
//             const el = e.target
//             const text = el.innerText.trim()
//             if (text) {
//                 console.log(text)
//                 fb_msg.freeze = true
//                 setTimeout(() => {
//                     document.querySelector('[role="button"][tabindex="0"][aria-label^="发"]').click()
//                     setTimeout(() => {
//                         fb_msg.freeze = false
//                     },2500)
//                 },500)
//             }
//         }
//     })
// }