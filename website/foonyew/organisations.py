import requests
from bs4 import BeautifulSoup
import json

data = {}

def process_page(dp,item_list):
    '''处理页面 bs4 物件'''
    for item in item_list.find_all('div', {'class': 'team-member'}):
        # 取得名字
        item_name = item.find('h3').text.strip()
        # 取得职位
        job = f'{dp} {item.find("p").text.strip()}'
        # 如果存在 data，新增职位
        # 否则创建键值对（名字: [职位]）
        if data.get(item_name):
            data[item_name].append(job)
        else:
            # 取得头像源
            pf_pic = item.find('img')['src']
            data[item_name] = [pf_pic,job]


def parse_page_conc(url: str):
    r = requests.get(url)

    soup = BeautifulSoup(r.text,'html.parser')

    # 取得所有 tab
    tab_panes = [i for i in soup.find_all('div', {'class': 'tab-pane'})]

    # 建立键值对（tab id : 部门中文名字）
    tabs = dict(zip(
        # 取得 tab id
        [i['id'] for i in tab_panes],
        # 取得导航栏的部门名字
        [i.text.strip() for i in soup.find_all('a', {'class': 'nav-link', 'data-toggle': 'tab'})]
    ))

    # 处理每个 tab
    for tab in tab_panes:
        # 取得部门中文名
        dp = tabs[tab['id']]
        # 处理每个 tab
        process_page(dp, tab)


def parse_page_dil(url: str):
    r = requests.get(url)

    soup = BeautifulSoup(r.text,'html.parser')

    # 建立键值对（部门名字: 名单标签）
    departments = dict(zip(
        # 取得所有部门名字
        [i.text for i in soup.find_all('h1',{'class': 'page-title'})],
        # 取得所有部门的成员名单
        soup.find_all('div',{'class':'row grid-space-10 justify-content-center'})
    ))
    
    for dp in departments:
        # 处理标签
        process_page(dp,departments[dp])

def run():
    data = {}

    # 行政组织
    parse_page_conc('https://www.foonyew.edu.my/organisations/executives')
    # 师资阵容
    parse_page_conc('https://www.foonyew.edu.my/organisations/teachers')

    # 董事会
    parse_page_dil('https://www.foonyew.edu.my/organisations/directors')
    # 董事会下属部门
    parse_page_dil('https://www.foonyew.edu.my/organisations/subsidiary-of-directors')
    # 教职员工联谊会
    parse_page_dil('https://www.foonyew.edu.my/organisations/staff-association')
    
    json.dump(data,open('DATA/organisations.json',mode='w+',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))

