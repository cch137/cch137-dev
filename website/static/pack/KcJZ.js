function format_date(date, format, utc) {
    var MMMM = ["\x00", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var MMM = ["\x01", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var dddd = ["\x02", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var ddd = ["\x03", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    function ii(i, len) {
        var s = i + "";
        len = len || 2;
        while (s.length < len) s = "0" + s;
        return s;
    }

    var y = utc ? date.getUTCFullYear() : date.getFullYear();
    format = format.replace(/(^|[^\\])yyyy+/g, "$1" + y);
    format = format.replace(/(^|[^\\])yy/g, "$1" + y.toString().substr(2, 2));
    format = format.replace(/(^|[^\\])y/g, "$1" + y);

    var M = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
    format = format.replace(/(^|[^\\])MMMM+/g, "$1" + MMMM[0]);
    format = format.replace(/(^|[^\\])MMM/g, "$1" + MMM[0]);
    format = format.replace(/(^|[^\\])MM/g, "$1" + ii(M));
    format = format.replace(/(^|[^\\])M/g, "$1" + M);

    var d = utc ? date.getUTCDate() : date.getDate();
    format = format.replace(/(^|[^\\])dddd+/g, "$1" + dddd[0]);
    format = format.replace(/(^|[^\\])ddd/g, "$1" + ddd[0]);
    format = format.replace(/(^|[^\\])dd/g, "$1" + ii(d));
    format = format.replace(/(^|[^\\])d/g, "$1" + d);

    var H = utc ? date.getUTCHours() : date.getHours();
    format = format.replace(/(^|[^\\])HH+/g, "$1" + ii(H));
    format = format.replace(/(^|[^\\])H/g, "$1" + H);

    var h = H > 12 ? H - 12 : H == 0 ? 12 : H;
    format = format.replace(/(^|[^\\])hh+/g, "$1" + ii(h));
    format = format.replace(/(^|[^\\])h/g, "$1" + h);

    var m = utc ? date.getUTCMinutes() : date.getMinutes();
    format = format.replace(/(^|[^\\])mm+/g, "$1" + ii(m));
    format = format.replace(/(^|[^\\])m/g, "$1" + m);

    var s = utc ? date.getUTCSeconds() : date.getSeconds();
    format = format.replace(/(^|[^\\])ss+/g, "$1" + ii(s));
    format = format.replace(/(^|[^\\])s/g, "$1" + s);

    var f = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
    format = format.replace(/(^|[^\\])fff+/g, "$1" + ii(f, 3));
    f = Math.round(f / 10);
    format = format.replace(/(^|[^\\])ff/g, "$1" + ii(f));
    f = Math.round(f / 10);
    format = format.replace(/(^|[^\\])f/g, "$1" + f);

    var T = H < 12 ? "AM" : "PM";
    format = format.replace(/(^|[^\\])TT+/g, "$1" + T);
    format = format.replace(/(^|[^\\])T/g, "$1" + T.charAt(0));

    var t = T.toLowerCase();
    format = format.replace(/(^|[^\\])tt+/g, "$1" + t);
    format = format.replace(/(^|[^\\])t/g, "$1" + t.charAt(0));

    var tz = -date.getTimezoneOffset();
    var K = utc || !tz ? "Z" : tz > 0 ? "+" : "-";
    if (!utc) {
        tz = Math.abs(tz);
        var tzHrs = Math.floor(tz / 60);
        var tzMin = tz % 60;
        K += ii(tzHrs) + ":" + ii(tzMin);
    }
    format = format.replace(/(^|[^\\])K/g, "$1" + K);

    var day = (utc ? date.getUTCDay() : date.getDay()) + 1;
    format = format.replace(new RegExp(dddd[0], "g"), dddd[day]);
    format = format.replace(new RegExp(ddd[0], "g"), ddd[day]);

    format = format.replace(new RegExp(MMMM[0], "g"), MMMM[M]);
    format = format.replace(new RegExp(MMM[0], "g"), MMM[M]);

    format = format.replace(/\\(.)/g, "$1");

    return format;
}

const _format_date_halfyear = 1000*60*60*24*365/2
const _format_date_halfday = 1000*60*60*24/2

function date_py_to_js(x) {
    x = new Date(+ x * 1000)
    return x
}

function format_date_std_py(x) {
    return format_date_std(Math.round(x*1000))
}

function format_date_std(x=undefined) {
    if(!x) x = new Date
    return format_date(new Date(x),'dd MMM yyyy, HH:mm')
}

function format_date_auto_py(x, secs=false) {
    return format_date_auto(Math.round(x*1000),secs)
}

function format_date_auto(x=undefined, secs=false) {
    if(!x) x = new Date
    else x = new Date(x)
    if (secs) secs = ':ss'
    else secs = ''
    let _fmt,t = new Date
    let today = new Date(t.getFullYear(),t.getMonth(),t.getDate()).getTime()
    let thisYear = new Date(t.getFullYear()).getTime()
    t = t.getTime()
    if (x<thisYear) _fmt = `dd MMM yyyy, HH:mm${secs}`
    else if(x<today) _fmt = `dd MMM, HH:mm${secs}`
    else _fmt = `HH:mm${secs}`
    return format_date(x,_fmt)
}
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
/*\
|*|
|*|  https://developer.mozilla.org/en-US/docs/DOM/document.cookie
|*|  Syntaxes:
|*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
|*|  * docCookies.getItem(name)
|*|  * docCookies.removeItem(name[, path], domain)
|*|  * docCookies.hasItem(name)
|*|  * docCookies.keys()
|*|
\*/

const DocCookies = {
    getItem: function (sKey) {
        return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[-.+*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
    },
    setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
        var sExpires = "";
        if (vEnd) {
        switch (vEnd.constructor) {
            case Number:
            sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
            break;
            case String:
            sExpires = "; expires=" + vEnd;
            break;
            case Date:
            sExpires = "; expires=" + vEnd.toUTCString();
            break;
        }
        }
        document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
        return true;
    },
    removeItem: function (sKey, sPath, sDomain) {
        if (!sKey || !this.hasItem(sKey)) { return false; }
        document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + ( sDomain ? "; domain=" + sDomain : "") + ( sPath ? "; path=" + sPath : "");
        return true;
    },
    hasItem: function (sKey) {
        return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[-.+*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
    },
    keys: /* optional method: you can safely remove it! */ function () {
        var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
        for (var nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
        return aKeys;
    }
}
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
