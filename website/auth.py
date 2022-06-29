from .api.sheet import gsheet
from .api.mail import Mail
import random
import time


ss = gsheet('1vvCMmaoQE-Dt7IOEPjjwjPaYUAvF_klofaC6_6dSnfA')
ws = ss.get_worksheet_by_id(0)


class VerifyCode():
    def __init__(self,email):
        self.email = email
        self.code = ''.join([str(random.randint(0,9)) for i in range(4)])
        self.error = None
        try:
            Mail.send_email(email,'Email Verificaton',f'Your code is: {self.code}')
        except Exception:
            self.error = 'Mail validation failed.'
        self.expired = False
        self.verified = False
        self.expire = time.time() + 300 # after 5 minutes
        self.life = 3
    
    def verify(self,email,code):
        if self.expired:
            pass
        elif time.time() > self.expire or not self.life:
            self.error = 'The verification code has expired.'
            self.expired = True
        else:
            if code == self.code:
                self.verified = True
                self.expired = True
            else:
                self.life -= 1


class Auth():
    def __init__(self):
        self.verify_dict = {}

    def add_acc(email: str, password: str, username: str):
        data = (email,password,username)
        ws.add_rows(1)
        for i in range(len(data)):
            ws.update_cell(ws.row_count+1,i+1,data[i])

    def regis_new_verify(self,email):
        v = VerifyCode(email)
        self.verify_dict[v.email] = v
    
    def regis_check_verify(self,email,code) -> VerifyCode:
        for i in self.verify_dict:
            if i == email:
                v = self.verify_dict[i]
                v.verify(email,code)
                return v
        return None
    
    def clear_verify_dict():
        now = time.time()
        l = []
        for i in self.verify_dict:
            v = self.verify_dict[i]
            if now > v.expire:
                v.expired = True
            if v.expired:
                l.append(i)
        for i in l:
            del self.verify_dict[i]