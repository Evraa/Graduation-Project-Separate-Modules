#global imports
from gensim.models import Word2Vec
import os
import time
import pandas as pd
# local imports
from parser_utils import get_parsed_data, extract_text_from_pdf
from utils import fetch_data, evaluate_pereformance

class Resumes():
    '''
        Making the data itertable proved is bad approach, first the data is not that large to fit into memory.
            and it makes word2vec very slow.

        Do NOT use it.
    '''
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




def train_wv(iteratable = False):
    # load data generator itertable
    if iteratable: 
        resumes = Resumes('data/pdf')
    else:
        resumes = fetch_data("data/data_pdf_combined.csv")

    print ("Data loaded.")

    lr = 0.001
    vector_size = 300
    epochs = 150

    model_name = "word2vec_vs_"+str(vector_size)+ "_ep_" + str(epochs)+"_sg_alpha_" + str(lr)
    
    # train model
    model = Word2Vec(sentences=resumes, vector_size=vector_size, window=15, min_count=1, 
                    workers=6, sg=1, hs=1, epochs=epochs, alpha=lr, min_alpha=lr/10)

    # save it
    if not os.path.exists('../model'): os.mkdir('../model')
    file_path = "../model/"+model_name+".model"
    model.save(file_path)


    print ("Training Completed")

    # Store just the words + their trained embeddings.
    word_vectors = model.wv
    if not os.path.exists('../model'): os.mkdir('../model')
    file_path = "../model/"+model_name+".wordvectors"
    word_vectors.save(file_path)

    print (f"length of vocab: {len(word_vectors)}")

    # evaluate
    evaluate_pereformance(wv=word_vectors)

    # model = Word2Vec.load("../model/word2vec.model")
    # sims = model.wv.most_similar('computer', topn=10)  # get other similar words
    # print (sims)

def accumulate_training(iteratable=False):
    # load data generator itertable
    if iteratable: 
        resumes = Resumes('data/pdf')
    else:
        resumes = fetch_data("data/data_pdf_2.csv")

    print ("Data loaded")

    # load the model
    model = Word2Vec.load("../model/word2vec_vs_100_ep_150_sg_alpha_0.01_2.model")

    #trian on new data
    model.train(resumes, epochs=150, total_examples=len(resumes))

    #save new model
    model.save("../model/word2vec_vs_100_ep_150_sg_alpha_0.01_2.model")


    print ("Training Completed")

    # Store just the words + their trained embeddings.
    word_vectors = model.wv
    if not os.path.exists('../model'): os.mkdir('../model')
    word_vectors.save("../model/word2vec_vs_100_ep_150_sg_alpha_0.01_2.wordvectors")


train_wv()
