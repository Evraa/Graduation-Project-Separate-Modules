import pandas as pd
import os, sys
from gensim.models import KeyedVectors
import random
from parser_utils import get_parsed_data

def check_path(path):
    if not os.path.exists(path):
        print (f"Error: path does not exist!\t{path}")
        return False
    return True


def prepare_data(path = "data/test/Train_rev1.csv"):
    if not check_path(path): sys.exit(1)
    jd = pd.read_csv(path)
    jd = jd.sample(frac=1)
    jd = jd.iloc[:1000, 2]
    jd.to_csv(r'data/test/jobs_description.csv', index = False, header = True)
    print ("Success: extracted jobs description from the training data..")
    act = str(input ("To delete Train_rev1.csv press d, othw. press any key\n>> "))
    if act == 'd' or act == 'D':
        os.remove(path)


def store_tokens(csv_name, path = "data/pdf"):
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
    df.to_csv(csv_name)
    return
    

def fetch_data(path = "data/data_pdf_combined.csv"):
    resumes = pd.read_csv(path, low_memory=False)
    dict = resumes.iloc[:,1:].to_dict('split')['data']
    del resumes
    return dict




def evaluate_pereformance(model_path=None, wv=None):
    '''
        Without comparing jds and resumes, tests out against model's intellignece.
    '''
    key_assumptions = ['software', 'web', 'design','accountant','business']
    if wv is None:
        if not check_path(model_path): sys.exit(1)
        wv =  KeyedVectors.load(model_path, mmap='r')
    
    for key in key_assumptions:
        print (f'Similar to: {key}')
        try:
            similars = wv.most_similar(key, topn=5)
            print (similars)
        except:
            print ("Doesn't exist")

    for i in range(len(key_assumptions)):
        for j in range(i+1, len(key_assumptions)):
            try:
                print (f'Score between: {key_assumptions[i]} && {key_assumptions[j]}')
                print (wv.similarity(key_assumptions[i] , key_assumptions[j]))
            except:
                print(f"{key_assumptions[i]} or {key_assumptions[j]} or both Doesn't exist")




# store_tokens("data/data_pdf_combined.csv","data/pdf_combined")
# evaluate_pereformance(model_path="../model/word2vec_vs_300_ep_150_sg_alpha_0.001.wordvectors")

# path = "data/falsy/"
# files  = os.listdir(path)
# for i,  file in enumerate(files):
#     old_name = path+file
#     new_name = path + "false_"+str(i)+".pdf"
#     os.rename(old_name, new_name) 
    