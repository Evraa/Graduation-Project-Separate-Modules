#global imports
from gensim.models import Word2Vec
from gensim.models import KeyedVectors
import sys, os
import pandas as pd
import random
import gensim.downloader
import spacy


# Show all available models in gensim-data
# print(list(gensim.downloader.info()['models'].keys()))

#local imports
import utils
from parser_utils import get_parsed_data, remove_noisy_words
from ranker import rank, tfidf


def prepare_test_dataset_from_train_rev(path ="data/test/Train_rev1.csv"):
    '''
        Fetch test data of job descriptions only from:
            https://www.kaggle.com/airiddha/trainrev1
    '''
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
    '''
        Given a directory, returns list of sentences representing each file.
    '''
    files = os.listdir(path)
    jds = []
    for file in files:
        data = get_parsed_data(path+'/'+file)
        if data is not None:
            jds.append(data)
    return jds


def load_wv(path = "../model/word2vec.wordvectors", use_glove = False):
    # Load back with memory-mapping = read-only, shared across processes.
    if use_glove: return gensim.downloader.load('glove-wiki-gigaword-100')
    # if use_glove: return spacy.load('en_core_web_sm')

    if not utils.check_path(path): sys.exit(1)
    return KeyedVectors.load(path, mmap='r')



class Resumes():
    def __init__(self, dirname="data/pdf_small"):
        self.dirname = dirname
        
 
    def __iter__(self):
        for each in os.listdir(self.dirname):
            rand = random.random()
            # if rand >0.05: continue
            
            try:
                data = get_parsed_data(self.dirname+'/'+each)
            except Exception as e:
                print(f"Error: {e}\tat {each}")
                continue
            
            if data is None: continue
            yield data, each


def load_data(path):
    files = os.listdir(path)
    data_dict = {}
    for file in files:
        try:
            data = get_parsed_data(path+'/'+file)
        except Exception as e:
            print(f"Error: {e}\tat {file}")
            continue
        
        if data is None: continue
        data_dict[file] = data
    return data_dict

    

def tailored_test_cases(path="data/tailored_test_cases"):
    model_name = "../model/word2vec_vs_300_ep_150_sg_alpha_0.001.wordvectors"
    test_cases = os.listdir(path)
    wv = load_wv(path = model_name, use_glove=False)

    for i, test_case in enumerate(test_cases):
        jds = prepare_test_dataset_2(path+'/'+test_case+'/jd')
        resumes = load_data(path+'/'+test_case+'/cv')
        
        for j, jd in enumerate(jds):
            score_dict = {}
            
            # for resume ,resume_id in resumes:
            tfidf_scores = tfidf(words_vector=wv, query=jd, cvs=resumes,n_extend=1)
            for resume_id, resume in resumes.items():
                cosine_score = rank(wv, resume, jd, window_size=5, step_size=2)
                resume_id_free = resume_id.split('.')[0]
                score_dict[resume_id_free] = [cosine_score, tfidf_scores[resume_id]]

            sorted_score_dict = dict(sorted(score_dict.items(),key=lambda x:x[1],reverse = True))
            df = pd.DataFrame.from_dict(sorted_score_dict, orient="index", columns=["cosine","tfidf"])
            file_name = "results_" + test_case + "_jd_" + str(j+1) +"_word2vec_vs_300_ep_150_sg_alpha_0.001.csv"
            print ("Results saved.")
            df.to_csv(file_name)

            


if __name__ == "__main__":
    tailored_test_cases()
    sys.exit(0)
    # jds = prepare_test_dataset_2()
    # resumes = Resumes("data/Resume&Job_Description/Original_Resumes")
    # wv = load_wv(use_glove = True)
    # for jd in jds:
    #     score_dict = {}
        
    #     for resume ,resume_id in resumes:
    #         score = rank(wv, resume, jd, window_size=10, step_size=3)
    #         resume_id = resume_id.split('.')[0]
    #         score_dict[resume_id] = score
    #     sorted_score_dict = dict(sorted(score_dict.items(),key=lambda x:x[1],reverse = True))
    #     input (sorted_score_dict)
