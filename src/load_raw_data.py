import pandas as pd
import requests

def load_csv(csv_path):
    return pd.read_csv(csv_path, encoding="utf-8")

def geocode_address(address, api_key):
    if not address:
        return None, None
    url = "https://restapi.amap.com/v3/geocode/geo"
    params = {
        "key": AMAP_KEY,
        "address": address,
        "city": "上海",
        "output": "JSON"
    }
    try:
        res = requests.get(url, params=params, timeout=5)
        data = res.json()
        if data['status'] == '1' and data['geocodes']:
            lng, lat = map(float, data['geocodes'][0]['location'].split(','))
            return lng, lat
    except Exception as e:
        print(f"⚠ 地址解析失败: {address} | {e}")
    return None, None

