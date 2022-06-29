# import re
# import time
# import random
# import requests

# login_url = 'https://accounts.google.com/ServiceLoginAuth'
# login_data = {'Email': 'cheechorngherng@gmail.com', 'Passwd': 'HHH2O&h2o'}
# session = requests.session()
# session.post(login_url, data=login_data)

# form_url = 'https://docs.google.com/forms/d/e/1FAIpQLSc37jfBNRe4UypgVuqdgkd4Yn5EiPiDQRUZHBbUuy1jWnKxig/formResponse'
# params = ['A', 'B', 'C', 'D']
# payload = {
#     'entry.1543493810' : '',
#     'fvv' : '1',
#     'pageHistory' : '0',
#     'fbzx' : '4542445433853336691'
# }

# num = 10  # number of executions
# delay = 0  # delay of execution
# while num > 0:
#     try:
#         payload['entry.1543493810'] = 'A'
#         res = session.post(form_url, data=payload)
#         res.raise_for_status()
#         if res.status_code == 200 :
#             print('Fill Out : ' + payload['entry.1543493810'] + ' delay : ' + str(1) + ' sec')
#             time.sleep(1)
#     except requests.HTTPError as e:
#         print(e)
    
#     num -= 1