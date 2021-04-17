#global imports
from PIL import Image, ImageDraw, ImageFont
import torch
from facenet_pytorch import MTCNN
import torch.nn.functional as F
from torchvision import transforms
import os, argparse
import pprint
#local imports
from consts import _class_names

"""Initializing global variables"""
device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')

#emotions boundry boxes colors
emotion_color_dict = {
    'angry': (225,33,33),
    'sad': (64,55,128),
    'happy': (84,183,84),
    'neutral': (24,31,49)
}

fnt = ImageFont.truetype('font/BebasNeue-Regular.ttf', 15)

def load_model(model_path=None):
    model = torch.load(model_path)
    return model

def predict_emotion(img,model):
    """Predicting emotions"""
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

def parse_model():
    models_path = '../model'
    models = sorted(os.listdir(models_path))
    for i,model in enumerate(models):
        print(i, ': ',model)
    model_index = int(input ("Pick one of these models.. (index)>> "))
    assert model_index < len(models)
    return models_path+'/'+models[model_index]

if __name__ == '__main__':
    model_name = parse_model()

    root_dir = 'test_image'
    output_dir = 'test_image/results'
    for img_name in os.listdir(root_dir):
        if img_name == 'results': continue
        img_path = os.path.join(root_dir, img_name)
        img = Image.open(img_path).convert('RGB')
        model = load_model(model_name)
        predict_emotion(img, model)
        result_img_name = 'output_'+img_name 
        output_path = os.path.join(output_dir, result_img_name)
        img.save(output_path)