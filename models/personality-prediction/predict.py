import numpy as np
import pandas as pd
import csv
import pickle
import re
import time
import json
from datetime import timedelta

import torch
from torch.utils.data import DataLoader, Dataset
from transformers import *

import tensorflow as tf
from pathlib import Path

import utilss.gen_utils as utils
from utilss.data_utils import MyMapDataset
import utilss.dataset_processors as dataset_processors
import utilss.linguistic_features_utils as feature_utils
import os


start = time.time()

if torch.cuda.is_available():
    DEVICE = torch.device("cuda")
    print('GPU found (', torch.cuda.get_device_name(torch.cuda.current_device()), ')')
    torch.cuda.set_device(torch.cuda.current_device())
    print('num device avail: ', torch.cuda.device_count())

else:
    DEVICE = torch.device('cpu')
    print('running on cpu')


def extract_bert_features(input_ids, n_hl):
    """ Extract bert embedding for each input. """
    tmp = []
    bert_output = model(input_ids)
    # bert_output[2](this id gives all BERT outputs)[ii+1](which BERT layer)[:,0,:](taking the <CLS> output)

    for ii in range(n_hl):
        if (embed_mode == 'cls'):
            tmp.append(bert_output[2][ii + 1][:, 0, :].cpu().numpy())
        elif (embed_mode == 'mean'):
            tmp.append((bert_output[2][ii + 1].cpu().numpy()).mean(axis=1))

    hidden_features.append(np.array(tmp))
    return hidden_features


def get_model(embed):
    # * Model          | Tokenizer          | Pretrained weights shortcut
    # MODEL=(DistilBertModel, DistilBertTokenizer, 'distilbert-base-uncased')
    if (embed == 'bert-base'):
        n_hl = 12
        hidden_dim = 768
        MODEL = (BertModel, BertTokenizer, 'bert-base-uncased')

    elif (embed == 'bert-large'):
        n_hl = 24
        hidden_dim = 1024
        MODEL = (BertModel, BertTokenizer, 'bert-large-uncased')

    elif (embed == 'albert-base'):
        n_hl = 12
        hidden_dim = 768
        MODEL = (AlbertModel, AlbertTokenizer, 'albert-base-v2')

    elif (embed == 'albert-large'):
        n_hl = 24
        hidden_dim = 1024
        MODEL = (AlbertModel, AlbertTokenizer, 'albert-large-v2')

    model_class, tokenizer_class, pretrained_weights = MODEL

    # load the LM model and tokenizer from the HuggingFace Transformeres library
    model = model_class.from_pretrained(pretrained_weights, output_hidden_states=True)  # output_attentions=False
    tokenizer = tokenizer_class.from_pretrained(pretrained_weights, do_lower_case=True)

    return model, tokenizer, n_hl, hidden_dim


def get_inputs(orders, data_x, data_y, layer):
    """ Read data from pkl file and prepare for training. """

    # alphaW is responsible for which BERT layer embedding we will be using
    if (layer == 'all'):
        alphaW = np.full([n_hl], 1 / n_hl)

    else:
        alphaW = np.zeros([n_hl])
        alphaW[int(layer) - 1] = 1

    # just changing the way data is stored (tuples of minibatches) and getting the output for the required layer of BERT using alphaW
    inputs = []
    targets = []
    author_ids = []

    n_batches = len(data_y)
    print(len(orders))

    for ii in range(n_batches):
        inputs.extend(np.einsum('k,kij->ij', alphaW, data_x[ii]))
        targets.extend(data_y[ii])
        author_ids.extend(orders[ii])

    print('inputs shape: ', np.array(inputs).shape)
    print('author_ids shape: ', np.array(author_ids).shape)

    inputs = pd.DataFrame(np.array(inputs))
    # inputs['order'] = author_ids
    # inputs = inputs.set_index(['order'])
    full_targets = pd.DataFrame(np.array(targets))
    full_targets['order'] = author_ids
    full_targets = full_targets.set_index(['order'])

    trait_labels = ['EXT', 'NEU', 'AGR', 'CON', 'OPN']


    return inputs, full_targets, trait_labels

# calculate the softmax of a vector
def softmax(arr):
	return np.exp(arr) / np.exp(arr).sum()

def generate_personality():
    # take the greater and generate text

    if predictions_EXT[0] > predictions_EXT[1]:
        print("you are outgoing and energetic and you tend to talk and seek others")
    else:
        print("you are reserved and solitary and prefer to be alone")

    if predictions_NEU[0] > predictions_NEU[1]:
        print("you are senstive, nervous and viable to psycological stress")
    else:
        print("you are secure, confident and immune to psycological stress")

    if predictions_AGR[0] > predictions_AGR[1]:
        print("you are friendly, compassionate and helpful and trustworthy")
    else:
        print("you are challenging, detached and prefer not make friends")

    if predictions_CON[0] > predictions_CON[1]:
        print("you are efficent, organised and dependable")
    else:
        print("you are easygoing, careless and independable") 
    if predictions_OPN[0] > predictions_OPN[1]:
        print("you are inventive, curious and prefer novelty and creativity")
    else:
        print("you are consistent, cautious and prefer conventionals rather than novelty")
        

if __name__ == "__main__":
    # argument extractor
    dataset, token_length, batch_size, embed, _, mode, embed_mode = utils.parse_args_extractor()
    print('{} : {} : {} : {} : {}'.format(dataset, embed, token_length, mode, embed_mode))
    batch_size = int(32)
    dataset ='test'
    layer = 11
    model, tokenizer, n_hl, hidden_dim = get_model(embed)

    # create a class which can be passed to the pyTorch dataloader. responsible for returning tokenized and encoded values of the dataset
    # this class will have __getitem__(self,idx) function which will return input_ids and target values

    map_dataset = MyMapDataset(dataset, tokenizer, token_length, DEVICE, mode)

    data_loader = DataLoader(dataset=map_dataset,
                             batch_size=batch_size,
                             shuffle=False,
                             )
    
    if (DEVICE == torch.device("cuda")):
        model = model.cuda()
        print('\ngpu mem alloc: ', round(torch.cuda.memory_allocated() * 1e-9, 2), ' GB')

    print('starting to extract LM embeddings...')

    hidden_features = []
    all_targets = []
    all_author_ids = []

    # get bert embedding for each input
    for author_ids, input_ids, targets in data_loader:
        with torch.no_grad():
            all_targets.append(targets.cpu().numpy())
            all_author_ids.append(author_ids.cpu().numpy())
            extract_bert_features(input_ids, n_hl)

    nrc, nrc_vad, readability, mairesse = [True, True, True, True]
    feature_flags = [nrc, nrc_vad, readability, mairesse]
    
    inputs, full_targets, trait_labels = get_inputs(all_author_ids, hidden_features, all_targets, layer)


    predictions_EXT = np.zeros(2)
    for i in range(10):   
        filepath_EXT = './model_EXT_' + str(i)
        # Load the model
        model_EXT = tf.keras.models.load_model(filepath_EXT,custom_objects=None, compile=True)
        predictions_EXT += softmax( model_EXT.predict(inputs)[0] )
    predictions_EXT /=10
    print(predictions_EXT)

    # predictions_NEU = np.zeros(2)
    # # Load the model
    # for i in range(10):
    #     filepath_NEU = './model_NEU_' + str(i)
    #     model_NEU = tf.keras.models.load_model(filepath_NEU,custom_objects=None, compile=True)
    #     predictions_NEU += softmax( model_NEU.predict(inputs)[0] )
    # predictions_NEU /=10
    # print(predictions_NEU)

    # predictions_AGR = np.zeros(2)
    # # Load the model
    # for i in range(10):
    #     filepath_AGR = './model_AGR_' + str(i)
    #     model_AGR = tf.keras.models.load_model(filepath_AGR,custom_objects=None, compile=True)
    #     predictions_AGR += softmax( model_AGR.predict(inputs)[0] )
    # predictions_AGR /= 10
    # print(predictions_AGR)

    # predictions_CON = np.zeros(2)
    # # Load the model
    # for i in range(10):
    #     filepath_CON = './model_CON_' + str(i)
    #     model_CON = tf.keras.models.load_model(filepath_CON,custom_objects=None, compile=True)
    #     predictions_CON += softmax( model_CON.predict(inputs)[0] )
    # predictions_CON /= 10
    # print(predictions_CON)

    # predictions_OPN = np.zeros(2)
    # # Load the model
    # for i in range(10):
    #     filepath_OPN = './model_OPN_' + str(i)
    #     model_OPN = tf.keras.models.load_model(filepath_OPN,custom_objects=None, compile=True)
    #     predictions_OPN += softmax( model_OPN.predict(inputs)[0] )
    # predictions_OPN /=10
    # print(predictions_OPN)
    
    # generate_personality()
