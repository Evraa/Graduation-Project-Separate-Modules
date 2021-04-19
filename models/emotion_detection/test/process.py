# Global imports
import os, sys
import torch
from facenet_pytorch import MTCNN
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image, ImageDraw, ImageFont
import numpy as np

"""Initializing global variables"""
device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')

def load_model():
    '''
        Loads model to process with.
    '''
    try:
        model_path = '../model/'
        model_path += os.listdir(model_path)[0]
        model = torch.load(model_path)
        return model
    except:
        print ("Error: No models to test with")
        return False, None


def predict_emotion(img,model):
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
        if(proba > 0.9):
            good_boxes.append(all_boxes[0][index])

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


def run(img):
    model = load_model()
    output = predict_emotion(img, model)

    return True, output