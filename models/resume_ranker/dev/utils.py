import pandas as pd
import os, sys


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
