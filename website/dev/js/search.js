// {
//     const x = [], y = document.querySelector('[role="list"]').querySelectorAll('[role="listitem"]')
//     for (const i of y) {
//         const image = new Image()
//         image.setAttribute('crossOrigin', 'anonymous')
//         image.onload = function () {
//             const n = i.querySelector('.zWGUib').innerText
//             if (x.indexOf(n) != -1) {
//                 return 0
//             }
//             x.push(n)
//             const a = document.createElement('a'), canvas = document.createElement('canvas')
//             canvas.width = image.width
//             canvas.height = image.height
//             canvas.getContext('2d').drawImage(image, 0, 0, image.width, image.height)
//             a.download = n
//             a.href = canvas.toDataURL('image/png')
//             a.dispatchEvent(new MouseEvent('click'))
//         }
//         image.src = i.querySelector('img').getAttribute('src')
//     }
// }