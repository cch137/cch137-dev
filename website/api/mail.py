import base64
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from .Google import Create_Service


CLIENT_FILE = 'website/api/client.json'
API_NAME = 'gmail'
API_VERSION = 'v1'
SCOPES = ['https://mail.google.com/']


class Mail():
    def __init__(self):
        pass
        # try:
        #     self.service = Create_Service(CLIENT_FILE, API_NAME, API_VERSION, SCOPES)
        # except Exception as e:
        #     print(e)

    def send_email(self,email, subject, message):
        mimeMsg = MIMEMultipart()
        mimeMsg['to'] = email
        mimeMsg['subject'] = subject
        mimeMsg.attach(MIMEText(message, 'plain'))
        raw_string = base64.urlsafe_b64encode(mimeMsg.as_bytes()).decode()
        message = self.service.users().messages().send(userId='me', body={'raw': raw_string}).execute()
        return message

Mail = Mail()

# me = Mail.users().getProfile(userId='me').execute()

