#Global imports 
import requests
import json, jsonpickle
import cv2
import pprint
import os
import sys
import numpy as np
import base64
from PIL import Image, ImageOps
from io import BytesIO

#Global Variables
addr = 'http://localhost:5000'
test_url = addr + '/api/test'

def establish_network():
    # prepare headers for http request
    content_type = 'image/jpeg'
    headers = {'content-type': content_type}
    return headers

def extract_frames(r_range,l_range=0,vid_id = 0):
    # Opens the Video file
    if not os.path.exists("test_video") or len(os.listdir("test_video")) == 0:
        print ("Error: No video to process")
        sys.exit(0)
    if r_range < l_range:
        print ("Dev Error: r_range must be greater than or equal l_range")
        sys.exit(0)

    #Read the first video
    video_dir ="test_video" +'/'+ os.listdir("test_video")[vid_id]
    cap= cv2.VideoCapture(video_dir)
    i=0
    data = {}
    while(cap.isOpened()):
        ret, frame = cap.read()
        if ret == False or i>r_range:
            break
        if i>=l_range and i<=r_range:
            # img_encoded = base64.b64encode(cv2.imencode('.jpg', frame)[1]).decode()
            # frame = Image.fromarray(np.uint8(frame)).convert('RGB')

            frame = Image.fromarray(np.uint8(frame)).convert('L')

            output_buffer = BytesIO()
            frame.save(output_buffer, format='JPEG')
            byte_data = output_buffer.getvalue()
            img_encoded = base64.b64encode(byte_data).decode()
            data['frame_'+str(i)] = img_encoded
        i+=1
    
    cap.release()
    cv2.destroyAllWindows()
    json_data = {
        'data': data
    }
    
    return json_data


def send_request(json_data, headers):
    # send http request with image and receive response
    response = requests.post(test_url, data=json_data, headers=headers)
    return response

def add_more_info(json_data):
    json_data['emotions'] = ['sad','happy','surprise']
    return

if __name__ == '__main__':
    headers = establish_network()
    json_data = extract_frames(r_range=210, l_range=200)
    add_more_info(json_data)
    
    # encode request
    json_data = jsonpickle.encode(json_data)
    response = send_request(json_data, headers)
    
    # decode response
    pprint.pprint(jsonpickle.decode(response.text))