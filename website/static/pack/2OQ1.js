function get_form(form_id) {
    for (const i of document.querySelectorAll('form')) {
        if (i.id == form_id) {
            i.classList.remove('hidden')
        }
        else {
            if (!i.classList.contains('hidden')) {
                i.classList.add('hidden')
            }
        }
    }
}

function run_timer(timer,btn,msg) {
    timer.innerText --
    if (+timer.innerText) {
        setTimeout(run_timer,1000,timer,btn,msg)
    }
    else {
        btn.innerText = msg
        btn.classList.remove('disable')
    }
}

window.onload = function() {
    history.replaceState(0,0,location.pathname)
    document.querySelector('#forgot-pw').onclick = function() {
        alert('We are sorry for this, please contact us.')
    }

    document.querySelector('#btn-login1').onclick = function() {
        get_form('login')
    }

    document.querySelector('#btn-signup').onclick = function() {
        get_form('verify')
    }

    document.querySelector('#btn-verify').onclick = function() {
        const btn = document.querySelector('#btn-verify')
        if (!btn.classList.contains('disable')) {
            for (const i of document.querySelectorAll('.sent-verify')) {
                i.classList.remove('hidden')
                i.classList.remove('sent-verify')
            }
            for (const i of document.querySelectorAll('.sent-verify-del')) {
                i.remove()
            }
            btn.innerText = 'Resend (after '
            const timer = document.createElement('span')
            timer.id = 'resend-timer'
            timer.innerText = 120
            btn.append(timer)
            btn.append('s)')
            btn.classList.add('disable')
            setTimeout(run_timer,1000,timer,btn,'Resend')
        }
    }

    document.querySelector('#signup-back1').onclick = function() {
        get_form('login')
    }

    document.querySelector('#signup-next1').onclick = function() {
        document.querySelector('#signup-sec1').classList.add('hidden')
        document.querySelector('#signup-sec2').classList.remove('hidden')
    }

    document.querySelector('#signup-back2').onclick = function() {
        document.querySelector('#signup-sec1').classList.remove('hidden')
        document.querySelector('#signup-sec2').classList.add('hidden')
    }

    document.querySelector('form#login input[type="submit"').onclick = function(e) {
        e.preventDefault()
    }

    document.querySelector('form#verify input[type="submit"').onclick = function(e) {
        e.preventDefault()
        get_form('signup')
    }

    document.querySelector('form#signup input[type="submit"').onclick = function(e) {
        e.preventDefault()
    }
    
}
