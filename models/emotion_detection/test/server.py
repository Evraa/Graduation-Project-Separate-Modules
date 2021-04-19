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


# route http posts to this method
@app.route('/api/test', methods=['POST'])
def test():
    r = request

    data = jsonpickle.decode(r.data)
    frmaes = data['data']
    emotions = data['emotions']
    for key, value in frmaes.items():
        print (f'this is frame {key}')

        # jpg_original = base64.b64decode(value)
        # jpg_as_np = np.frombuffer(jpg_original, dtype=np.uint8)
        # img = cv2.imdecode(jpg_as_np, cv2.IMREAD_COLOR)
        
        byte_data = base64.b64decode(value)
        image_data = BytesIO(byte_data)
        img = Image.open(image_data)
        
        # do some fancy processing here....
        state, values = process.run(img, emotions)

    # build a response dict to send back to client
    response = {'message': 'image received. size={}x{}'.format(img.shape[1], img.shape[0])}
    # encode response using jsonpickle
    response_pickled = jsonpickle.encode(response)

    return Response(response=response_pickled, status=200, mimetype="application/json")


# start flask app
app.run(host="0.0.0.0", port=5000)