import json
import re
import urllib.request

HOST = 'heavyprom.ru'
KEY = '2bc5e5993d106c9175cc50143adf24b2'
SITEMAP = f'https://{HOST}/sitemap.xml'
ENDPOINTS = ['https://yandex.com/indexnow', 'https://api.indexnow.org/indexnow']
CORS = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}


def handler(event: dict, context) -> dict:
    """Отправляет все страницы из sitemap.xml в Яндекс и Bing через протокол IndexNow"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {**CORS, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    req = urllib.request.Request(SITEMAP, headers={'User-Agent': 'IndexNowBot'})
    xml = urllib.request.urlopen(req, timeout=3).read().decode('utf-8')
    urls = re.findall(r'<loc>\s*([^<\s]+)\s*</loc>', xml)

    payload = json.dumps({
        'host': HOST,
        'key': KEY,
        'keyLocation': f'https://{HOST}/{KEY}.txt',
        'urlList': urls,
    }).encode('utf-8')

    results = {}
    for endpoint in ENDPOINTS:
        r = urllib.request.Request(endpoint, data=payload, method='POST', headers={'Content-Type': 'application/json; charset=utf-8'})
        try:
            results[endpoint] = urllib.request.urlopen(r, timeout=3).status
        except urllib.error.HTTPError as e:
            results[endpoint] = e.code
        except Exception as e:
            results[endpoint] = str(e)

    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'sent': len(urls), 'results': results})}
