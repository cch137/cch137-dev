# 直属于 app
from flask import Blueprint, render_template, request, redirect, send_file, abort
import os
import json
import time

from .modules.secure import b64_code
from . import app

drive = Blueprint('drive', __name__)
appName = '42Drive'

CWD = os.getcwd()
root_path = 'drive/'
index_path = f'{root_path}index/'
items_path = f'{root_path}items/'

for i in [root_path,index_path,items_path]:
    # 如果路径不存在则创建
    if not os.path.exists(i): 
        os.makedirs(i)

def dict2jsonstr(obj: dict):
    return json.dumps(obj,ensure_ascii=False,separators=(',',':'))

class Drive():
    def __init__(self):
        self.drive = {}
        self.load()

    def load(self):
        x = {}
        for i in os.listdir(index_path):
            with open(f'{index_path}{i}',encoding='utf-8') as f:
                x[i] = json.loads(f.read())
                f.close()
                if not x[i]['dir']:
                    try:
                        path = f'{items_path}{i}'
                        x[i]['filename'] = os.listdir(path)[0]
                        path = f'{path}/{x[i]["filename"]}'
                        stat = os.stat(path)
                        x[i]['size'] = stat.st_size
                        x[i]['created'] = stat.st_ctime
                        x[i]['modified'] = stat.st_mtime
                    except Exception as e:
                        self.delete_item(i)
                        del x[i]
        for i in x:
            if x[i]['dir']:
                y = [j for j in x[i]['list'] if not x.get(j)]
                if len(y):
                    x[i]['list'] = [j for j in x[i]['list'] if j not in y]
                    self.set_index(i,x[i])
        self.drive = x

    def register_item(self) -> str:
        '''生成 drive 物件 id'''
        item_id = b64_code(16)
        while item_id in self.drive:
            item_id = b64_code(16)
        return item_id

    def create_item(self,file,path_id=None):
        item_id = self.register_item()
        path = f'{items_path}{item_id}'
        os.makedirs(path)
        file.save(f'{path}/{file.filename}')
        data = {
            'dir': 0,
            'auth': 'public'
        }
        # 创建文件索引
        self.set_index(item_id,data)
        # 更新 drive 索引
        self.drive[path_id]['list'].append(item_id)
        # 更新文件夹索引
        self.set_index(path_id,self.drive[path_id])
        path = f'{items_path}{item_id}'
        data['filename'] = os.listdir(path)[0]
        path = f'{path}/{data["filename"]}'
        stat = os.stat(path)
        data['size'] = stat.st_size
        data['created'] = stat.st_ctime
        data['modified'] = stat.st_mtime
        self.drive[item_id] = data

    def set_index(self,item_id,data):
        x = {}
        for i in data:
            if i in ['dir','auth','list']:
                x[i] = data[i]
        f = open(f'{index_path}{item_id}',mode='w+',encoding='utf-8')
        f.write(dict2jsonstr(x))
        f.close()
        return item_id
    
    def get_folder(self,item_id):
        if self.drive[item_id]['dir']:
            x = dict(self.drive[item_id])
            y = {}
            for i in self.drive[item_id]['list']:
                y[i] = self.drive[i]
            x['list'] = y
            return self.permission_check(x)
        return None

    def has_item(self,item_id):
        if self.drive.get(item_id):
            return True
        return False
    
    def get_file(self,item_id):
        if self.has_item(item_id):
            path = f'{items_path}{item_id}'
            filename = os.listdir(path)[0]
            return f'{CWD}/{path}/{filename}'
        return None

    def unregister_item(self,item_id):
        self.drive[item_id]['auth'] = 'deleted'
        f = open(f'{index_path}{item_id}',mode='w+',encoding='utf-8')
        f.write(dict2jsonstr(self.drive[item_id]))
        f.close()
    
    def delete_item(self,item_id):
        item_indx = f'{index_path}{item_id}'
        item_path = f'{items_path}{item_id}'
        if os.path.isdir(item_path):
            for i in os.listdir(item_path):
                os.remove(f'{item_path}/{item_id}')
            os.remove(item_path)
        if os.path.isfile(item_indx):
            os.remove(item_indx)
        if self.drive.get(item_id):
            del self.drive[item_id]
    
    def permission_check(self,data):
        x = []
        for i in data['list']:
            if data['list'][i]['auth'] not in ['public','private']:
                x.append(i)
        for i in x:
            del data['list'][i]
        return data

Drive = Drive()

@drive.route('',methods=['GET','POST'])
def route_drive_root():
    if request.method == 'GET':
        return redirect('d/')
    action = request.form.get('action')
    item_id = request.form.get('item_id')
    if action == 'get-folder':
        return dict2jsonstr(Drive.get_folder(item_id or 'public'))
    elif action == 'upload':
        for i in request.files:
            path_id = 'public'
            Drive.create_item(request.files.get(i),path_id)
    elif action == 'delete':
        Drive.unregister_item(item_id)
    return '1'

@drive.route('d/')
def route_drive_d(item_id=''):
    return render_template('drive/view.html',appName=appName)

@drive.route('d/<path:item_id>')
def route_drive_d_path(item_id=''):
    if Drive.has_item(item_id):
        return send_file(Drive.get_file(item_id))
    return '<div style="position:absolute;transform:translate(-50%,-50%);top:50%;left:50%;text-align:center;user-select:none;"><h1>资源不存在</h1><a href="/drive/" style="color:blue;">返回</a><div>'

# front-end: 
# header: path(...), username (public) on right-top
# view: refer to admin/os, copy code from Avatar, preview window, upload button(create folder), menu (delete, rename, download)

# back-end: receive files, operation for files and folders
# drive structure:
# folder (id) /
#     file
#     index (data and permission of the file)
# file (id) (data of a folder on cloud drive)