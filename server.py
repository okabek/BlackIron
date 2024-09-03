import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import random
import coinaddrvalidator
import json
import time
import threading 

##

app = Flask(__name__)
CORS(app)
live_feed = []
stored_cookies = []
orders = {}

##

def gen_fake():
    if (random.randint(1, 3) == 1):
        return ("1000|null")


    amt = random.randint(1000, 15000)
    length = len(str(amt)) - 2

    for i in range(length):
        amt /= 10


    amt = round(amt)

    for i in range(length):
        amt *= 10

    return (str(amt) + "|null")



def fake_task():
    while True:
        time.sleep(random.randint(60, 240))

        size = len(live_feed)

        for i in range(size):
            if (i < size - 1):
                live_feed[i] = live_feed[i + 1]


        live_feed[size - 1] = gen_fake()


##

for i in range(10):
    live_feed.append(gen_fake())

##

@app.route("/get_gamepass_status", methods=['POST'])
def get_gamepass_status():
    data = request.json
    response = requests.get("https://apis.roblox.com/game-passes/v1/game-passes/" + data.get('id') + "/product-info")

    return response.json()


@app.route("/get_live_feed", methods=['GET'])
def get_live_feed():
    return jsonify(live_feed)


def get_robux(cookie):
    robux = 0
    xcsrf = 0

    try:
        cookies = {
            '.ROBLOSECURITY': cookie,
        }

        xcsrf = requests.post("https://auth.roblox.com/v2/logout", cookies=cookies)

        if ('X-CSRF-TOKEN' in xcsrf.headers):
            xcsrf = xcsrf.headers['X-CSRF-TOKEN']

            headers = {
                'x-bound-auth-token': xcsrf
            }

            response1 = requests.get("https://users.roblox.com/v1/users/authenticated", cookies=cookies,
                                     headers=headers).json()
            response2 = requests.get(f"https://economy.roblox.com/v1/users/{response1['id']}/currency", cookies=cookies,
                                     headers=headers).json()
            robux = response2["robux"]

    except:
        robux = 0


    return robux, xcsrf


@app.route("/get_stock", methods=["GET"])
def get_stock():
    total = 0
    accounts = 0

    for cookie in stored_cookies:
        robux, xsref = get_robux(cookie.split("#")[0])
        total += robux

        if (total > 0):
            accounts += 1


    return jsonify({"total": total, "accounts": accounts})


@app.route("/check_cookie", methods=["POST"])
def check_cookie():
    cookie = request.json.strip()

    for i in stored_cookies:
        if (i.split("#")[0] == cookie):
            return jsonify("already")


    cookies = {
        '.ROBLOSECURITY': cookie,
    }

    response = requests.post("https://auth.roblox.com/v2/logout", cookies=cookies)

    if ('X-CSRF-TOKEN' in response.headers):
        xcsrf = response.headers['X-CSRF-TOKEN']

        headers = {
            'x-bound-auth-token': xcsrf
        }

        response1 = requests.get("https://users.roblox.com/v1/users/authenticated", cookies=cookies, headers=headers).json()
        response2 = requests.get(f"https://economy.roblox.com/v1/users/{response1['id']}/currency", cookies=cookies, headers=headers).json()

        return jsonify({"name": response1['name'], "robux": response2['robux']})

    else:
        return jsonify("error")


@app.route("/check_address", methods=['POST'])
def check_address():
    json = request.json
    address = json['address'].strip()
    cookie = json['cookie'].strip()
    result = coinaddrvalidator.validate('ltc', address)

    if (result.valid):
        stored_cookies.append(cookie + "#" + address)

        return jsonify("valid")

    else:
        return jsonify("error")


@app.route("/remove_cookie", methods=["POST"])
def remove_cookie():
    cookie = request.json.strip()
    found = "false"

    for sample in stored_cookies: 
        if (cookie == sample.split("#")[0]):
            found = "true" 


    return jsonify(found)


@app.route("/get_payment", methods=["POST"])
def get_payment():
    dat = request.json
    gamepass_id = dat['gamepass_id'].strip()
    robux = dat['robux'].strip()
    id = str(dat['sellerid']).strip()
    amt = round(int(robux) / 1000 * 3.5)

    data = {
        'merchant': "NZU54P-ZU8H7S-X2B0YM-5M0GDP",
        'amount': 0.1,
        'lifeTime': 60,
        'feePaidByPayer': 1,
        'underPaidCover': 2.5,
        'callbackUrl': 'http://127.0.0.1:5000/send_robux?gamepass_id=' + gamepass_id + "&robux=" + robux + "&uid=" + id,
        'returnUrl': 'http://127.0.0.1:5500/success.html',
    }

    response = requests.post("https://api.oxapay.com/merchants/request", data=json.dumps(data))
    orders['gamepass_id'] = amt

    return jsonify(response.json()['payLink'])


@app.route("/send_robux", methods=["POST"])
def send_robux():
    args = request.args
    gamepass_id = args.get('gamepass_id')
    price = args.get('robux')
    uid = args.get('uid')
    chosen_cookie = None
    chosen_xcref = None

    for i in stored_cookies:
        robux, xcref = get_robux(i.split("#")[0])

        if (robux >= int(price)):
            chosen_cookie = i.split("#")[0]
            chosen_xcref = xcref

            break


    if (not chosen_cookie):
        return "failed"


    cookies = {
        '.ROBLOSECURITY': chosen_cookie,
    }

    headers = {
        'x-csrf-token': chosen_xcref,
    }

    json_data = {
        'expectedCurrency': 1,
        'expectedPrice': price,
        'expectedSellerId': uid,
    }

    response = requests.post(
        f'https://apis.roblox.com/game-passes/v1/game-passes/{gamepass_id}/purchase',
        cookies=cookies,
        headers=headers,
        json=json_data,
    )

    size = len(live_feed)

    for i in range(size):
        if (i < size - 1):
            live_feed[i] = live_feed[i + 1]


    live_feed[size - 1] = str(price) + "|" + str(random.randint(1, 999999999999999))

    return "success"


##

if (__name__ == "__main__"):
    thread = threading.Thread(target=fake_task)
    thread.daemon = True 
    thread.start()

    app.run()


