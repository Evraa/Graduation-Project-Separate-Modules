#global imports
from gensim.models import Word2Vec
import os
import time
import pandas as pd
# local imports
from parser import get_parsed_data, extract_text_from_pdf

class Resumes():
    def __init__(self, dirname="data/pdf"):
        self.dirname = dirname
        self.epoch = 0
        self.start_time = time.time()
        self.skip_first = True
        self.set_first = None
 
    def __iter__(self):
        for each in os.listdir(self.dirname):
            if self.skip_first or each == self.set_first:
                if not self.skip_first:
                    print (f'Execution time: {round(time.time() - self.start_time, 2)} s')
                else:
                    self.set_first = each
                self.start_time = time.time()
                self.skip_first = False 
                self.epoch += 1
                print (f'Epoch: {self.epoch}')
            
            try:
                data = get_parsed_data(self.dirname+'/'+each)
            except Exception as e:
                print(f"Error: {e}\tat {each}")
                continue
            
            if data is None: continue
            yield data


def store_tokens(path = "data/pdf"):
    """
        Storing tokenized data instead of reading and preprocessing them every time we train.
    """
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

    df = pd.DataFrame.from_dict(data_dict, orient="index")
    file_name = "data/data_pdf_1.csv"
    df.to_csv(file_name)
    

def fetch_data(path = "data/data_pdf_1.csv"):
    resumes = pd.read_csv(path, low_memory=False)
    dict = resumes.iloc[:,1:].to_dict('split')['data']
    del resumes
    return dict
    # data = {}
    # rows, cols = resumes.shape
    # for row in range(rows):
    #     print (row)
    #     new_row = True
    #     name = None
    #     for col in range(cols):
    #         cell = resumes.iloc[row, col]
    #         if new_row:
    #             name = cell

    #             data[name] = []
    #             new_row = False
    #             continue
            
    #         data[name].append(cell)
    # return data


def train_wv(iteratable = False):
    # load data generator itertable
    if iteratable: 
        resumes = Resumes('data/pdf')
    else:
        resumes = fetch_data()

    print ("Data loaded.")

    # train model
    model = Word2Vec(sentences=resumes, vector_size=100, window=6, min_count=1, 
                    workers=6, sg=1, hs=1, epochs=6, alpha=0.0001, min_alpha=0.00001)
    # save it
    if not os.path.exists('../model'): os.mkdir('../model')
    model.save("../model/word2vec_vs_100_ep_6_sg_alpha_0001.model")


    print ("Training Completed")

    # Store just the words + their trained embeddings.
    word_vectors = model.wv
    if not os.path.exists('../model'): os.mkdir('../model')
    word_vectors.save("../model/word2vec_vs_100_ep_6_sg_alpha_0001.wordvectors")


    # model = Word2Vec.load("../model/word2vec.model")
    # sims = model.wv.most_similar('computer', topn=10)  # get other similar words
    # print (sims)

def accumulate_training():
    # load data generator itertable
    resumes = Resumes('data/pdf_2')

    # load the model
    model = Word2Vec.load("../model/word2vec.model")

    #trian on new data
    model.train(resumes, epochs=6, total_examples=1033)

    #save new model
    model.save("../model/word2vec_2.model")


    print ("Training Completed")

    # Store just the words + their trained embeddings.
    word_vectors = model.wv
    if not os.path.exists('../model'): os.mkdir('../model')
    word_vectors.save("../model/word2vec_2.wordvectors")


train_wv()
