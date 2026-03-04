from load_raw_data import *
from clean_fields import *
import time
import pandas as pd
import json
import re
import os
import time
from load_raw_data import *
from clean_fields import *

# -------------------------- project directory--------------------------
current_script_path = os.path.abspath(__file__)
current_dir = os.path.dirname(current_script_path)
root_dir = os.path.abspath(os.path.join(current_dir, '../../'))

# -------------------------- CSVpath --------------------------
csv_path = os.path.join(current_dir, '上海.csv')
df = pd.read_csv(csv_path, sep=',', encoding='utf-8', quotechar='"')
df.columns = df.columns.str.strip()

# -------------------------- Gmap API Key --------------------------
AMAP_KEY = 'ab012992f60e327b5e5bbf5a9f4ecab6'

TYPE_MAP = {
    "主题乐园与休闲度假区|Theme Park & Resort": [
        "上海迪士尼度假区", "迪士尼小镇", "上海海昌海洋公园", "上海影视乐园",
        "东方绿舟", "太阳岛旅游度假区", "海上花岛生态度假村",
        "豫园星空梦幻馆", "上海星空艺术馆"
    ],
    "古镇老街与历史街区|Ancient Town & Historic Street": [
        "朱家角古镇", "七宝老街", "七宝古镇", "枫泾古镇", "南翔古镇",
        "南翔老街", "上海老街", "步高里", "田子坊石库门",
        "老上海1930风情街", "1192弄老上海风情街",
        "多伦路文化名人街", "乍浦路桥"
    ],
    "地标建筑与城市观光|Landmark & City Sightseeing": [
        "东方明珠", "上海中心大厦", "上海之巅观光厅", "上海环球金融中心",
        "金茂大厦", "陆家嘴", "外滩", "外白渡桥", "南浦大桥",
        "马勒别墅", "德莱蒙德住宅", "沙美大楼", "1933老场坊",
        "泰晤士小镇", "上海展览中心", "圣母大堂",
        "杨浦滨江", "奉贤渔人码头", "黄浦江", "黄浦江观光区"
    ],
    "自然生态与城市公园|Nature & City Park": [
        "顾村公园", "辰山植物园", "静安雕塑公园", "大宁灵石公园",
        "共青森林公园", "世纪公园", "上海植物园", "中新泾公园",
        "黄兴公园", "闵行体育公园", "中山公园", "古猗园",
        "上海动物园", "薰衣草公园", "花开海上生态园",
        "东滩湿地公园", "东平国家森林公园", "青西郊野公园",
        "广富林郊野公园", "上海滨江森林公园",
        "横沙岛", "长兴岛", "滴水湖", "淀山湖风景区"
    ],
    "博物馆与文化艺术|Museum & Cultural Art": [
        "上海自然博物馆", "上海科技馆", "上海博物馆", "上海市历史博物馆",
        "上海汽车博物馆", "上海天文馆", "龙美术馆",
        "中华艺术宫", "上海当代艺术博物馆",
        "上海海洋水族馆", "上海长风海洋世界", "上海马戏城"
    ],
    "特色商圈与美食街区|Shopping & Food Street": [
        "南京路步行街", "吴江路", "人民广场", "新天地", "田子坊",
        "武康路", "陕西南路", "思南路", "甜爱路", "肇周路",
        "上海犹太难民纪念馆"
    ],
    "宗教与民俗特色场馆|Religious & Folk Venue": [
        "豫园", "城隍庙", "城隍庙旅游区", "静安寺"
    ],
    "文化遗址与红色地标|Cultural & Red Landmark": [
        "广富林文化遗址", "广富林遗址文化公园",
        "中共一大会址", "周公馆"
    ]
}

def assign_type(name):
    name = clean_text(name)
    for type_label, spots in TYPE_MAP.items():
        for spot in spots:
            if spot in name:
                return type_label
    return "其他|Other"

# ========================== Main processing flow==========================

processed_data = []

for _, row in df.iterrows():
    contact = split_contact_info(row['地址'])
    address = contact['地址']
    name = clean_text(row.get('名字', ''))

    lng, lat = get_lnglat(address)
    if lng is None:
        lng, lat = 121.4737, 31.2304

    attraction = {
        "名称": name,
        "类型": assign_type(name),
        "地址": address,
        "电话": contact['电话'],
        "官网": contact['官网'],
        "链接": clean_text(row.get('链接', '')),
        "介绍": clean_text(row.get('介绍', '')),
        "开放时间": clean_text(row.get('开放时间', '')),
        "评分": str(row['评分']) if '评分' in row and not pd.isna(row['评分']) else "",
        "建议游玩时间": clean_text(row.get('建议游玩时间', '')),
        "建议季节": clean_text(row.get('建议季节', '')),
        "门票": clean_text(row.get('门票', '')),
        "小贴士": clean_text(row.get('小贴士', '')),
        "lng": lng,
        "lat": lat
    }

    processed_data.append(attraction)
    time.sleep(0.2)
    ...

json_path = os.path.join(root_dir, 'attractions.json')
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(processed_data, f, ensure_ascii=False, indent=2)

print("✅ CSV → JSON Completed (precisely classified into 9 major types)")
print(f"📄 输出路径：{json_path}")