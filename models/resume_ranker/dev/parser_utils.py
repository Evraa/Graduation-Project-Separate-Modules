#Global imports
from pdfminer.high_level import extract_text
import docx2txt
import re
PHONE_REG = re.compile(r'[\+\(]?[1-9][0-9 .\-\(\)]{8,}[0-9]')
EMAIL_REG = re.compile(r'[a-z0-9\.\-+_]+@[a-z0-9\.\-+_]+\.[a-z]+')
import os
# Local imports
from nltk_downloads import *


def extract_text_from_docx(docx_path):
    '''
        As the name implies, extracting txt from word docx files using docx2txt
    '''
    txt = docx2txt.process(docx_path)
    if txt:
        return txt.replace('\t', ' ')
    return None


def extract_text_from_pdf(pdf_path):
    '''
        As the name implies, extracting txt from pdf files using pdfminer
    '''
    return extract_text(pdf_path)



def extract_names(txt):
    person_names = []

    for sent in nltk.sent_tokenize(txt):
        for chunk in nltk.ne_chunk(nltk.pos_tag(nltk.word_tokenize(sent))):
            if hasattr(chunk, 'label') and chunk.label() == 'PERSON':
                person_names.append(
                    ' '.join(chunk_leave[0] for chunk_leave in chunk.leaves())
                )

    return person_names


def extract_phone_number(resume_text):
    phone = re.findall(PHONE_REG, resume_text)

    if phone:
        number = ''.join(phone[0])

        if resume_text.find(number) >= 0 and len(number) < 16:
            return number
    return None


def extract_emails(resume_text):
    return re.findall(EMAIL_REG, resume_text)

def tokenize_text(text):
    """
        takes raw text data and tokenize it into separate words (not chars)
    """
    return  nltk.tokenize.word_tokenize(text)


def remove_noisy_words(text):
    """
        Inputs: Takes raw text data, tokenze it and then remove names, phones
            emails, stop words, and punctuations from it.

        Returns: list of tokens (words)
    """
    names = extract_names(text)
    phones = extract_phone_number(text)
    emails = extract_emails(text)

    word_tokens = tokenize_text(text)

    # remove the stop words
    filtered_tokens = [w for w in word_tokens if w not in stop_words]

    # remove the punctuation
    filtered_tokens = [w for w in filtered_tokens if w.isalpha()]

    # remove names
    if names:
        filtered_tokens = [w for w in filtered_tokens if w not in names]
    
    #remove phone
    if phones:
        filtered_tokens = [w for w in filtered_tokens if w not in phones]
    
    #remove emails
    if emails:
        filtered_tokens = [w for w in filtered_tokens if w not in emails]

    # stemming tokens using Porter stemmer
    # filtered_tokens = [porter.stem(w) for w in filtered_tokens]

    # u may also use Lancaster
    # filtered_tokens = [lancaster.stem(w) for w in filtered_tokens]

    # lemmatization using WordNet Lemmatizer
    # filtered_tokens = [wnl.lemmatize(w) for w in filtered_tokens]

    # remove redundent words
    filtered_tokens = list(dict.fromkeys(filtered_tokens))

    # remove single characters
    filtered_tokens = [w for w in filtered_tokens if len(w)>1]

    #make sure all in lowercase
    filtered_tokens = [w.lower() for w in filtered_tokens ]

    # normalize the words, build the vocabulary
    return filtered_tokens


def get_parsed_data(path):
    """
        The main function for this module.

        Input: a path to a pdf/word file

        Output: tokens of this file as a list of words.
    """
    # make sure file does exist
    if not os.path.exists(path):
        print (f"Error: path: {path} does not exist!")
        return None
    # fetch the extension of the file
    ext = path.split('.')[-1]

    # read the file
    if ext == "pdf": text = extract_text_from_pdf(path)
    elif ext == "docx": text = extract_text_from_docx(path)
    else: 
        print (f"Error: extension {ext} is not supported yet! File will be removed.")
        os.remove(path)
        return None

    # get tokens
    tokens = remove_noisy_words(text)
    
    # make sure we have data
    if tokens == None or len(tokens) == 0:
        print (f"Error: no tokens are extracted! from file: {path}")
        return None

    # else? every thing is fine
    return tokens


# if __name__ == '__main__':

    # print(extract_text_from_pdf('data/1.pdf')) 
    # print(extract_text_from_docx('data/word/1.docx'))
    # text = extract_text_from_pdf('data/pdf/1.pdf')

    # print(remove_noisy_words(text))
    # print(get_parsed_data('data/pdf/1.pdf'))