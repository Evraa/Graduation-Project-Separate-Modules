#global imports
from gensim.models import Word2Vec
from gensim.models import KeyedVectors
import sys, os
import pandas as pd
import random
#local imports
import utils
from parser import get_parsed_data, remove_noisy_words
from ranker import rank


def prepare_test_dataset(path ="data/test/Train_rev1.csv"):
    # first make sure test data exist
    if not utils.check_path(path) and not utils.check_path("data/test/jobs_description.csv"):
        print ("Please refer to the readme file and download the test data")
        sys.exit(1)

    # if it does exist, fetch job description
    if not utils.check_path("data/test/jobs_description.csv"):
        utils.prepare_data("data/test/jobs_description.csv")

    #lastly get data as list
    jds = pd.read_csv("data/test/jobs_description.csv", sep='\t')
    jds.FullDescription.to_list()
    jds_parsed = []
    for jd in jds:
        jds_parsed.append(remove_noisy_words(jd))
    return jds_parsed

def prepare_test_dataset_2(path = "data/Resume&Job_Description/Job_Description"):
    files = os.listdir(path)
    jds = []
    for file in files:
        data = get_parsed_data(path+'/'+file)
        if data is not None:
            jds.append(get_parsed_data(path+'/'+file))
    return jds


def load_wv(path = "../model/word2vec.wordvectors"):
    # Load back with memory-mapping = read-only, shared across processes.
    if not utils.check_path(path): sys.exit(1)
    wv = KeyedVectors.load("../model/word2vec.wordvectors", mmap='r')
    return wv





class Resumes():
    def __init__(self, dirname="data/pdf_small"):
        self.dirname = dirname
        
 
    def __iter__(self):
        for each in os.listdir(self.dirname):
            rand = random.random()
            if rand >0.2: continue
            
            try:
                data = get_parsed_data(self.dirname+'/'+each)
            except Exception as e:
                print(f"Error: {e}\tat {each}")
                continue
            
            if data is None: continue
            yield data, each


if __name__ == "__main__":
    jds = prepare_test_dataset_2()
    resumes = Resumes("data/Resume&Job_Description/Original_Resumes")
    wv = load_wv()
    for jd in jds:
        score_dict = {}
        
        for resume ,resume_id in resumes:
            score = rank(wv, resume, jd)
            resume_id = resume_id.split('.')[0]
            score_dict[resume_id] = score
        sorted_score_dict = dict(sorted(score_dict.items(),key=lambda x:x[1],reverse = True))
        input (sorted_score_dict)
