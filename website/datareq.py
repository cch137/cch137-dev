# 直属于 app
from flask import Blueprint, render_template, redirect, request, jsonify, send_file, send_from_directory, make_response
import os
import json
import time
import random

from . import app
from .modules.cryptography import easy_cryp

datareq = Blueprint('req', __name__)
appName = 'DB'
CWD = f'{os.getcwd()}'.replace('\\','/')

class Students():
    def __init__(self):
        self.data = json.loads(open('DATA/students.json',encoding='utf-8',mode='r').read())
        self.chart = {}
        for i in self.data:
            self.chart[i] = {}
            for j in self.data[i]:
                if j in ['reps','classes']:
                    continue
                if j in ['cc']:
                    self.chart[i][j] = self.data[i][j][max(self.data[i][j].keys())]
                else:
                    self.chart[i][j] = self.data[i][j]
        self.banned_list = ['160670']
        self.chart = json.dumps(self.chart,ensure_ascii=False,separators=(',',':'))

    def get_render_data(self,stu_id):
        print('GET: ',stu_id)
        try:
            if stu_id in self.data and stu_id not in self.banned_list:
                return make_response(render_template('database/student.html',
                    student=stu_id,
                    appName=appName))
        except Exception:
            pass
        return render_template('error.html',code='404',name='Resource Not Found'),404


Students = Students()

request_cache = {}

@datareq.route('time', methods=['GET'])
def getServerTime():
    return str(time.localtime())

@datareq.route('roll', methods=['POST'])
def roll():
    return Students.chart

@datareq.route('stu', methods=['GET','POST'])
def route_student():
    if request.method == 'GET':
        q = request.form.get('x') or request.args.get('x') or ''
        return redirect(f'/d/stu/{easy_cryp.encode(q)}/')
    q = request.form.get('q') or request.args.get('q') or ''
    return easy_cryp.encode(q)

@datareq.route('stu/<k>/', methods=['GET','POST'])
def route_student_k(k):
    k = easy_cryp.decode(k)
    if request.method == 'GET':
        return Students.get_render_data(k)
    k = Students.data.get(k)
    return json.dumps(k,ensure_ascii=False,separators=(',',':'))

@datareq.route('ogns', methods=['POST'])
def route_ogns_data():
    return open('DATA/organisations.json',mode='r',encoding='utf-8').read()

def admin_login_hint_string(k):
    e = True
    n = k / 4
    n = max(n,1)
    while e:
        x = ''.join([str(random.randint(0,9)) for i in range(k)])
        while len(x) < k:
            x = '0' + x
        e = False
        for i in x:
            if x.count(i) > n:
                e = True
                break
    return x
@datareq.route('admin-login-hint', methods=['POST'])
def route_admin_login_path():
    k = 3
    x = f'{admin_login_hint_string(k)}{admin_login_hint_string(k)}'
    return x
