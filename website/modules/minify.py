######## CONFIG ########

Setting = {
    'compress': False,
    'online': True,
    'threading': True
}

Configs = {
    'app/login.html': {
        'required': True,
        'js': ['app/login.js'],
        'css': ['app/login.css']
    },
    'app/home.html': {
        'required': True,
        'js': ['url_params.js','cookie.js','app/home.js','module.js','app/post_renderer.js'],
        'css': ['app/home.css']
    },
    'app/sche.html': {
        'required': True,
        'js': [],
        'css': []
    },
    'app/ogns.html': {
        'required': True,
        'js': ['app/ogns.js'],
        'css': ['app/ogns.css']
    },
    'app/stusearch.html': {
        'required': True,
        'js': ['app/stusearch.js'],
        'css': ['app/stusearch.css']
    },
    'drive/view.html': {
        'required': False,
        'js': ['drive/view.js'],
        'css': ['fonts.css','drive/view.css']
    },
    'error.html': {
        'required': True,
        'js': [],
        'css': []
    },
    'admin/dashboard.html': {
        'required': True,
        'js': ['app/stusearch.js'],
        'css': ['app/stusearch.css']
    },
    'admin/os.html': {
        'required': True,
        'js': ['admin/os.js','admin/server.js','cookie.js'],
        'css': ['admin/os.css']
    },
    'admin/logs.html': {
        'required': False,
        'js': ['format_date.js','admin/server.js','cookie.js','admin/logs.js'],
        'css': ['scrollbar.css','admin/logs.css']
    },
    'admin/login.html': {
        'required': True,
        'js': ['cookie.js'],
        'css': []
    },
    'admin/logout.html': {
        'required': False,
        'js': ['cookie.js'],
        'css': []
    },
    'database/student.html': {
        'required': False,
        'js': ['database/student.js'],
        'css': ['database/student.css','fonts.css','scrollbar.css']
    },
    'games/xox.html': {
        'required': False,
        'js': ['games/xox.js'],
        'css': ['games/xox.css']
    },
    'games/balloons.html': {
        'required': False,
        'js': ['cookie.js','games/balloons.js'],
        'css': ['games/balloons.css']
    },
    'games/2D-Kingdom.html': {
        'required': False,
        'js': ['games/2D-Kingdom.js'],
        'css': ['fonts.css','games/2D-Kingdom.css']
    },
    'games/starry-sky.html': {
        'required': False,
        'js': ['games/starry-sky.js'],
        'css': ['games/starry-sky.css']
    },
    'tools/cryp.html': {
        'required': False,
        'js': ['url_params.js','tools/cryp.js'],
        'css': ['tools/cryp.css','fonts.css']
    }
}

######## ------ ########
import re
import requests
import os
from bs4 import BeautifulSoup
import threading

import time
import json

from .manager import app, delete_static_pack
from .secure import b64_code

root_path = app.root_path.replace('\\','/')
dev_path = f'{root_path}/dev/'
_pack_path = 'static/pack'
pack_path = f'{root_path}/{_pack_path}'
template_path = f'{root_path}/{app.template_folder}'

def make_path(path):
    # 如果路径不存在则创建
    if not os.path.exists(path): 
        os.makedirs(path)

# 必配静态文件
for i in os.listdir(f'{dev_path}/html'):
    if i not in Configs:
        Configs[i] = {'required':False,'js':[],'css':[]}
for i in Configs:
    if Configs[i]['required']:
        x = ['fonts.css','main.css','scrollbar.css']
        x.extend(Configs[i]['css'])
        Configs[i]['css'] = x

Headers = {"user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36 Edg/96.0.1054.53"}

class fileMinifier(threading.Thread):
    def __init__(self,filetype,filepath):
        threading.Thread.__init__(self)
        self.filetype = filetype
        self.filepath = filepath
        self.result = None
    
    def run(self):
        if self.filetype == 'html':
            self.result = html_minify(self.filepath)
        else:
            data = open(f'{dev_path}{self.filetype}/{self.filepath}', encoding="utf-8").read()
            if self.filetype == 'js':
                self.result = js_minify(data)
            elif self.filetype == 'css':
                self.result = css_minify(data)

class jsMinifier(threading.Thread):
    def __init__(self,data):
        threading.Thread.__init__(self)
        self.data = data
        self.result = None
    
    def run(self):
        self.result = js_minify(self.data)

class cssMinifier(threading.Thread):
    def __init__(self,data):
        threading.Thread.__init__(self)
        self.data = data
        self.result = None
    
    def run(self):
        self.result = css_minify(self.data)

def js_minify(x):
    if Setting['compress']:
        if Setting['online']:
            try:
                data = {
                    'js_code': x,
                    # 'compilation_level': 'ADVANCED_OPTIMIZATIONS',
                    'output_format': 'json',
                    'output_info': 'compiled_code'
                }
                r = requests.post(url='https://closure-compiler.appspot.com/compile',data=data,headers=Headers)
                r = json.loads(r.text)['compiledCode']
                return r
                # 已弃用：
                # return requests.post('https://javascript-minifier.com/raw',data={'input': x}, headers=Headers).text
                # 备用：https://www.toptal.com/developers/javascript-minifier/raw
            except Exception as e:
                pass
        return _js_minify(x)
    return f'{x}\n'

def css_minify(x):
    if Setting['compress']:
        if Setting['online']:
            try:
                x = requests.post('https://cssminifier.com/raw',data={'input': x}, headers=Headers).text
                # 备用：https://www.toptal.com/developers/cssminifier/raw
            except Exception as e:
                pass
    else:
        x = f'{x}\n'
    return x
    return _css_minify(x)

pack_name = []
def write_static_pack(text,_filetype='txt'):
    x = b64_code(4) 
    while x in pack_name:
        x = b64_code(4)
    x = f'{x}.{_filetype}'
    pack_name.append(x)
    f = open(f'{pack_path}/{x}',mode='w+',encoding='utf-8')
    f.write(text)
    f.close()
    return f'/{_pack_path}/{x}'


def minify_templates_run():
    minified = {
        'html': {},
        'js': {},
        'css': {}
    }
    reqQueue = []
    files = {
        'html'  : None,
        'js'    : None,
        'css'   : None
    }
    # 清空 pack_name
    pack_name = []
    # 构建键值对，key 为路径，value 为 fileMinifier
    for i in files:
        files[i] = os.listdir(f'{dev_path}/{i}')
        y = []
        for j in files[i]:
            if os.path.isdir(f'{dev_path}/{i}/{j}'):
                files[i].extend(f'{j}/{k}' for k in os.listdir(f'{dev_path}/{i}/{j}'))
                y.append(j)
        for j in y:
            files[i].remove(j)
        for j in range(files[i].__len__()):
            x = fileMinifier(i,files[i][j])
            reqQueue.append(x)
            x.start()
            # 如果不允许多线程请求，立刻 .join()
            if not Setting['threading']:
                x.join()
    # 多线程统一处理 .join() 等待所有线程结束
    if Setting['threading']:
        for i in reqQueue:
            i.join()
    # 输出压缩结果
    for i in reqQueue:
        minified[i.filetype][i.filepath] = i.result
    # delete static packs
    delete_static_pack()
    make_path(pack_path)
    # 输出 template
    for i in minified['html']:
        r = BeautifulSoup(minified['html'][i].__str__(),'html.parser')
        # 载入已压缩的配置文件内容
        if i in Configs:
            # 在 static/pack 放入已包装的文件
            # 在 head 加入相对标签和内容
            script = "".join(minified['js'][j] for j in Configs[i]["js"])
            style = "".join(minified['css'][j] for j in Configs[i]["css"])
            if script:
                x = r.new_tag('script')
                x['src'] = write_static_pack(script,'js')
                r.head.append(x)
            if style:
                x = r.new_tag('link')
                x['rel'] = 'stylesheet'
                x['href'] = write_static_pack(style,'css')
                r.head.append(x)
        # 把所有的 style 标签整合为一个标签
        # script 不整合为一个标签（会破坏特性）
        y = {
            'style': []
        }
        for j in y:
            y[j] = []
            for k in r.find_all(j):
                if k.string:
                    y[j].append(k.string)
                    k.decompose()
            if y[j].__len__():
                x = r.new_tag(j)
                x.string = "".join(y[j])
                r.head.append(x)
        # 如果允许压缩，让 html 变为单行，否则去除多余的换行
        if Setting['compress']:
            r = str(r).replace('\n','')
        else:
            r = '\n'.join([i for i in str(r).split('\n') if i])
        # 寻找文件的路径（如果无文件夹则创建）
        y = i.split('/')
        y.pop()
        y = '/'.join(y)
        make_path(template_path)
        if y:
            make_path(f'{template_path}/{y}')
        # 删除原文件
        try:
            os.remove(f'{template_path}/{i}')
        except Exception:
            pass
        # 写入
        with open(f'{template_path}/{i}', encoding='utf-8', mode='w+') as f:
            f.write(r)
    print(f'Loaded JS: {len(minified["js"])}, CSS: {len(minified["css"])}, templates: {len(minified["html"])}')
    
def html_minify(filepath):
    js = []
    css = []
    x = BeautifulSoup(re.sub(r'<!--[\s\S]*?-->', '','\n'.join(i.strip() for i in open(f'{dev_path}html/{filepath}', encoding="utf-8").read().split('\n'))),'html.parser')
    for i in x.find_all('script'):
        if i.string:
            y = jsMinifier(i.string)
            js.append(y)
            y.start()
    for i in x.find_all('style'):
        if i.string:
            y = cssMinifier(i.string)
            css.append(y)
            y.start()
    for i in js:
        i.join()
    for i in css:
        i.join()
    for i in x.find_all('script'):
        if i.string:
            i.string = js.pop(0).result
    for i in x.find_all('style'):
        if i.string:
            i.string = css.pop(0).result
    return x

jsReservedWords = ('of','abstract','arguments','await','boolean','break','byte','case','catch','char','class','const','continue','debugger','default','delete','do','double','else','enum','eval','export','extends','final','finally','float','for','function','goto','if','implements','import','in','instanceof','int','interface','let','long','native','new','package','private','protected','public','return','short','static','super','switch','synchronized','this','throw','throws','transient','try','typeof','var','void','volatile','while','with','yield')
# jsReservedWords 去除 true, false, null 添加 of
jsOperators = ('=','+=','-=','*=','/=','%=','**=','+','-','*','**','/','%','++','--','==','===','!=','!==','>','<','>=','<=','?','&&','||','!','&','|','~','^','<<','>>','>>>')
jsStringSymbols = ('"',"'",'`')

def _js_condense(s):
    return ''.join(s)

def _js_filter_reservedWords(s):
    x = []
    i = s.__len__() - 1
    while i > -1:
        for j in jsReservedWords:
            if s[i-1][-j.__len__():] == j:
                if s[i][0] in ('(','[','{',')',']','}'):
                    x.append(f'{s[i-1]}{s[i]}')
                else:
                    x.append(f'{s[i-1]} {s[i]}')
                i -= 2
                j = None
                break
        if not j:
            continue
        x.append(s[i])
        i -= 1
    x.reverse()
    return x

def _js_separate(s):
    inString = None
    i = 0
    x = []
    y = []
    while i < s.__len__():
        if s[i] in jsStringSymbols:
            x.append(_js_condense(y))
            y = []
            z = []
            inString = s[i]
            while inString:
                z.append(s[i])
                i += 1
                if s[i] == inString:
                    z.append(s[i])
                    i += 1
                    inString = None
            x.append(''.join(z))
            continue
        if s[i] in [' ','\t']:
            i += 1
            if y.__len__():
                if y[-1] not in ('\n',' ',':','{','}','[',']','(',')',';',','):
                    y.append('\n')
            continue
        elif y.__len__():
            if s[i] in (':','{','}','[',']','(',')',';',','):
                if y[-1] == ' ':
                    y.pop()
                if s[i] == '}' and y[-1] in ';':
                    y.pop()
                while s[i] == ';' and y[-1] == ';':
                    i += 1
                    continue
        y.append(s[i])
        i += 1
        continue
    x.append(_js_condense(y))
    s = []
    for i in x:
        if i[0] in jsStringSymbols:
            if i[0] == '`':
                y = []
                inBracket = 0
                inString = None
                j = 0
                while j < i.__len__():
                    if inBracket:
                        if i[j] == '}' and i[j-1] != '\\':
                            if y[-1] == ' ':
                                y.pop()
                            inBracket -= 1
                        else:
                            if i[j] in (' ','\t','\n') and not inString:
                                for k in jsReservedWords:
                                    try:
                                        if i[j-k.__len__():j] == k and y[-1] not in (' ','{'):
                                            y.append(' ')
                                            break
                                    except Exception:
                                        pass
                                j += 1
                                continue
                    elif j + 1 < i.__len__():
                        if i[j] == '{' and i[j-1] == '$':
                            inBracket += 1
                    if inString:
                        if i[j] == inString:
                            inString = None
                    elif i[j] in ('"',"'"):
                        inString = i[j]
                    y.append(i[j])
                    j += 1
                i = ''.join(y)
            i = i.replace('\\\n','\\n')
            s.append(i)
            continue
        else:
            y = i.split('\n')
            for j in y:
                if j and j != ';':
                    s.append(j)
    return s

def _js_minify(s):
    if not s:
        return ''
    s = re.sub(r'//.*\n', '', re.sub(r'/\*[\s\S]*?\*/', '', s))
    s = _js_separate(s)
    
    i = -1
    while s.__len__() != i:
        i = s.__len__()
        s = _js_filter_reservedWords(s)

    x = []
    i = 0
    while i < s.__len__():
        for j in jsOperators:
            if x.__len__():
                if s[i][:j.__len__()] == j:
                    x[-1] = f'{x[-1]}{s[i]}{s[i+1]}'
                    i += 2
                    j = None
                    break
                if x[-1][-j.__len__():] == j:
                    x[-1] = f'{x[-1]}{s[i]}'
                    i += 1
                    j = None
                    break
        if not j:
            continue
        x.append(s[i])
        i += 1
    s = x

    x = []
    y = []
    inString = None
    brackets = 0
    i = 0
    while i < s.__len__():
        j = 0
        while j < s[i].__len__():
            if inString:
                if s[i][j] == inString:
                    inString = None
            elif s[i][j] in jsStringSymbols:
                inString = s[i][j]
            elif s[i][j] == '(':
                brackets += 1
            elif s[i][j] == ')':
                brackets -= 1
            j += 1
        if y.__len__():
            if y[-1] in (' ','\n') and s[i][0] in (')',']','}'):
                y.pop()
        y.append(s[i])
        if brackets == 0:
            x.extend(y)
            y = []
        i += 1
    s = x

    x = []
    i = 0
    while i < s.__len__():
        if x.__len__():
            if s[i][0] in (',',':','}',']',')') or x[-1][-1] in (',',':','{','[','('):
                x[-1] = f'{x[-1]}{s[i]}'
                i += 1
                continue
        x.append(s[i])
        i += 1
    s = x

    x = []
    i = 0
    while i < s.__len__():
        if x.__len__():
            if s[i][0:3] in ('in ','of ') or s[i][0:11] == 'instanceof ':
                x[-1] = f'{x[-1]} {s[i]}'
                i += 1
                continue
            if s[i][0:5] in ('else{','else;') or s[i][0:6] in ('catch(','catch{','catch;'):
                x[-1] = f'{x[-1]}{s[i]}'
                i += 1
                continue
        x.append(s[i])
        i += 1

    s = []
    for i in x:
        s.append(i)
        if i[-1] != ';':
            s.append(';')

    return ''.join(s)

def _css_subZeroBeforeDot(match):
    if int(match.group()[:-1]) == 0:
        return '.'
    return match.group()

def _css_condense(s):
    s = ''.join(s)
    return re.sub(r'\d+\.', _css_subZeroBeforeDot, s)

def _css_minify(s):
    s = re.sub(r'/\*[\s\S]*?\*/', '', s)
    inString = None
    i = 0
    x = []
    y = []
    while i < s.__len__():
        if s[i] in ['"',"'"]:
            x.append(_css_condense(y))
            y = []
            z = []
            inString = s[i]
            while inString:
                z.append(s[i])
                i += 1
                if s[i] == inString:
                    z.append(s[i])
                    i += 1
                    inString = None
            x.append(''.join(z))
            continue
        if s[i] in [' ','\t','\n']:
            if y.__len__():
                if y[-1] in [' ',':','{','}','[',']','(',')',';',',','>']:
                    i += 1
                    continue
            else:
                i += 1
                continue
        elif y.__len__():
            if i + 5 < s.__len__():
                if s[i:i + 5] == 'calc(':
                    unClosed = 1
                    z = ['calc(']
                    i += 5
                    while unClosed:
                        if s[i] == ')':
                            unClosed -= 1
                        elif s[i] == '(':
                            unClosed += 1
                        if s[i] in [' ','\n','\t']:
                            if i+1 <s.__len__():
                                if s[i+1] in ['+','-']:
                                    z.append(s[i])
                            if z.__len__():
                                if z[-1] in ['+','-']:
                                    z.append(s[i])
                            i += 1
                            continue
                        z.append(s[i])
                        i += 1
                    y.append(''.join(z))
                    continue
            if s[i] in [':','{','}','[',']',')',';',',','>']:
                if y[-1] == ' ':
                    y.pop()
                if s[i] == '}' and y[-1] == ';':
                    y.pop()
                while s[i] == ';' and y[-1] == ';':
                    i += 1
                    continue
        y.append(s[i])
        i += 1
        continue
    x.append(_css_condense(y))
    return ''.join(x)


class minify_templates_threading(threading.Thread):
    def __init__(self,preload):
        threading.Thread.__init__(self)
        self.pre = preload
    
    def run(self):
        minify_templates_run()
        if self.pre:
            print('Templates preloaded.')
        else:
            print('Templates minified.')


def minify_templates():
    t0 = time.time()
    # print('Preload templates...')
    # Setting['compress'] = False
    # preload = minify_templates_threading(True)
    # preload.start()
    # preload.join()
    # Setting['compress'] = True
    print('Minifying templates...')
    load = minify_templates_threading(False)
    load.start()
    load.join()
    print('Minified time used:',round(time.time() - t0,4))