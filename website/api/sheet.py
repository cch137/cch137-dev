import time

import gspread
from oauth2client.service_account import ServiceAccountCredentials

def gsheet(file_id) -> gspread.Spreadsheet:
    # 137emailservice@gmail.com
    credentials = ServiceAccountCredentials.from_json_keyfile_name(
        'website/api/credentials.json',
        'https://spreadsheets.google.com/feeds')
    client = gspread.authorize(credentials)
    return client.open_by_key(file_id)

# print(gsheet('1vvCMmaoQE-Dt7IOEPjjwjPaYUAvF_klofaC6_6dSnfA'))