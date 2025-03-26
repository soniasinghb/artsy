from flask import Flask, request, jsonify
from urllib.parse import urlparse
import requests
from datetime import datetime, timedelta
import os

app = Flask(__name__, static_url_path="/static", static_folder="static")

token_value=None
token_expiry=None

def getToken():
    global token_expiry, token_value
    base_url = 'https://api.artsy.net/api/tokens/xapp_token'
    payload = {
        'client_id' : os.getenv("CLIENT_ID"),
        'client_secret' : os.getenv("CLIENT_SECRET")
    }

    try: 
        response = requests.post(base_url, json=payload)
        if response.status_code==201:
            data=response.json()
            token_value=data['token']
            print(token_value)
            token_expiry=data['expires_at']
            return token_value
        else:
            return jsonify({
                'message': response.json()
            }), response.status_code
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@app.route("/")
def homepage():
    global token_value
    if token_value is None:
        getToken()
    return app.send_static_file("index.html")

# def validateToken():
#     current_time = datetime.time.now()
#     if(abs(current_time - token_expiry) == timedelta(days=7)):
#         getToken()

@app.route("/search")
def search_artist():
    if token_value is None:
        getToken()
    header_details = {
        'X-XAPP-Token': token_value
    }
    params = {
        'q': request.args.get("q"),    
        'size' : 10,
        'type' : 'artist'
    }
    base_url='https://api.artsy.net/api/search'

    try:
        response = requests.get(
            base_url,
            params,
            headers=header_details,
        )
        if response.status_code == 200:
            data=response.json()
            artists = []
            for i in range(min(10, len(data['_embedded']['results']))):
                artist = data['_embedded']['results'][i]
                artist_url = urlparse(artist['_links']['self']['href'])
                artist_ID = artist_url.path.split('/')[-1]
                artist_info = {
                    'artist_ID': artist_ID,
                    'artist_Image': artist['_links']['thumbnail']['href'],
                    'artist_Title': artist['title']
                }
                if artist_info['artist_Image'] == '/assets/shared/missing_image.png':
                    artist_info['artist_Image'] = '/static/artsy_logo.svg'
                artists.append(artist_info)
            return jsonify(artists), response.status_code
        else:
            return jsonify({
                'message': response.json(),
                'token_val': token_value
            }), response.status_code
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400
        
@app.route('/artist-details/<artistid>')
def get_artist_details(artistid):
    if token_value is None:
        getToken()
    artist_id = artistid
    base_url = f'https://api.artsy.net/api/artists/{artist_id}'

    headers = {
        'X-XAPP-Token': token_value
    }

    try:
        response = requests.get(base_url, headers=headers)
        if response.status_code==200:
            data=response.json()
            return jsonify({
                'artist_name' : data['name'],
                'artist_bday' : data['birthday'],
                'artist_dday' : data['deathday'],
                'artist_nationality' : data['nationality'],
                'artist_biography' : data['biography']
            })
        else:
            return jsonify({
                'message': data,
                'token_val': token_value
            }), response.status_code
        
    except Exception as e:
        return jsonify({
            'status' : 'error',
            'message' : str(e)
        }), 400

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080)
