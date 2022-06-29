import os
import filetype

from .. import app

_CWD = f'{os.getcwd()}'
CWD = _CWD.replace('\\','/')
_CWD = f'{_CWD[0].lower()}{_CWD[1:]}'

def trimPath(x):
    return x.replace(f'{CWD}/','',1)

def buildFolderSummary(path):
    path = path or CWD
    y = []
    folderItems = os.listdir(path)
    for i in folderItems:
        f = f'{path}/{i}'
        p = trimPath(os.path.abspath(f).replace('\\','/'))
        if os.path.isdir(p):
            x = {
                'isdir': 1,
                'path': p,
            }
        else:
            x = {
                'isdir': 0,
                'path': p,
                'mimetype': filetype.guess_mime(f),
            }
        x['path'] = x['path']
        y.append(x)
    return y

def buildFolderSummaryAll():
    x = {}
    y = ['']
    for i in y:
        x[i] = buildFolderSummary(i)
        for j in x[i]:
            if j['isdir']:
                if j['path'] not in y:
                    y.append(j["path"])
    return x

def trimFolderSummary(x):
    for i in x:
        for j in range(len(x[i])):
            k = len(i)
            if i:
                k += 1
            x[i][j]['path'] = x[i][j]['path'][k:]
    return x

def detele_folder(i,dirs=None):
    if not dirs:
        dirs = buildFolderSummaryAll()
    if i not in dirs:
        return 0
    for j in dirs[i]:
        if j['isdir']:
            detele_folder(j['path'],dirs)
        else:
            os.remove(j['path'])
    try:
        os.rmdir(i)
    except Exception:
        pass

def detele_folders(x,dirs=None):
    dirs = buildFolderSummaryAll()
    n = -1 * len(x)
    for i in dirs:
        if i[n:] == x:
            detele_folder(i,dirs)

def target_path(path):
    return f'{app.root_path}/{path}'.replace(_CWD,'')[1:]

def delete_static_pack(d=None):
    return detele_folder(target_path('static/pack'),d)

def delete_temps():
    d = buildFolderSummaryAll()
    # delete all '__pycache__' folders
    detele_folders('__pycache__',d)
    # delete templates folder
    detele_folder(target_path(app.template_folder),d)
    # delete static/pack folder
    delete_static_pack(d)
