# 直属于 app
from flask import Blueprint, render_template, redirect, request, jsonify, send_file, send_from_directory
import os
import json
import time
import filetype

from .modules.manager import buildFolderSummary, buildFolderSummaryAll, trimFolderSummary, trimPath, delete_temps, CWD, _CWD
from .modules import minify_templates, Logger, b64_code
from . import app

admin = Blueprint('admin', __name__)
appName = '137DB'

# print('New admin key: ',b64_code(64))
admin_key = 'eCdplTygK4eV4GjtAJnhSiTLdNYZ5SOLHA2TEz8-avq60bKpHSOzTYpguVK8s_Vc'

@admin.before_request
def isAdmin():
    access = False
    if 'admin' in request.cookies:
        if request.cookies['admin'] == admin_key:
            access = True
    elif request.is_json:
        x = request.get_json()
        cmd = x.get('cmd')
        hint = x.get('hint')
        key = x.get('key')
        if cmd != 'login':
            cmd = None
        if hint:
            if len(hint) != 2:
                hint = None
        if cmd and hint and key:
            # == 例题 ==
            # 1 2 3 4
            # 5 6 7 8
            # 解：
            # a = 第一行第一位 (1)
            # b = a 的右下角
            # ∴ a = 1, b = 6 （）
            # 接着，取 a, b 之差的平方
            # c = ( a - b )^2
            # 输入输入框，接着重复步骤直到第一行最后一位
            # 到第一行最后一位时，b 取第二行第一位
            # 答：2525251
            hint1 = [int(i) for i in hint[0]]
            hint2 = [int(i) for i in hint[1]]
            hint2.append(hint2.pop(0))
            ans = ''.join([str((hint1[i] - hint2[i]) * (hint1[i] - hint2[i])) for i in range(len(hint1))])
            if key == ans:
                if request.method == 'POST':
                    return admin_key
    if not access:
        if request.method == 'GET':
            return render_template('admin/login.html',appName=appName)
        else:
            return ''

@admin.route('', methods=['GET','POST'])
def route_admin():
    return redirect('/admin/os/')

from .modules.minify import Setting

@admin.route('logs', methods=['GET','POST'])
def route_app_log():
    if request.method == 'POST':
        return Logger.export()
    return render_template('admin/logs.html',appName=appName)

@admin.route('dashboard')
def route_admin_dashboard():
    return render_template('admin/dashboard.html',appName=appName)

@admin.route('minify-templates', methods=['POST'])
def route_minify_templates():
    try:
        minify_templates()
        return '1'
    except Exception():
        return '0'

@admin.route('clear-logs', methods=['POST'])
def route_clear_logs():
    try:
        Logger.clear()
        return '1'
    except Exception():
        return '0'

@admin.route('push-heroku-master', methods=['POST'])
def route_push_server():
    try:
        Logger.clear()
        print('Start pushing the project to heroku...')
        delete_temps()
        os.system('pipreqs --encoding=utf8 --force .')
        os.system('git add .')
        os.system('git commit -am "update"')
        minify_templates()
        os.system('git push heroku master')
        return '1'
    except Exception():
        return '0'

@admin.route('logout', methods=['GET','POST'])
def route_admin_logout():
    return render_template('admin/logout.html')

@admin.route('os/', methods=['GET','POST'])
def admin_get_files_origin():
    return admin_get_files('')
@admin.route('os/<path:filename>', methods=['GET','POST'])
def admin_get_files(filename=None):
    if ':' in filename[0:2]:
        return redirect('/admin/os/')
    if filename:
        if filename[-1] == '/':
            x = -1
            while filename[x] != '/':
                x -= 1
            filename = filename[:x+1]
    x = filename
    if not x:
        x = '.'
    if os.path.isdir(x):
        if request.method == 'GET':
            x = buildFolderSummaryAll()
            x = trimFolderSummary(x)
        else:
            x = buildFolderSummary(x)
            x = trimFolderSummary({filename:x})
        x = json.dumps(x,ensure_ascii=False,separators=(',',':'))
        if request.method == 'GET':
            return render_template('admin/os.html',appName=appName,path=filename,data=x)
        return x
    else:
        x = f'{CWD}/{x}'
        try:
            if not filetype.guess_mime(x):
                if x.split('/')[-1].split('.').__len__() == 1:
                    return open(x,mode='r',encoding='utf-8').read()
            return send_file(x)
        except Exception:
            while not os.path.exists(x):
                x = '/'.join(x.split('/')[:-1])
            return redirect(f'/admin/os/{trimPath(f"{x}/")}')
    return redirect('/')

# @admin.route('db/<code>/')
# def open_db(code):
#     try:
#         f = open(f'database/{code}.xlsx')
#         return render_template('db.html',filename=code,data=f.read())
#     except BaseException:
#         return redirect('/')