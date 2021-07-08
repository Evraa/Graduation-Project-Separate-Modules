import nltk


# Packages needed to be downloaded once
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')
nltk.download('maxent_ne_chunker')
nltk.download('words')
nltk.download('stopwords')
nltk.download('wordnet')

# lists of words needed to be loaded once
stop_words = set(nltk.corpus.stopwords.words('english'))
porter = nltk.PorterStemmer()
# lancaster = nltk.LancasterStemmer()
wnl = nltk.WordNetLemmatizer()