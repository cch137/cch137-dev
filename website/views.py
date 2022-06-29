# 直属于 app
from flask import Blueprint, render_template, redirect, request, jsonify, send_from_directory, send_file, make_response #, url_for
from urllib.parse import unquote
import json
import time

views = Blueprint('views', __name__)
appName = 'LEI137'

@views.route('')
def domain_origin():
    return render_template('app/home.html',appName=appName)
@views.route('home')
def route_home():
    return domain_origin()
@views.route('tools')
def route_tools():
    return domain_origin()
@views.route('links')
def route_new():
    return domain_origin()
@views.route('about')
def route_about():
    return domain_origin()

@views.route('search')
def route_search():
    return redirect('/stusearch')
@views.route('stusearch')
def route_stu_search():
    return render_template('app/stusearch.html',appName=appName)
@views.route('stuadvsearch')
def route_stu_adv_search():
    return render_template('app/stusearch.html',appName=appName)

@views.route('drive/<path:filename>')
def route_drive_static(filename):
    return send_from_directory('../drive', filename)

@views.route('dev/<path:filename>')
def route_dev_static(filename):
    return send_from_directory('dev', filename)

@views.route('templates/<path:filename>')
def route_templates_static(filename):
    return send_from_directory('dev', filename)

@views.route('login', methods=['GET','POST'])
def route_login():
    return render_template('app/login.html',appName=appName)

Schedules = json.loads(open('DATA/schedules.json',encoding='utf-8',mode='r').read())
for i in Schedules:
    Schedules[i] = json.dumps(Schedules[i],ensure_ascii=False,separators=(',',':'))
@views.route('sche/<classcode>', methods=['GET'])
def route_views_sche(classcode):
    classcode = classcode.upper()
    return render_template('app/sche.html',appName=appName,classcode=classcode,data=Schedules.get(classcode))

@views.route('ogns', methods=['GET'])
def route_ogns():
    return render_template('app/ogns.html',appName=appName)

# @views.route('db/<code>/')
# def open_db(code):
#     try:
#         f = open(f'database/{code}.xlsx')
#         return render_template('db.html',filename=code,data=f.read())
#     except BaseException:
#         return redirect('/')


tools = Blueprint('tools', __name__)

from .modules import cryp

@tools.route('cryp', methods=['GET','POST'])
def route_tools_cryp():
    if request.method == 'GET':
        return render_template('tools/cryp.html')
    try:
        mode = request.json['mode'].upper()
        _typ = request.json['type'].lower()
        text = request.json['text']
        if _typ in ('64','zh'):
            if mode == 'ENCODE':
                return make_response(cryp.encode(_typ,text))
            elif mode == 'DECODE':
                return make_response(cryp.decode(_typ,text))
    except Exception as e:
        print(e)
    return '', 500

@tools.route('draw', methods=['GET'])
def route_tools_draw():
    return render_template('tools/draw.html')

@tools.route('draw_ew', methods=['GET'])
def route_tools_draw_ew():
    return render_template('tools/draw_ew.html')

@tools.route('seat', methods=['GET'])
def route_tools_seat():
    return render_template('tools/seat.html')

from .modules import identity_parser, clean_dict

@tools.route('ip', methods=['GET','POST'])
def route_parsed_requset():
    idt = clean_dict(identity_parser(request))
    if request.method == 'GET':
        return  f'''<head>
<title>IP | {appName}</title>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Check your ip">
<link href="/static/favicon.png" type="image/x-icon" rel="icon">
<link href="/static/favicon.png" type="image/x-icon" rel="shortcut icon">
<script>history.replaceState(0,0,location.pathname)</script>
</head>
<body style="margin:0;background-color:black;color:white;overflow:hidden;user-select:none;">
<div style="position:absolute;width:100vw;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;">
<h1>Hi, your ip is {idt["ip"]}</h1>
<div>{json.dumps(idt["ua"],ensure_ascii=False)}</div>
</div>
</body>'''
    return idt


games = Blueprint('games', __name__)

@games.route('xox')
def route_game_xox():
    return render_template('games/xox.html')

@games.route('balloons')
def route_game_balloons():
    return render_template('games/balloons.html')

@games.route('2d-kingdom')
def route_game_2d_kingdom():
    return render_template('games/2D-Kingdom.html',appName=appName)

@games.route('starry-sky')
def route_game_starry_sky():
    return render_template('games/starry-sky.html',appName=appName)