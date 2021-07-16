# Global imports
import os, sys
import math
import argparse
import json
import numpy as np 
import pandas as pd 
# import nltk
import preprocessor as p
import re
import transformers
import tensorflow as tf
from pathlib import Path

tokenizer = transformers.AutoTokenizer.from_pretrained('bert-base-uncased')
per_types = ['ENFJ','ENFP','ENTJ','ENTP','ESFJ','ESFP','ESTJ','ESTP','INFJ','INFP','INTJ','INTP','ISFJ','ISFP','ISTJ','ISTP']
maxlen = 512


response = {
    "success": True,
    "error": "",
    "Type":"",
    "personality":""
}

def map_personality(personality):
    result = "personality is: "
    if personality == "INTJ":
        return  result + "The Architect who's Imaginative, Strategic and Planner"
    elif personality == "INTP":
        return  result + "The Logician who's Innovative, Curious and Logical"
    elif personality == "ENTJ":
        return  result + "The Commander who's Bold, Imaginative and Strong-willed"
    elif personality == "ENTP":
        return result + "The Debater who's Smart, Curious and Intellectual"
    elif personality == "INFJ":
        return result + "The Advocate who's Quiet, Mystical and Idealist"
    elif personality == "INFP":
        return result + "The Mediator who's Poetic, Kind and Altruistic"
    elif personality == "ENFJ":
        return result + "The Protagonist who's Chrismatic, Inspiring and Natural-Leaders"
    elif personality == "ENFP":
        return result + "The Campaigner who's Enthusiastic, Creative and Sociable"
    elif personality == "ISTJ":
        return result + "The Logistician who's Practical, Fact-Minded and Reliable"
    elif personality == "ISFJ":
        return result + "The Defender who's Protective, Warm and Caring"
    elif personality == "ESTJ":
        return result + "The Executive who's Organised, Punctual and Leader"
    elif personality == "ESFJ":
        return result + "The Consul who's Caring, Social and Popular"
    elif personality == "ISTP":
        return result + "The Virtuoso who's Bold, Practical and Experimental"
    elif personality == "ISFP":
        return result + "The Adventurer who's Artistic, Charming and Explorers"
    elif personality == "ESTP":
        return result + "The Entrepreneur who's Smart, Energetic and Perceptive"
    elif personality == "ESFP":
        return result + "The Entertainer who's Spontaneous, Energetic and Enthusiastic"


def create_model(path):
    input_word_ids = tf.keras.layers.Input(shape=(maxlen,), dtype=tf.int32, name="input_word_ids")
    bert_layer = transformers.TFBertModel.from_pretrained('bert-base-uncased')
    bert_outputs = bert_layer(input_word_ids)[0]

    MLP_output = tf.keras.layers.Dense(50, activation='relu')(bert_outputs[:,0,:])
    pred = tf.keras.layers.Dense(16, activation='softmax')(MLP_output)
    
    model = tf.keras.models.Model(inputs=input_word_ids, outputs=pred)
    loss = tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True)
    model.compile(loss='categorical_crossentropy', optimizer=tf.keras.optimizers.Adam(
    learning_rate=0.00001), metrics=['accuracy'])
    model.load_weights(path)
    return model

# another preprocessing
# !pip install tweet-preprocessor

def clean_text(sentence):
    # remove hyperlinks, hashtags, smileys, emojies
    sentence = p.clean(sentence)
    # Remove hyperlinks
    sentence = re.sub(r'http\S+', ' ', sentence)
    # Remove punctuations and numbers
    sentence = re.sub('[^a-zA-Z]', ' ', sentence)
    sentence = re.sub('[^a-zA-Z.?!,]', ' ', sentence)
    # Single character removal (except I)
    sentence = re.sub(r"\s+[a-zA-HJ-Z]\s+", ' ', sentence)
    # Removing multiple spaces
    sentence = re.sub(r'\s+', ' ', sentence)
    sentence = re.sub(r'\|\|\|', ' ', sentence)

    return sentence

def load_model(path):
    '''
        Loads model to process.
    '''
    try:
        model = create_model(path)
        return model
    except:
        response["error"] = "No models to test with!"
        response["success"] = False
        store_response()
        sys.exit(1)


def predict_text(txt_path, model_path):
    '''
        Predicts the personality from the text
        
        returns a simple text describing the personality 
    '''
    
    # Opens the text file
    if not os.path.exists(txt_path):
        response["error"] = "No text to process!"
        response["success"] = False
        store_response()
        sys.exit(1)

    # load model
    model = load_model(model_path)

    #Read the text
    try:
        test_text = Path(txt_path).read_text()
        test_text = test_text.replace('\n', '')
        cleaned_text = clean_text(test_text)
        test_ids = [tokenizer.encode(str(cleaned_text),max_length = maxlen , pad_to_max_length = True)]
        scores = model.predict(np.array(test_ids))
        type_idx =  np.argmax(scores)
        result = map_personality( per_types[type_idx] )
        response["Type"] = type_idx
        response["personality"] = result

    except Exception as e:
        response["error"] = e
        response["success"] = False
        store_response()
        sys.exit(1)

    return True



def store_response():
    '''
        Stores the json response, named with the text name extracted from the text path.
    '''
    try:
        file_path = 'output/' + text_path.split("/")[-1].split(".")[0] + ".json"
        
        with open(file_path, 'w') as fp:
            json.dump(response, fp)
    except:
        print ("Error: can't store the file!")

 
if __name__ == '__main__':
    parser = argparse.ArgumentParser()

    parser.add_argument("-p", "--path",  required=True)   
    parser.add_argument("-m", "--model", required=False, default="bert_base_model.h5")
    args = parser.parse_args()
    text_path = args.path

    if not os.path.exists(args.path):
        response["error"] = "Invalid path for text"
        response["success"] = False
        store_response()
        sys.exit(1)

    if not os.path.exists(args.model):
        response["error"] = "Invalid path for model"
        response["success"] = False
        store_response()
        sys.exit(1)

    state = predict_text(args.path, args.model)
    response["success"] = state
    store_response()
    sys.exit(0)
