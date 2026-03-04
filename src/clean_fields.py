import pandas as pd
from load_raw_data import *
def clean_text(text):
    if pd.isna(text):
        return ""
    text = str(text)
    text = re.sub(r'\n+', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    return text

# -------------------------- 拆分地址、电话、官网 --------------------------
def split_contact_info(full_text):
    full_text = clean_text(full_text)
    result = {'地址': '', '电话': '', '官网': ''}

    addr_match = re.search(r'地址[:：]?\s*(.*?)(?=\s*电话[:：]|\s*官网[:：]|$)', full_text)
    if addr_match:
        result['地址'] = addr_match.group(1).strip()
    else:
        result['地址'] = full_text.split('电话')[0].split('官网')[0].strip()

    phone_match = re.search(r'电话[:：]?\s*([0-9\-\+\(\) ]{6,})', full_text)
    if phone_match:
        result['电话'] = phone_match.group(1).strip()

    url_match = re.search(r'官网[:：]?\s*(https?://[^\s]+|www\.[^\s]+)', full_text)
    if url_match:
        result['官网'] = url_match.group(1).strip()

    return result