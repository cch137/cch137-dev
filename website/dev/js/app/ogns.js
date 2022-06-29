function get_data() {
    const xhr = new XMLHttpRequest()
    xhr.open('post','/d/ogns',false)
    xhr.send()
    return JSON.parse(xhr.responseText)
}

window.onload = function() {
    history.replaceState(0,0,location.pathname)
    Vue.createApp({
        data() {
            const data = get_data()
            const x = []
            for (const i in data) {
                x.push({k: i, v: data[i]})
            }
            return {
                items: x
            }
        }
    }).mount('#list')
}