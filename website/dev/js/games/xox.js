function block_action(el) {
    el.classList.add('marked')
    el.innerText = 'Ｏ'
}

function factorialize(num) {
    if (!num) return 0
    let k = num
    while (--num) {
        k *= num
    }
    return k
}

let TREE = null, FIRST = {}
const nums = [1,2,3,4,5,6,7,8,9]
const win_groups = ['123', '456', '789', '147', '258', '369', '159', '357']

window.onload = function() {
    let x = document.querySelectorAll('.block')
    for (const i of x) {
        i.onclick = function() {
            block_action(i)
        }
    }
    TREE = predict()
    FIRST = {}
    x = 0
    for(const i of Object.keys(TREE)) {
        if (TREE[i]) {
            const k = `${i.substring(0,1)}`, n = factorialize(9 - i.length)
            if(FIRST[k]) {
                FIRST[k] += n
            }
            else {
                FIRST[k] = n
            }
        }
        else {
            x += 1
        }
    }
    console.log(FIRST)
    for (const i in FIRST) {
        x += FIRST[i]
    }
    console.log(x)
    // for (const i of Object.keys(TREE)) {
    //     console.log(i,TREE[i])
    // }
}

function judge(x) {
    let k = true, p1 = [], p2 = []
    for (const i of x) {
        if (k) {
            p1.push(i)
        }
        else {
            p2.push(i)
        }
        k = !k
    }
    p1 = p1.sort().join('').substring(0,3)
    p2 = p2.sort().join('').substring(0,3)
    if (win_groups.indexOf(p1) != -1) {
        return 1
    }
    if (win_groups.indexOf(p2) != -1) {
        return 2
    }
    return 0
}

function predict() {
    const y = {}
    for (const n1 of nums) {
        const num = []
        num.push(n1)
        for (const n2 of nums) {
            if (num.indexOf(n2) != -1) {
                continue
            }
            num.push(n2)
            for (const n3 of nums) {
                if (num.indexOf(n3) != -1) {
                    continue
                }
                num.push(n3)
                for (const n4 of nums) {
                    if (num.indexOf(n4) != -1) {
                        continue
                    }
                    num.push(n4)
                    for (const n5 of nums) {
                        if (num.indexOf(n5) != -1) {
                            continue
                        }
                        num.push(n5)
                        const r5 = judge(num)
                        if (r5) {
                            y[num.join('')] = r5
                            num.pop()
                            break
                        }
                        for (const n6 of nums) {
                            if (num.indexOf(n6) != -1) {
                                continue
                            }
                            num.push(n6)
                            const r6 = judge(num)
                            if (r6) {
                                y[num.join('')] = r6
                                num.pop()
                                break
                            }
                            for (const n7 of nums) {
                                if (num.indexOf(n7) != -1) {
                                    continue
                                }
                                num.push(n7)
                                const r7 = judge(num)
                                if (r7) {
                                    y[num.join('')] = r7
                                    num.pop()
                                    break
                                }
                                for (const n8 of nums) {
                                    if (num.indexOf(n8) != -1) {
                                        continue
                                    }
                                    num.push(n8)
                                    const r8 = judge(num)
                                    if (r8) {
                                        y[num.join('')] = r8
                                        num.pop()
                                        break
                                    }
                                    for (const n9 of nums) {
                                        if (num.indexOf(n9) != -1) {
                                            continue
                                        }
                                        num.push(n9)
                                        y[num.join('')] = judge(num)
                                        num.pop()
                                    }
                                    num.pop()
                                }
                                num.pop()
                            }
                            num.pop()
                        }
                        num.pop()
                    }
                    num.pop()
                }
                num.pop()
            }
            num.pop()
        }
    }
    return y
}