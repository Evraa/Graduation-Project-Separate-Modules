#global imports
from gensim.models import Word2Vec
from gensim.models import KeyedVectors
import os
import sys
import pandas as pd
#local imports
import utils
from parser import get_parsed_data





def load_wv(path = "../model/word2vec.wordvectors"):
    # Load back with memory-mapping = read-only, shared across processes.
    if not utils.check_path(path): sys.exit(1)
    wv = KeyedVectors.load("../model/word2vec.wordvectors", mmap='r')
    return wv


def generate_jd(path = "data/test/jobs_description.csv"):
    """
        The function yields job descriptions for testing.
    """
    jd = pd.read_csv(path, sep='\t')
    print (jd.head())

generate_jd()