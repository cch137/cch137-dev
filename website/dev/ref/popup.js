class Popup {
    constructor({text = '', plugin = null, plugin_param = null, block_page = null, t = null} = {}) {
        let x, y, z
        switch (plugin) {
            case 'image-viewer':
                x = document.createElement('img')
                x.classList.add('page-center')
                x.classList.add('popup-image-viewer')
                x.src = plugin_param.src
                x.alt = plugin_param.alt
                y = document.createElement('div')
                y.classList.add('popup-close-button')
                z = document.createElement('div')
                z.appendChild(x)
                z.appendChild(y)
                this.closeBtn = y
                block_page = 'black'
                break
            case 'uploading':
                y = document.createElement('div')
                x = document.createElement('span')
                x.innerText = 'Uploading'
                y.appendChild(x)
                this.text = x
                x = document.createElement('span')
                x.classList.add('dot-dot')
                y.appendChild(x)
                x = document.createElement('div')
                x.appendChild(y)
                y = document.createElement('progress')
                x.appendChild(y)
                z = this.popupBox()
                z.appendChild(x)
                this.progress = y
                block_page = 'shadow'
                break
            default:
                x = document.createElement('div')
                y = document.createElement('span')
                y.innerHTML = text
                this.text = y
                z = this.popupBox()
                x.appendChild(y)
                z.appendChild(x)
                break
        }
        this.content = x
        this.frame = z
        
        let bg
        if (block_page) {
            bg = document.createElement('div')
            bg.classList.add('page-center')
            switch (block_page) {
                case 'shadow':
                    bg.classList.add('popup-bg-black-shadow')
                    break;
                case 'black':
                    bg.classList.add('popup-bg-black')
                    break
                default:
                    break
            }
            bg.append(this.frame)
            this.frame = bg
            document.body.appendChild(bg)
        }

        if (this.closeBtn) this.closeBtn.addEventListener("click",()=>{this.remove(bg)})

        if(t!=null) {
            setTimeout(this.remove,t,this.frame)
        }

        this.runDotdot()
    }

    remove(obj) {
        obj.parentNode.removeChild(obj)
    }

    popupBox() {
        let x = document.createElement('div')
        x.classList.add('popup')
        x.classList.add('page-center')
        x.classList.add('flex-center')
        return x
    }

    runDotdot(){
        let x = this.frame.getElementsByClassName('dot-dot')
        while(x.length) this.dotdot(x[0])
    }

    dotdot(x,t=3,gap=500) {
        let i
        t++
        function _dotdot(x,t,gap) {
            for(i=1;i<t;i++) setTimeout(()=>{x.innerHTML+='.'},i*gap)
            i++
            setTimeout(()=>{x.innerHTML=''},i*gap)
        }
        _dotdot(x,t,gap)
        setInterval(_dotdot,(t+1)*gap,x,t,gap)
        x.setAttribute('class','_dot-dot')
    }

}

{
    let x = document.createElement('link')
    x.rel = 'stylesheet'
    x.href = '/static/styles/popup.css'
    document.head.appendChild(x)
}