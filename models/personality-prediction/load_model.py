
import os

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
import tensorflow as tf
import numpy as np
import re
import pickle
import time
import pandas as pd
from pathlib import Path

import gen_utils as utils
import dataset_processors as dataset_processors
import linguistic_features_utils as feature_utils

filepath = './model_EXT'
# Load the model
model = tf.keras.models.load_model(filepath,custom_objects=None, compile=True)

# print(model.predict)