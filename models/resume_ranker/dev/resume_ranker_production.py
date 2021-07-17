# Global imports
import argparse
import os
import json
from gensim.models import KeyedVectors
import sys
from parser_utils_prod import *
from ranker import *

response = {
    "success": True,
    "error": "",
    "results":[] #list of lists
}



def store_response():
    '''
        Stores the json response, named with the video name extracted from the video path.
    '''
    try:
        file_path = results_path
        with open(file_path, 'w') as fp:
            json.dump(response, fp)
            
    except:
        print ("Error: can't store the file!")


def report_error(msg):
    response["success"] = False
    response["error"] = msg
    store_response()
    sys.exit(1)


def load_wv(path):
    return KeyedVectors.load(path, mmap='r')


def run(jd_path, cvs_path):
    # Parse jd
    try:
        state, jd_tokens = get_parsed_data(jd_path)
    except Exception as e:
        report_error(e)

    if not state:
        report_error(jd_tokens)

    # Parse cvs
    files = os.listdir(cvs_path)
    cvs = {}
    for file in files:
        file_path = os.path.join(cvs_path, file)
        # Make sure file exist
        if not os.path.exists(file_path):
            error_msg = "File does not exist: "+file_path 
            print(error_msg)
            # report_error(error_msg)

        try:
            state, cv_tokens = get_parsed_data(file_path)
            # In case any error occured
            if state: 
                cvs[file] = cv_tokens
        except:
            print(f"Error occured WHILE parsing file: {file}")

    if len(cvs) == 0:
        report_error("No cvs are handeled!")

    score_dict = {}
    try:
        # calculate tfidf score
        tfidf_scores = tfidf(words_vector=wv, query=jd_tokens, cvs=cvs, n_extend=2)
    except Exception as e:
        report_error(f"Error occured while tf-idf cvs:\n{e}")

    # calculate cosine scores
    for resume_id, resume in cvs.items():
        try:
            cosine_score = rank(wv, resume, jd_tokens, window_size=5, step_size=2)
            resume_id_free = resume_id.split('.')[0]
            score_dict[resume_id_free] = [cosine_score, tfidf_scores[resume_id]]
        except:
            report_error(f"Error occured while calculating cosine similrity for cv: {resume_id}")

    # sort scores based on cosine similarity
    try:
        sorted_score_dict = dict(sorted(score_dict.items(),key=lambda x:x[1],reverse = True))
    except:
        report_error("Error while sorting the results :)")
    return sorted_score_dict
    

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("-p", "--path",  required=True)   
    parser.add_argument("-jd", "--job", required=True)
    parser.add_argument("-rp", "--resultsPath", required=True)
    parser.add_argument("-m", "--model", required=False, default="../model/word2vec_vs_300_ep_150_sg_alpha_0.001.wordvectors")
    args = parser.parse_args()
    
    # fetch data from argparser
    main_directory_path = args.path
    cvs_path = main_directory_path
    jd_path = args.job
    # jd = args.job
    results_path = args.resultsPath
    model_path = args.model
    

    # Validate the data
    
    if not os.path.exists(cvs_path):
        report_error(msg="CV path does not exist!")

    if not os.path.exists(jd_path):
        report_error(msg="JD path does not exist!")
    
    if not os.path.exists(model_path):
        report_error(msg="Model path does not exist!")
    
    # Load model
    wv = load_wv(path = model_path)
    
    # Run model
    sorted_score_dict = run(jd_path, cvs_path)
    
    # Store results
    for name, scores in sorted_score_dict.items():

        response["results"].append({'id': name, 'scores': scores})
    
    store_response()
    sys.exit(0)

