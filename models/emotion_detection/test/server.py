#Global import
from flask import Flask, request, Response
import jsonpickle
import numpy as np
import cv2
import pprint
import base64
import json
from PIL import Image, ImageOps
from io import BytesIO

#local imports
import process
# Initialize the Flask application
app = Flask(__name__)

_all_emotions = {0:'angry', 1:'disgust', 2:'fear', 3:'happy', 4:'sad', 5:'surprise', 6:'neutral'}


def select_emotions(emotions):
    indexes = []
    for key, value in _all_emotions.items():
        if value in emotions: indexes.append(key)
    return indexes


# route http posts to this method
@app.route('/api/test', methods=['POST'])
def test():
    r = request

    data = jsonpickle.decode(r.data)
    frmaes = data['data']
    emotions = data['emotions']
    emotion_indexes = select_emotions(emotions)
    result = []
    for key, value in frmaes.items():
        print (f'this is frame {key}')

        byte_data = base64.b64decode(value)
        image_data = BytesIO(byte_data)
        img = Image.open(image_data)
        
        # do some fancy processing here....
        state, values = process.run(img, emotions)
        frame_i = []
        if state:
            for i,out in enumerate(values):
                if i in emotion_indexes:
                    frame_i.append(out.item())
            
                result.append(frame_i)
    result = np.array(result)
    
    # build a response dict to send back to client
    result_mean = np.mean(result, axis=0)
    response = {}
    k = 0
    for i in emotion_indexes:
        response[_all_emotions[i]] = result_mean[k]
        k += 1
        
    # encode response using jsonpickle
    response_pickled = jsonpickle.encode(response)

    return Response(response=response_pickled, status=200, mimetype="application/json")


# start flask app
app.run(host="0.0.0.0", port=5000)