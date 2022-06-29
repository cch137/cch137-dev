function getKey() {
    return DocCookies.getItem('admin')
}

function minifyTemplates() {
    const x = new XMLHttpRequest
    x.open('post',`/admin/minify-templates?key=${getKey()}`,true)
    x.onerror = function() {
        console.log('Minify templates failed.')
    }
    x.onload = function() {
        console.log((new Date).toLocaleString(),'Templates minified successfully.')
    }
    x.send()
}

function clear_logs() {
    if (confirm('是否清除全部日志？') && confirm('日志清除后将无法恢复，是否继续？')) {
        const x = new XMLHttpRequest
        x.open('post',`/admin/clear-logs?key=${getKey()}`,true)
        x.onerror = function() {
            console.log('Clear logs failed.')
        }
        x.onload = function() {
            console.log('Clear logs successfully.')
        }
        x.send()
        return x
    }
}

function push_heroku_master() {
    if (!confirm('Confirm push server to Herku?')) {
        return 0
    }
    const x = new XMLHttpRequest
    x.open('post',`/admin/push-heroku-master?key=${getKey()}`,true)
    x.onerror = function() {
        alert('push-heroku-master FAILED!')
    }
    x.onload = function() {
        alert('push-heroku-master SUCCESS!')
        console.log((new Date).toLocaleString(),'push-heroku-master')
    }
    x.send()
}