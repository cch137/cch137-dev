from flask import Flask, redirect, request, render_template, make_response, Response
from flask_cors import CORS
from urllib.parse import urlparse
from .auth import Auth


app = Flask(__name__)
app.config['SECRET_KEY'] = 'CCH137'
appName = 'LEI137'
CORS(app, supports_credentials=True)


# Jinja custom
app.jinja_env.variable_start_string = '{*'
app.jinja_env.variable_end_string = '*}'
app.jinja_env.block_start_string = '{%'
app.jinja_env.block_end_string = '%}'
app.jinja_env.comment_start_string = '{/-'
app.jinja_env.comment_end_string = '-/}'

# 处理自定义错误重定向
from werkzeug.http import HTTP_STATUS_CODES
def config_error_handler():
    def error_response(c,n,d):
        return render_template('error.html', code=c,name=n, description=d),c
    def conf_err(_):
        # 小写且去除最后一个斜线
        url_path = [i for i in urlparse(request.url).path.lower()]
        while url_path[-1] == '/':
            url_path.pop()
        while url_path[0] == '/':
            url_path.pop(0)
        url_path = ''.join(url_path)
        print(url_path)
        # 重新查询路径是否存在
        if url_path in app.config['routes']:
            return redirect(url_path)
        else:
            x = request.routing_exception
            _name = x.name
            if x.code == 404:
                _name = 'Page Not Found'
            return error_response(x.code,_name,x.description)
    app.config['routes'] = set([route.rule for route in app.url_map.iter_rules()])
    for i in HTTP_STATUS_CODES:
        try:
            app.errorhandler(i)(conf_err)
        except:
            pass
config_error_handler()


# Blueprint register
from .datareq import datareq
from .admin import admin, delete_temps
from .views import views, tools, games
from .drive import drive
app.register_blueprint(views, url_prefix='/')
app.register_blueprint(tools, url_prefix='/tools/')
app.register_blueprint(games, url_prefix='/games/')
app.register_blueprint(datareq, url_prefix='/d/')
app.register_blueprint(drive, url_prefix='/drive/')
app.register_blueprint(admin, url_prefix='/admin/')


from .modules import Logger, request_parser, identity_parser, spawn_sessions_id, minify_templates
from .foonyew import Schedule

@app.before_request
def check_session_id():
    # return '''<style>@import url(https://fonts.googleapis.com/css2?family=Roboto&display=swap);@import url(https://fonts.googleapis.com/css2?family=Noto+Sans+SC&display=swap);@import url(https://fonts.googleapis.com/css2?family=Noto+Sans+TC&display=swap);*{font-family:'Roboto','Noto Sans SC','Noto Sans TC','Microsoft YaHei';-webkit-tap-highlight-color:transparent;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;-moz-text-size-adjust:none;}</style><body style="background-color:rgb(24,27,30);color:#fff;user-select:none;"><h1 style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(1.5);letter-spacing:8px;">COOMING SOON</h1></body>'''
    if request.path.split('/')[1] in ['static','favicon.ico']:
        return None
    if ('session' not in request.cookies) or (not identity_parser(request).get('ua')):
        x = Response(
            response=render_template('intro.html',appName=appName,path=request.path,full_path=request.full_path),
            status=302,
            mimetype="text/html",
        )
        x.headers["Location"] = request.full_path
        x.set_cookie('session',spawn_sessions_id())
        return x

@app.after_request
def app_access_log(response):
    Logger.add(request_parser(request,response))
    return response

@app.route('/favicon.ico')
def route_favicon_ico():
    return redirect('/static/favicon.png')


# delete_temps()
# minify_templates()

#########################
#        BLOCKED        #
#########################
import time
now = time.time()
minify_data = open('DATA/minify',mode='r',encoding='utf-8').read()
if float(minify_data) < now - 10:
    delete_temps()
    minify_templates()
minify_data = open('DATA/minify',mode='w+',encoding='utf-8')
now = time.time()
minify_data.write(str(now))
minify_data.close()


# 限制请求次数
# class ipBanner():
#     def __init__(self):
#         self.list = []
#         self.recent = {}
#         # 每 1 分钟清空 ipBanner.recent
#         # 每 5 分钟清空 ipBanner.list
#         self.interval = {
#             'list': 60,
#             'recent': 300
#         }
#         self.expire = {
#             'list': 0,
#             'recent': 0
#         }
#     def cleaner(self):
#         t = time.time()
#         if t > self.expire['list']:
#             self.list = []
#             self.expire['list'] = t + self.interval['list']
#         if t > self.expire['recent']:
#             self.recent = {}
#             self.expire['recent'] = t + self.interval['recent']
# @app.before_request
# def app_before_request():
#     sd = SecureDict(request)
#     if sd['ip'] in ipBanner.list:
#         return 'ERROR 403 你的访问频率过高'
#     elif not sd['ua']['platform'] and not sd['ua']['browser']:
#         return 'ERROR 403 不正常访问'
#     if sd['ip'] not in ipBanner.recent:
#         ipBanner.recent[sd['ip']] = {}
#     if request.path not in ipBanner.recent[sd['ip']]:
#         ipBanner.recent[sd['ip']][request.path] = 1
#     else:
#         ipBanner.recent[sd['ip']][request.path] += 1
#     x = request.routing_exception
#     if x:
#         if x.code//100 == 4:
#             if 'ERROR' not in ipBanner.recent[sd['ip']]:
#                 ipBanner.recent[sd['ip']]['ERROR'] = 1
#             else:
#                 ipBanner.recent[sd['ip']]['ERROR'] += 1
#     if max(ipBanner.recent[sd['ip']].values()) > 60:
#         ipBanner.list.append(sd['ip'])

# ipBanner = ipBanner()

# @app.after_request
# def app_after_request(response):
#     ipBanner.cleaner()
#     return response

# 当 debug 时执行一些什么，通常是终止无限循环的线程
# if not app.config['DEBUG']:

# from flask import Response