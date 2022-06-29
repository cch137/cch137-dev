from ..api.sheet import gsheet
import json


def build_dict(table):
    key = table.pop(0)
    table = {item[0]: dict(zip(key,item)) for item in table if len(item)}
    for key in table:
        table[key] = {k: table[key][k] for k in table[key] if table[key][k]}
    return table


class Schedule():
    def __init__(self):
        self.load(json.load(open('DATA/schedule.json',mode='r',encoding='utf-8')))
    
    def connect(self):
        ws = gsheet('1ol9sIBWbUGWUhsfMEwB9VjUOaCTg7K6bbNCBepRvkLU').worksheets()
        db_sche = build_dict(ws[0].get())
        db_tchr = build_dict(ws[1].get())
        ws = {
            'classes': db_sche,
            'teachers': db_tchr
        }
        self.load(ws)
        ws = json.dumps(ws,ensure_ascii=False,separators=(',',':'))
        open('DATA/schedule.json',mode='w+',encoding='utf-8').write(ws)

    def load(self,data):
        self.classes = {i: json.dumps(data['classes'][i],ensure_ascii=False,separators=(',',':')) for i in data['classes']}
        self.teachers = {i: json.dumps(data['teachers'][i],ensure_ascii=False,separators=(',',':')) for i in data['teachers']}


Schedule = Schedule()