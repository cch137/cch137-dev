def similarity(item1, item2): # item2 is standard
    simlr = 0
    item1 = [ ( item1[i], (i+0.5)/len(item1) ) for i in range(len(item1)) ]
    item2 = [ ( item2[i], (i-0.5)/len(item2), (i+1.5)/len(item2) ) for i in range(len(item2)) ]
    for i in item2:
        match = []
        for j in item1:
            if j[1] > i[1] and j[1] < i[2]:
                match.append(j[0])
        if len(match):
            simlr += match.count(i[0]) / len(match)
    simlr /= len(item2)
    if simlr == 1:
        simlr *= min(len(item1),len(item2)) / max(len(item1),len(item2))
    return simlr

def similarity_list(itemlist, item2):
    item2 = [ ( item2[i], (i-0.5)/len(item2), (i+1.5)/len(item2) ) for i in range(len(item2)) ]
    y = []
    for x in itemlist:
        simlr = pt = 0
        x = [ ( x[i], (i+0.5)/len(x) ) for i in range(len(x)) ]
        for i in item2:
            match = []
            for j in x:
                if j[1] > i[1] and j[1] < i[2]:
                    match.append(j[0])
            if len(match):
                simlr += match.count(i[0]) / len(match)
        simlr /= len(item2)
        if simlr == 1:
            simlr *= min(len(x),len(item2)) / max(len(x),len(item2))
        y.append((x,simlr))
    simlr = []
    x = 0 # max
    for i in y:
        if i[1] > x:
            x = i[1]
            simlr = [i]
        elif i[1] == x:
            simlr.append(i)
    if not x:
        return None
    y = []
    for i in simlr:
        y.append((''.join(j[0] for j in i[0]),i[1]))
    return y

def rectify(itemlist, item2):
    return similarity_list(itemlist, item2)

# Sample code
#   x = rectify(['banana','watermelon','strawberry','apple','orange'],'zzzzz')
#   print(x)
# ******** ******** ******** *******