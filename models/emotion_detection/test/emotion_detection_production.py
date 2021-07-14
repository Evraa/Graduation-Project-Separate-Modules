# Global imports
import os, sys
import torch
from facenet_pytorch import MTCNN
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import argparse
import cv2
import math
import json


device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')


response = {
    "success": True,
    "error": "",
    "no_frames":0,
    "results":[]
}

def load_model(path):
    '''
        Loads model to process with.
    '''

    try:
        model = torch.load(path, map_location=device)
        return model
    except:
        response["error"] = "No models to test with!"
        response["success"] = False
        store_response()
        sys.exit(1)



def predict_emotion(img, model):
    """Predicting emotions"""
    # Convert image to RGB
    # Note: it will not be RGB cuz we already receiving grayscale images
    #       but the Goddamn mtcnn model needs a 3 chanelled images :")
    img = img.convert('RGB')

    mtcnn = MTCNN(keep_all=True)
    all_boxes = mtcnn.detect(img)

    # Check if MTCNN detect good faces
    # TODO: This part should detect THE best faces there. larger, most probable, centered .. etc.
    good_boxes = []
    for index, proba in enumerate(all_boxes[1]):
        if(proba is not None and proba > 0.9):
            good_boxes.append(all_boxes[0][index])
    output = None
    # Test/Evaluate
    model.eval()
    # Again, this should not be a for loop.
    for boxes in good_boxes:
        img_cropped = img.crop(boxes)

        transform = transforms.Compose([transforms.Resize((224,224),interpolation=Image.NEAREST),transforms.ToTensor(),transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])])

        img_tensor = transform(img_cropped)
        img_tensor = img_tensor.to(device)

        with torch.no_grad():
            output = F.softmax(model(img_tensor.view(-1, 3, 224, 224))).squeeze()
            
        
    return output



def predict_frames(vid_path, splits, model_path):
    '''
        Truncate video into frames.

        Decode each frame and add it to a json variable to be encoded and sent.
    '''
    all_emotions = {0:"angry", 1:"disgust", 2:"fear", 3:"happy", 4:"sad", 5:"surprise", 6:"neutral"}
    
    # Opens the Video file
    if not os.path.exists(vid_path):
        response["error"] = "No video to process!"
        response["success"] = False
        store_response()
        sys.exit(1)

    # load model
    model = load_model(model_path)

    #Read the first video
    try:
        cap= cv2.VideoCapture(vid_path)
        i=1
        results = []
        while(cap.isOpened()):

            ret, frame = cap.read()
            if ret == False or i%100 == 0:
                break
            
            # img_encoded = base64.b64encode(cv2.imencode('.jpg', frame)[1]).decode()
            # frame = Image.fromarray(np.uint8(frame)).convert('RGB')

            frame = Image.fromarray(np.uint8(frame)).convert('L')
            # img = Image.open(image_data)
        
            output = predict_emotion(frame, model)
            frame_i = []
            if output is not None:
                for out in output:
                    frame_i.append(out.item())
                
                results.append(frame_i)
            
            i+=1
        
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
    response["no_frames"] = len(results)
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
            response["results"][i][emoition] = result_mean[key]

    return True



def store_response():
    '''
        Stores the json response, named with the video name extracted from the video path.
    '''
    try:
        file_path = video_path.split("/")[-1].split(".")[0] + ".json"
        
        with open(file_path, 'w') as fp:
            json.dump(response, fp)
    except:
        print ("Error: can't store the file!")

 
if __name__ == '__main__':
    parser = argparse.ArgumentParser()

    parser.add_argument("-p", "--path",  required=True)   
    parser.add_argument("-s", "--split", required=False, default=1)
    parser.add_argument("-m", "--model", required=False, default="emotion_detect_model_90.h5")
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
        response["error"] = "Invalid path for model"
        response["success"] = False
        store_response()
        sys.exit(1)

    state = predict_frames(args.path, args.split, args.model)
    response["success"] = state
    store_response()
    sys.exit(0)
