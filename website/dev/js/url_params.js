function __URL_PARAMS() {
    const x = {}
    for (let i of document.location.search.substring(1).split('&')) {
            i = [i.substring(0,i.indexOf('=')),i.substring(i.indexOf('=')+1)]
            x[i[0]] = decodeURI(i[1])
        }
    return x
}

class URL_PARAMS{
    constructor() {
        this.params = __URL_PARAMS()
    }

    load() {
        this.params = __URL_PARAMS()
    }
    
    get(k) {
        return this.params[k]
    }
    
    set(k,v) {
        this.params[k] = v
    }

    string() {
        let p = []
        for (const i in this.params) {
            if(this.params[i]) {
                p.push(`${i}=${this.params[i]}`)
            }
        }
        p = p.join('&')
        if (p) {
            p = `?${p}`
        }
        return p
    }

    href() {
        return `${window.location.origin}${window.location.pathname}${this.string()}`
    }

    isSafeUrl(url) {
        if (encodeURI(url.length) > 4096) {
            return false
        }
        return true
    }

    pushState(safe=true) {
        const p = this.href()
        if (safe) {
            if (!this.isSafeUrl(p)) {
                return 0
            }
        }
        history.pushState(0,0,p)
    }

    replaceState(safe=true) {
        const p = this.href()
        if (safe) {
            if (!this.isSafeUrl(p)) {
                return 0
            }
        }
        history.replaceState(0,0,p)
    }
    
    runWhenPopstate(f) {
        window.onpopstate = f
    }
    
    reloadWhenPopstate(b=true) {
        this.runWhenPopstate(function() {
            document.location = document.location
        })
    }
}