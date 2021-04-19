# Global imports
import os, sys
import torch
from facenet_pytorch import MTCNN
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image, ImageDraw, ImageFont
import numpy as np

_class_names = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise','neutral']

"""Initializing global variables"""
device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')

#emotions boundry boxes colors
emotion_color_dict = {
    'angry': (196,59,73),       #red
    'sad': (126,128,129),       #grey
    'happy': (169,216,39),      #yellow
    'neutral': (71,245,64),     #green
    'surprise': (255,171,0),    #orange
    'disgust': (255,0,251),     #purple
    'fear': (58,69,197)         #blue
}
# load the font
fnt = ImageFont.truetype('font/BebasNeue-Regular.ttf', 15)

def load_model():
    try:
        model_path = '../model/'
        model_path += os.listdir(model_path)[0]
        model = torch.load(model_path)
        return model
    except:
        print ("Error: No models to test with")
        return False, None

def check_arg(img, emotions):
    if len(emotions) <= 0:
        print ("Error: No Emotions selected from request")
        return False, None
   

def predict_emotion(img,model):
    """Predicting emotions"""
    # img = Image.fromarray(np.uint8(img)).convert('RGB')
    img = img.convert('RGB')

    mtcnn = MTCNN(keep_all=True)
    all_boxes = mtcnn.detect(img)

    # Check if MTCNN detect good faces
    good_boxes = []
    for index, proba in enumerate(all_boxes[1]):
        if(proba > 0.9):
            good_boxes.append(all_boxes[0][index])

    model.eval()
    for boxes in good_boxes:
        img_cropped = img.crop(boxes)

        transform = transforms.Compose([transforms.Resize((224,224),interpolation=Image.NEAREST),transforms.ToTensor(),transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])])

        img_tensor = transform(img_cropped)
        img_tensor = img_tensor.to(device)

        with torch.no_grad():
            output = F.softmax(model(img_tensor.view(-1, 3, 224, 224))).squeeze()
        prob_emotion = output[torch.argmax(output).item()].item()
        pred_emotion = _class_names[torch.argmax(output)]

        emotion_color = emotion_color_dict[pred_emotion]

        left, top, right, bottom = boxes
        x, y = left+5, bottom+2.5

        emotion_text = f'{pred_emotion} {round(prob_emotion, 2)}'

        w, h = fnt.getsize(emotion_text)

        draw = ImageDraw.Draw(img)
        draw.rectangle(boxes, outline=emotion_color)
        draw.rectangle((x-5,y-2.5,x+w+5,y+h+2.5), fill=emotion_color)
        draw.text((x,y), emotion_text, font=fnt, fill=(255,255,255))
    return img


def run(img, emotions):
    check_arg(img, emotions)
    model = load_model()
    img = predict_emotion(img, model)
    img.save("img.jpg")


    return True, []