#global imports
import numpy as np
from scipy.spatial import distance

#local imports
from parser import remove_noisy_words



def sent2vec(sentence):
    '''Generate Vectora for sentences.'''
    
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



def rank(words_vector, cv, query, window_size=5, step_size=3):
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
    