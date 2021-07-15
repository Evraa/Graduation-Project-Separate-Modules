#global imports
import numpy as np
from scipy.spatial import distance
from gensim.models import KeyedVectors
import math
#local imports
from parser_utils import remove_noisy_words



def sent2vec(sentence):
    '''Generate Vectors for sentences. by normalizing the number of words'''
    
    M = np.array(sentence)
    v = M.sum(axis=0)
    return v/np.sqrt((v**2).sum())

def cosine_sim(vec1, vec2):
    '''Return Cosine Similarity.'''
    
    if len(vec1) > len(vec2):
        vec1 = vec1[:len(vec2)]
    elif len(vec1) < len(vec2):
        vec2 = vec2[:len(vec1)]

    # vec1_flat = np.hstack(vec1)
    # vec2_flat = np.hstack(vec2)
    # dist = distance.cosine(vec1_flat, vec2_flat)
    # return dist
   
    v1 = sent2vec(vec1)
    v2 = sent2vec(vec2)
    
    return np.dot(v1,v2)/(np.linalg.norm(v1)* np.linalg.norm(v2))

def split_sentence(sentence, window_size, step_size):
    '''
        Assembles list of words `sentence` into a list of separate sentences
            each with the max size of `window_size`, with a step size equal `step`
    '''
    L = len(sentence)
    list_of_sent = []
    terminate = False
    for i in range (0, L, step_size):
        if i+window_size < L:
            max_right_limit = i+window_size 
        else:
            max_right_limit = L
            terminate = True
        list_of_sent.append(sentence[i: max_right_limit])
        if terminate: break

    return list_of_sent


def handle_unknown_vocab(wv, query):
    '''
        Makes sure every word within the query has a word vector
    '''
    existed = []
    for q in query:
        try:
            # wv[q]
            existed.append(wv[q])
        except:
            continue

    return existed


def list_to_sentence(list):
    sentence = ""
    for l in list:
        sentence += " " + l
    return sentence

def rank(words_vector, cv, query, window_size=2, step_size=1, spacy = False):
    """
        Main ranker function, that evaluates a query against given cv.

        Inputs:
            `words_vector`: trained model
            `cv`: file to test against
            `query`: mainly the job description
            `window_size`: how far/deep do we need to evaluate
            `step_size`: to skip redundent words
        Output:
            `score`: independent normalized score (independent from any other cv)
    """
    
    if spacy:
        query_sentences = split_sentence(query, window_size=window_size, step_size=step_size)
        cv_sentences = split_sentence(cv, window_size=window_size, step_size=step_size)
        # NxN for loops
        score = 0
        for cv_sentence in cv_sentences:
            cv_sentence = list_to_sentence(cv_sentence)
            cv_doc = words_vector(cv_sentence)
            for query_sentence in query_sentences:

                score += cv_doc.similarity(words_vector(list_to_sentence(query_sentence)))

        return round(score/(len(cv_sentences)*len(query_sentences)) , 2)


    cv = handle_unknown_vocab(words_vector, cv)
    if len(cv) == 0: return 0
    query = handle_unknown_vocab(words_vector, query)
    if len(query) == 0:
        print (f"Error: Job description UNKNOWN\n {query}")
        return 0

    query_sentences = split_sentence(query, window_size=window_size, step_size=step_size)
    cv_sentences = split_sentence(cv, window_size=window_size, step_size=step_size)

    # NxN for loops
    score = 0
    for cv_sentence in cv_sentences:
        for query_sentence in query_sentences:

            score += cosine_sim(cv_sentence, query_sentence)

    return round(score/(len(cv_sentences)*len(query_sentences)) , 2)


def extend_query(words_vector, query, n_extend):
    '''
        using word vector, get the most similar words to test against.
    '''
    
    words_dict = {}
    for q in query:
        words_dict[q] = 0

    for q in query:
        try:
            similar_list = words_vector.most_similar(positive=[q],topn=n_extend)
            words_dict[q] += 1
            for tupl in similar_list:
                words_dict[tupl[0]] =  words_dict[q] *  tupl[1]
                
        except:
            continue

    return words_dict



def tfidf(words_vector, query, cvs, n_extend=0):
    '''
        Evaluating docs using tf-idf.
        
        `query`: the job description as tokens
        `cvs`: list of cvs tokens
        `words_vector`: the word vector model used
    '''
    # make sure we can evaluate the query with our words dictionary
    query_dict = extend_query(words_vector, query, n_extend)

    if len(query) == 0:
        print (f"Error: Job description UNKNOWN\n {query}")
        return 0

    # first compute df
    # assume all words are unique
    N = len(cvs)
    idf_dict = {}
    for word, value in query_dict.items():
        idf_dict[word] = 1
        for cv in cvs:
            if word in cv: idf_dict[word] += 1

        idf_dict[word] = math.log((N/idf_dict[word])+1)
    
    # calculate score for each doc
    score_dict = {}
    for cv_id, cv in cvs.items():
        score_dict[cv_id] = 0
        for word, value in query_dict.items():
            tf = cv.count(word)
            score_dict[cv_id] += tf * idf_dict[word] * value
    return score_dict