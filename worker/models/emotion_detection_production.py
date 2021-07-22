# Global imports
import os, sys
import numpy as np
import argparse
import cv2
import math
import json
from keras.models import load_model
from keras.preprocessing.image import img_to_array

response = {
    "success": True,
    "error": "",
    "no_frames":0,
    "results":[]
}




def load_models(detection_model_path, emotion_model_path):
    '''
        Loads prediction and detection models to process with them.
    '''

    try:
        detection_model = cv2.CascadeClassifier(detection_model_path)
        emotion_model = load_model(emotion_model_path, compile=False)
        return detection_model, emotion_model

    except:
        response["error"] = "No models to test with!"
        response["success"] = False
        store_response()
        sys.exit(1)


def process_frames(vid_path, splits, detection_model, emotion_model):
    '''
        Truncate video into frames.

        Decode each frame and add it to a json variable to be encoded and sent.
    '''
    all_emotions = {0:"angry", 1:"disgust", 2:"scared", 3:"happy", 4:"sad", 5:"surprise", 6:"neutral"}
    EMOTIONS = ["angry" ,"disgust","scared", "happy", "sad", "surprised","neutral"]


    #Read the first video
    try:
        cap= cv2.VideoCapture(vid_path)
        K=1
        results = []
        while(cap.isOpened()):

            ret, frame = cap.read()
            if ret == False or K%1800 ==0:
                break

            # image = cv2.imread(path)
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = detection_model.detectMultiScale(gray,scaleFactor=1.1,
                            minNeighbors=5,minSize=(30,30),flags=cv2.CASCADE_SCALE_IMAGE)
                            
            if len(faces) > 0:
                # We keep the face that has the largest area
                face = sorted(faces, reverse=True,key=lambda x: (x[2] - x[0]) * (x[3] - x[1]))[0]
                (fX, fY, fW, fH) = face
                # Extract region of interest
                roi = gray[fY:fY + fH, fX:fX + fW]
                roi = cv2.resize(roi, (64, 64))
                # Prepare it for the model
                roi = roi.astype("float") / 255.0
                roi = img_to_array(roi)
                roi = np.expand_dims(roi, axis=0)
                scores = emotion_model.predict(roi)
                frame_i = []
                for i in range(7):
                    frame_i.append(scores[0][i])    

                results.append(frame_i)
            
            K+=1
        
        cap.release()
        cv2.destroyAllWindows()

    except Exception as e:
        response["error"] = e
        response["success"] = False
        store_response()
        sys.exit(1)

    # Report results
    if len(results) == 0:
        response["error"] = "No faces were detected in the video."
        response["success"] = False
        store_response()
        sys.exit(1)

    # Report number of frames exist
    response["no_frames"] = str(len(results))
    splits = int(splits)
    split_size = int(math.floor(len(results) / splits))
    for i in range(splits):
        
        max_possible = (i*split_size)+split_size 
        if max_possible > len(results):
            max_possible = len(results)

        results_split = np.array(results[i*split_size : max_possible])
        result_mean = np.mean(results_split, axis=0)
        
        response["results"].append({})
        
        for key, emoition in all_emotions.items():
            response["results"][i][emoition] = str(result_mean[key])

    return True



def store_response():
    '''
        Stores the json response, named with the video name extracted from the video path.
    '''
    try:
        file_path = 'output/' + video_path.split("/")[-1].split(".")[0] + ".json"
        
        with open(file_path, 'w') as fp:
            json.dump(response, fp)
    except Exception as e:
        print ("Error: can't store the file!")
        print (e)

 
if __name__ == '__main__':
    parser = argparse.ArgumentParser()

    parser.add_argument("-p", "--path",  required=True)   
    parser.add_argument("-s", "--split", required=False, default=1)
    parser.add_argument("-m", "--model", required=False, default="emotion_detect_model_120.hd5")
    parser.add_argument("-ha", "--haar", required=False, default="haarcascade_frontalface_default.xml")
    
    args = parser.parse_args()
    video_path = args.path
    
    if int(args.split) <1 or int(args.split) >1000:
        response["error"] = "No. of splits must be bounded [1:1000]"
        response["success"] = False
        store_response()
        sys.exit(1)

    if not os.path.exists(args.path):
        response["error"] = "Invalid path for video"
        response["success"] = False
        store_response()
        sys.exit(1)

    if not os.path.exists(args.model):
        response["error"] = "Invalid path for prediction model"
        response["success"] = False
        store_response()
        sys.exit(1)
    
    if not os.path.exists(args.haar):
        response["error"] = "Invalid path for detection model"
        response["success"] = False
        store_response()
        sys.exit(1)

    # load models
    detection_model, emotion_model = load_models(args.haar, args.model)
    state = process_frames(args.path, args.split, detection_model, emotion_model)
    response["success"] = state
    store_response()
    sys.exit(0)