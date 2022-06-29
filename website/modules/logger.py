import os
import time
import json

class Logger():
    def __init__(self):
        self.logs = {}
        self.load()

    def add(self,parsed):
        self.logs[str(time.time())] = parsed
        self.save()
        return parsed
    
    def clear(self):
        self.logs = {}
        return self.save()

    def load(self):
        try:
            f = open('DATA/logs',mode='r',encoding='utf-8')
            self.logs = json.loads(f.read())
            f.close()
        except Exception as e:
            print(e)
        return self.logs
    
    def save(self):
        f = open('DATA/logs',mode='w+',encoding='utf-8')
        f.write(json.dumps(self.logs,ensure_ascii=False,separators=(',',':')))
        f.close()
        return self.logs
    
    def export(self):
        return json.dumps(self.logs,ensure_ascii=False,separators=(',',':'))

Logger = Logger()