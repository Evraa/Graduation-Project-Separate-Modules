#global imports
from PIL import Image
import os
import pandas as pd 
import numpy as np
#local imports
from consts import _dataset_path, _image_dim, _emotions, _dataset_png_path, _all_emotions



def convert_pixels_to_image(image_array):
    '''
        Takes an image array and convert it to n Image object.
    '''
    pixel_arr = np.fromstring(image_array, dtype=int, sep=' ').reshape(_image_dim,_image_dim).astype('uint8')
    img = Image.fromarray(pixel_arr).convert('RGB')
    return img


def convert_all_images_to_pngs(data_path = _dataset_path):

    #read raw pixels
    fer_raw_df = pd.read_csv(data_path)
    #truncate non used emotions
    emotion_index = _emotions
    emotion_dict = _all_emotions
    fer_raw_df = fer_raw_df.loc[fer_raw_df.emotion.isin(emotion_index)].reset_index(drop=True)
    #create a placeholder
    root_data_dir = _dataset_png_path
    if(not os.path.isdir(root_data_dir)):
        os.mkdir(root_data_dir)

    fer_raw_length = len(fer_raw_df)
    for index in range(fer_raw_length):
        if index % 1000 == 0:
            print(f'Progress: {index}/{fer_raw_length}')
        current_row = fer_raw_df.iloc[index]

        img = convert_pixels_to_image(current_row.pixels)

        emotion_str = emotion_dict[current_row.emotion]
        emotion_path = os.path.join(root_data_dir, emotion_str)

        if(not os.path.isdir(emotion_path)):
            os.mkdir(emotion_path)

        emotion_filename = f'{emotion_str}_{index}.png'
        if not os.path.exists(os.path.join(emotion_path, emotion_filename)):
            img.save(os.path.join(emotion_path, emotion_filename))
        else:
            print(f"{emotion_filename}\t\t\tAlready exist") 

def run_preprocess():
    convert_all_images_to_pngs()