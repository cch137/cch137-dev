const Page = {}

function build_logs() {
    if (Page.view.hasAttribute('data-v-app')) {
        let v = document.createElement('div')
        v.id = 'view'
        Page.view.replaceWith(v)
        Page.view = v
        let x = (new DOMParser()).parseFromString(Page.log_template,'text/html')
        x = x.getElementsByClassName('log')[0]
        Page.view.appendChild(x)
        Page.loading_message.classList.remove('hidden')
    }
    const xhr = new XMLHttpRequest()
    xhr.open('post',location.pathname,true)
    xhr.onerror = function() {
        alert('Oops! Something went wrong!')
    }
    xhr.onload = function() {
        build_view(JSON.parse(xhr.responseText))
        Page.loading_message.classList.add('hidden')
    }
    xhr.send()
}

function build_view(logs) {

    Vue.createApp({
        data() {
            let y = [], order = Object.keys(logs).sort().reverse()
            for (const i of order) {
                let x = logs[i]
                x._time = format_date_auto(date_py_to_js(i),1)
                x.time = format_date(date_py_to_js(i),'dd MMM yyyy, HH:mm:ss')
                for (const j in x) {
                    let z = {}
                    z.key = j
                    z.value = x[j] || ''
                    x[j] = z
                }
                y.push(x)
            }
            return {
                items: y
            }
        }
    }).mount('#view')

}

function refresh_logs() {
    let x = clear_logs()
    if (x) {
        x.onload = build_logs
    }
}

function expand_all() {
    for (const i of document.querySelectorAll('.log')) {
        i.open = true
    }
}

function collapse_all() {
    for (const i of document.querySelectorAll('.log')) {
        i.open = false
    }
}

window.onload = function() {
    Page.loading_message = document.querySelector('#loading')
    Page.container = document.querySelector('#container')
    Page.view = document.querySelector('#view')
    Page.log_template = Page.view.innerHTML
    build_logs()
}