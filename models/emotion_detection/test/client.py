#Global imports 
import requests
import json
import cv2
import pprint
import os
import sys
import numpy as np
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
    data = []
    while(cap.isOpened()):
        ret, frame = cap.read()
        if ret == False or i>=r_range:
            break
        if i>=l_range and i<r_range:
            # process
            _, img_encoded = cv2.imencode('.jpg', frame)
            img_encoded = img_encoded.tostring()
            frame_i = {'frame_'+str(i) : img_encoded}
            data.append(frame_i)
        i+=1
    
    cap.release()
    cv2.destroyAllWindows()

    json_data={}
    json_data['data'] = data
    return json_data

def send_request(imgs_encoded, headers):
    # send http request with image and receive response
    response = requests.post(test_url, data=imgs_encoded, headers=headers)
    return response

if __name__ == '__main__':
    headers = establish_network()
    json_data = extract_frames(r_range=210, l_range=200)
    response = send_request(json_data, headers)
    # decode response
    pprint.pprint(json.loads(response.text))
    # expected output: {u'message': u'image received. size=124x124'}
