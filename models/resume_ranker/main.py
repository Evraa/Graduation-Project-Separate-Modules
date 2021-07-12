from numpy.core.numeric import Infinity
import textract
import re
import os
import pickle
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from textract.parsers import DEFAULT_ENCODING

def preprocess (text):
    text = re.sub('[^a-zA-Z \n+0-9%-]', " ", text)
    text = text.lower()

    stemmer = PorterStemmer()
    stopwordsList = set(stopwords.words('english'))
    text = ' '.join([stemmer.stem(word) for word in text.split() if word not in (stopwordsList)])
    return text

jobDescription = """
Software Engineer, University Graduate, 2021 Start
Google
Bengaluru, Karnataka, India
Hyderabad, Telangana, India

Qualifications
Minimum qualifications:

Bachelor's degree or equivalent practical experience.
Experience working with Unix/Linux, Windows or Mac environments, distributed systems, machine learning, information retrieval and TCP/IP.
Experience programming in C, C++, Java or Python.
Preferred qualifications:

Master's degree or PhD.
About the job
Google's software engineers develop the next-generation technologies that change how billions of users connect, explore, and interact with information and one another. Our products need to handle information at massive scale, and extend well beyond web search. We're looking for engineers who bring fresh ideas from all areas, including information retrieval, distributed computing, large-scale system design, networking and data storage, security, artificial intelligence, natural language processing, UI design and mobile; the list goes on and is growing every day. As a software engineer, you will work on a specific project critical to Google’s needs with opportunities to switch teams and projects as you and our fast-paced business grow and evolve. We need our engineers to be versatile, display leadership qualities and be enthusiastic to take on new problems across the full-stack as we continue to push technology forward.

As a key member of a small and versatile team, you design, test, deploy and maintain software solutions.

If you're interested in this University Graduate position, try out Kick Start.

Google is and always will be an engineering company. We hire people with a broad set of technical skills who are ready to take on some of technology's greatest challenges and make an impact on millions, if not billions, of users. At Google, engineers not only revolutionize search, they routinely work on massive scalability and storage solutions, large-scale applications and entirely new platforms for developers around the world. From Google Ads to Chrome, Android to YouTube, Social to Local, Google engineers are changing the world one technological achievement after another.

Responsibilities
Research, conceive and develop software applications to extend and improve on Google's product offering.
Contribute to a wide variety of projects utilizing natural language processing, artificial intelligence, data compression, machine learning and search technologies.
Collaborate on scalability issues involving access to massive amounts of data and information.
Solve challenges/problems that you are presented with.
"""

jobDescription = preprocess(jobDescription)

baseDir = "../datasets/pdf/"
vectorizer = None
docsVec = None

if os.path.exists('vectorizer.pk'):
    with open('vectorizer.pk', 'rb') as inFile:
        vectorizer = pickle.load(inFile)
    with open('docsVec.pk', 'rb') as inFile:
        docsVec = pickle.load(inFile)

else:
    documents = []
    for filename in os.listdir(baseDir):
        try:
            text = textract.process(os.path.join(baseDir, filename)).decode(DEFAULT_ENCODING)
            text = preprocess(text)
            documents.append(text)
        except Exception as e:
            print(f"Error: {e}\nin {filename}")
    
    vectorizer = TfidfVectorizer()

    
    docsVec = vectorizer.fit_transform(documents)
    with open('docsVec.pk', 'wb') as fin:
        pickle.dump(docsVec, fin)
    with open('vectorizer.pk', 'wb') as fin:
        pickle.dump(vectorizer, fin)

# query job description
jobVec = vectorizer.transform([jobDescription])
output = list(map(lambda x: cosine_similarity(jobVec, x), docsVec))
top = sorted(range(len(output)), key=lambda i: output[i], reverse=True)[:10]

# words = vectorizer.get_feature_names()
# print(words, end='\n\n')
# print(jobVec[0].toarray(), end='\n\n')
# l = []
# for i, score in enumerate(docsVec[top[0]].toarray()[0]):
#     if score > 0:
#         l.append((words[i], score))
# print(l, end='\n\n')


filesList = os.listdir(baseDir)
for i in top:
    print(filesList[i], output[i])


