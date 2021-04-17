_dataset_path = 'data/fer2013/fer2013.csv'
_dataset_png_path = './data/data_png'
_image_dim = 48
_class_names = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad']
_all_emotions = {0:'angry', 1:'disgust', 2:'fear', 3:'happy', 4:'sad', 5:'surprise', 6:'neutral'}
_emotions = _all_emotions
#called only via main
def init():
    global _epochs
    global _batch_size
    _epochs = None
    _batch_size = None
