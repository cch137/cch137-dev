(function(){
  history.replaceState(0,0,location.pathname)
  window.onpageshow = function (event) {
    if (event.persisted) {
      document.location.reload()
    }
  }

  const _X = {
    students: null
  }

  function copy_text(v) {
    try {
      const x = document.createElement('input')
      x.value = v
      document.body.appendChild(x)
      x.select()
      document.execCommand('copy')
      return document.body.removeChild(x)
    }
    catch {
      alert(`Copy failed: ${v}`)
      return 0
    }
    }

  window.onload = function() {
    document.querySelector('#search-btn').onclick = function(){
      document.querySelector('#search-box').focus()
    }
    _X.count = document.querySelector('#result-count')
    setTimeout(studentsRoll,0)
    if ('ontouchstart' in document.documentElement) {
      // 如果是触屏则让搜索框 autocomplete
      document.querySelector('#search-box').setAttribute('autocomplete','on')
    }
  }
  document.currentScript.remove()

  function studentsRoll() {
    const xhr = new XMLHttpRequest()
    const ld = document.querySelector('#msgbox')
    const sbox = document.querySelector('#search-box'), sbtn = document.querySelector('#search-btn')
    ld.onclick = undefined
    ld.style = undefined
    ld.innerText = 'Loading...0%'
    xhr.open('post','/d/roll',true)
    xhr.onload = function() {
      sbtn.onclick = function(){
        students_search()
        document.querySelector('#search-box').focus()
      }
      sbox.onkeyup = students_search
      _X.students = JSON.parse(xhr.responseText)
      for (const i in _X.students) {
        const ii = _X.students[i]
        let valid = true
        if (!ii.name && ii.name_zh) {
          for (const j in _X.students) {
            if (ii.name_zh == _X.students[j].name) {
              valid = false
              break
            }
          }
        }
        if (valid || ii.name) {
          ii.ref = valuesOfObject(ii)
        }
      }
      _X.search = sbox
      _X.loading = 0
      _X.maxResults = 1000
      _X.list = document.querySelector('#search-result-list')
      _X.hidden = document.querySelector('#search-result-hidden')
      document.querySelector('#container').classList.remove('blur')
      ld.innerText = 'Loading completed'
      function end_loading() {
        ld.style = 'width:0;height:0;'
        ld.innerText = ''
        setTimeout(() => {
          try {
            ld.parentElement.removeChild(ld)
          }
          catch {}
        },500)
        sbox.focus()
      }
      ld.onclick = end_loading
      setTimeout(end_loading,1000)
      setTimeout(students_search,0)
    }
    xhr.onprogress = function(evt) {
      ld.innerText = `Loading...${Math.round(evt.loaded/evt.total*100)}%`
    }
    xhr.onerror = function() {
      alert('ERROR!')
    }
    xhr.send()
  }

  function valuesOfObject(obj) {
    const y = []
    for (const i in obj) {
      if (i == 'DATA') {
        continue
      }
      const x = obj[i]
      if (x instanceof Object) {
        y.push(...valuesOfObject(x))
      }
      else {
        y.push(`${x}`)
      }
    }
    return y
  }

  function copy_search_link() {
    const el = document.querySelector('#search-copy-link')
    el.classList.add('cooling')
    setTimeout(() => {
      el.classList.remove('cooling')
    },1500)
    let x = _X.search.value.trim()
    if (x) {
      x = `?q=${_X.search.value.trim()}`
    }
    x = `${document.location.origin}${x}`
    return copy_text(x)
  }

  function students_search() {
    if (_X.loading) {
      _X.loading += 1
      return 0
    }
    setTimeout(_students_search,0)
  }

  function _students_search() {
    _X.loading = 1
    let _v = []
    const y = {}
    for (const i of _X.search.value.toUpperCase().trim().split(',').join(' ').split(' ')) {
      if (i) {
        _v.push(i)
      }
    }
    for (const i in _X.students) {
      if (_X.students[i].ref) {
        let m = 0
        for (const v of _v) {
          if (!v) {
            break
          }
          for (const j of _X.students[i].ref) {
            let r = j.indexOf(v)
            if (r != -1) {
              y[i] = Math.min(r,y[i]||Infinity)
              m += 1
              break
            }
            // if (_revise(j,v) > 0.66) {
            //   y.push(i)
            //   m = true
            //   break
            // }
          }
        }
        if (m && m!=_v.length) {
          delete y[i]
        }
      }
    }
    _v = []
    const s = Object.values(y).sort()
    let count = ''
    if (s.length < _X.maxResults) {
      while (s.length) {
        for (const i in y) {
          if (y[i] == s[0] && _v.indexOf(i)==-1) {
            s.shift()
            _v.push(i)
            if (!_X.students[i].el) {
              const ii = _X.students[i]
              console.log(ii)
              const el = document.createElement('a')
              el.innerText = `${ii.id || '-'} ${ii.name || ii.name_zh || '-'} ${ii.name_en || '-'} `
              const _el = document.createElement('span')
              _el.classList.add('subtext')
              _el.innerText = `${ii.class || '-'} ${ii.seatno || '-'} ${ii.cc || '-'}`
              el.appendChild(_el)
              el.onclick = function() {
                const xhr = new XMLHttpRequest()
                xhr.open('post','/d/stu',true)
                xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded; charset=UTF-8")
                xhr.onload = function() {
                  const lk = `/d/stu/${xhr.responseText}/`
                  el.href = lk
                  el.target = '_blank'
                  el.rel = 'noopener noreferrer'
                  window.open(lk)
                }
                xhr.send(`q=${i}`)
                el.onclick = null
              }
              el.classList.add('search-result')
              ii.el = el
            }
            _X.list.appendChild(_X.students[i].el)
          }
        }
      }
      count = _v.length
    }
    else {
      count = `${s.length} (too many)`
    }
    if (_X.count.innerText != count) {
      _X.count.innerText = count
    }
    for (const i in _X.students) {
      if (_X.students[i].ref) {
        if ((!(i in y) && _X.list.contains(_X.students[i].el)) || s.length >= _X.maxResults) {
          if (_X.students[i].el) {
            _X.hidden.appendChild(_X.students[i].el)
          }
        }
      }
    }
    setTimeout(() => {
      if (_X.loading > 1) {
        _students_search()
      }
      else {
        _X.loading = 0
      }
    },500)
  }

}())
