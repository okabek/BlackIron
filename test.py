import requests
import json

##

response = requests.post("http://127.0.0.1:5000/send_robux?gamepass_id=1898552818&robux=5&uid=3621096114")

print(response.text)
