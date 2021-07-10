from gensim.models import Word2Vec
from gensim.models import KeyedVectors
import os
import time
from parser import get_parsed_data

class Resumes():
    def __init__(self, dirname="/data/pdf"):
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

            
# load data generator itertable
resumes = Resumes('data/pdf')

# train model
model = Word2Vec(sentences=resumes, vector_size=100, window=5, min_count=1, workers=6, sg=1, hs=1)
# save it
if not os.path.exists('../model'): os.mkdir('../model')
model.save("../model/word2vec.model")


print ("Training Completed")

# Store just the words + their trained embeddings.
word_vectors = model.wv
if not os.path.exists('../model'): os.mkdir('../model')
word_vectors.save("../model/word2vec.wordvectors")

# Load back with memory-mapping = read-only, shared across processes.
# wv = KeyedVectors.load("../model/word2vec.wordvectors", mmap='r')

# model = Word2Vec.load("../model/word2vec.model")
# sims = model.wv.most_similar('computer', topn=10)  # get other similar words
# print (sims)