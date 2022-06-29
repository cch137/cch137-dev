const Page = {
    appName: document.title,
    container: null,
    current_tabname: '',
    nav: {
        collection: {}
    },
    tabs: {
        collection: {},
        index: {},
        isRendered: {},
        scrolled: {},
        list: null,
        view: null,
        to: function(tn) {
            const tabname = tn
            const last = Page.current_tabname || tabname
            if (tabname == Page.current_tabname && last) {
                return 0
            }
            Page.current_tabname = tabname
            // 设置物件名
            const lastNav = Page.nav.collection[last]
            const lastTab = Page.tabs.collection[last]
            const lastTabIdx = Page.tabs.index[last]
            const curTab = Page.tabs.collection[tabname]
            const curNav = Page.nav.collection[tabname]
            const curTabIdx = Page.tabs.index[tabname]
            if (lastTabIdx < curTabIdx) {
                // 标签页向左走
            }
            else {
                // 标签页向右走
            }
            // 记录当前滑动的位置
            Page.tabs.scrolled[last] = Page.scrollTop
            // 更换标签页
            Page.tabs.list.appendChild(lastTab)
            Page.tabs.view.appendChild(curTab)
            Page.tabs.view.classList.remove('active')
            // 恢复上一次停留的位置
            Page.container.scrollTop = Page.tabs.scrolled[tabname]
            // 更新导航栏
            lastNav.classList.remove('active')
            curNav.classList.add('active')
            // 设置页面状态
            setTimeout(() => {
                Page.tabs.view.classList.add('active')
                document.title = `${tabname[0].toUpperCase()}${tabname.substring(1)} | ${Page.appName}`
                history.replaceState(0,0,tabname)
                // 渲染帖子
                if (!Page.tabs.isRendered[tabname]) {
                    Page.tabs.isRendered[tabname] = true
                    post_renderer(curTab)
                }
            },0)
        }
    },
    scrollTop: 0,
    scrollingUp: 0,
    scrollingDown: 0
}

window.onload = function() {
    const nav_items = []
    const tab_items = []
    for (const i of document.querySelector('nav').getElementsByTagName('li')) {
        nav_items.push(i)
    }
    for (const i of document.querySelectorAll('.tab')) {
        tab_items.push(i)
    }
    let k = 0
    for (const i of nav_items) {
        const tn = i.getAttribute('href')
        i.onclick = function() {
            Page.tabs.to(tn)
        }
        Page.nav.collection[tn] = i
        Page.tabs.collection[tn] = tab_items.shift()
        Page.tabs.index[tn] = k ++;
        Page.tabs.scrolled[tn] = 0
    }
    Page.tabs.list = document.querySelector('#tabs')
    Page.tabs.view = document.querySelector('#view')
    Page.container = document.querySelector('#container')
    const header = document.querySelector('header')
    Page.container.onscroll = function() {
        const ctnTop = Page.container.scrollTop
        if (ctnTop > Page.scrollTop) {
            if (!Page.scrollingDown) {
                Page.scrollingUp = 0
                Page.scrollingDown = ctnTop
            }
        }
        else {
            if (!Page.scrollingUp) {
                Page.scrollingUp = ctnTop
                Page.scrollingDown = 0
            }
        }
        if (Page.scrollingUp) {
            if (header.classList.contains('collapse')) {
                header.classList.remove('collapse')
            }
        }
        else {
            if (!header.classList.contains('collapse') && ctnTop - Page.scrollingDown > 100) {
                header.classList.add('collapse')
            }
        }
        Page.scrollTop = ctnTop
    }

    /* 建立 Vue */
    /* HOME */
    Vue.createApp({
        data() {
            return {
                items: [
                    {
                        id: '',
                        href: '/stusearch',
                        title: '学生资料查询',
                        des: 'an interesting database',
                        newtab: false
                    },
                    {
                        id: '',
                        href: '/drive/',
                        title: '云端硬盘',
                        des: 'an insecure cloud hard drive',
                        newtab: false
                    },
                    {
                        id: '',
                        href: '/games/balloons',
                        title: '戳泡泡游戏',
                        des: 'a game',
                        newtab: true
                    },
                    {
                        id: '',
                        href: '/games/starry-sky',
                        title: '星空',
                        des: 'ASMR',
                        newtab: true
                    },
                    {
                        id: '',
                        href: '/admin/logs',
                        title: 'LOGS',
                        des: 'admin only',
                        newtab: false
                    },
                    {
                        id: '',
                        href: '/admin/',
                        title: 'ADMIN',
                        des: 'admin only',
                        newtab: false
                    }
                ]
            }
        },
        methods: {
            random_rgb: random_rgb
        },
    }).mount('#home-links')
    
    /* TOOLS */
    Vue.createApp({
        data() {
            const tools = {
                'SCHE/S3S3': {
                    link: '/sche/s3s3',
                    newtab: false
                },
                'SCHE/S3S1': {
                    link: '/sche/s3s1',
                    newtab: false
                },
                '加密': {
                    link: '/tools/cryp',
                    newtab: false,
                    des: '拥有两种加密模式，中文密文和 64 进制密文。'
                },
                'MyIp': {
                    link: '/tools/ip',
                    newtab: true
                },
                '抽签签': {
                    link: '/tools/draw',
                    newtab: true
                },
                '座位表生成器': {
                    link: '/tools/seat',
                    newtab: true
                },
                '组织': {
                    link: '/ogns',
                    newtab: true,
                    des: '学校组织'
                },
                '2D Kingdom': {
                    link: '/games/2d-kingdom',
                    newtab: true,
                    des: 'a game'
                }
            }
            const x = []
            for (const i in tools) {
                tools[i].title = i
                x.push(tools[i])
            }
            return {
                items: x
            }
        }
    }).mount('ol#tools')

    setTimeout(() => {
        Page.tabs.to(location.pathname.split('/').pop() || 'home')
    },1)
}