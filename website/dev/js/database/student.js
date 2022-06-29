(function() {
  history.replaceState(0,0,document.location.pathname)

  const Page = {
    xhr: new XMLHttpRequest()
  }
  Page.xhr.open('post',location.pathname,false)
  Page.xhr.send()
  Page.data = JSON.parse(Page.xhr.responseText)

  function obj2array(obj) {
    const items = []
    for (const i in obj) {
      items.push({
        key: i,
        value: obj[i]
      })
    }
    return items
  }

  window.onload = function() {
    // 制作 namecard
    Page.data.namecard = {}
    for (const i in Page.data) {
      if (!(Page.data[i] instanceof Object)) {
        Page.data.namecard[i] = Page.data[i] || '-'
      }
    }

    Vue.createApp({
      data() {
        const x = {}
        x.info = obj2array(Page.data.namecard)
        x.group = obj2array(Page.data.classes)
        for (const i of x.group) {
          i.value = [i.value,Page.data.cc[i.key]]
        }
        return x
      }
    }).mount('#namecard')

    Vue.createApp({
      data() {
        let years = []
        for (const i of Page.data.reps) {
          for (const j in i) {
            for (const k in i[j]) {
              if (!(i[j][k] instanceof Array)) {
                i[j][k] = [i[j][k]]
              }
              if (i[j][k].length == 1) {
                i[j][k]['colspan'] = 2
              }
              i[j][k]['key'] = k
            }
          }
          years.push(i)
        }
        years.reverse()
        return {
          results: years.reverse()
        }
      }
    }).mount('#results')
  }
})()