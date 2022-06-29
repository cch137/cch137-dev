// function server_debug() {
//     let x = new XMLHttpRequest()
//     x.open('post','/admin/shutdown',false)
//     x.setRequestHeader("Content-Type","application/x-www-form-urlencoded; charset=UTF-8")
//     x.send('key=CHEE_CHORNG_HERNG_137')
//     if (x.responseText*1) {
//         setTimeout(() => {
//             document.location = document.location
//         },3000)
//     }
//     else {
//         alert('Incorrect key.')
//     }
// }