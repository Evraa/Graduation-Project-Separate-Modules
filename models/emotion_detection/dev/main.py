#global imports
import argparse
import sys
import copy
import os
#local imports
import consts
import preprocess
import train



if __name__ == '__main__':

    consts.init()
    parser = argparse.ArgumentParser()
    parser.add_argument("-es", "--epoch_size",  required=False, default=10)   
    parser.add_argument("-bs", "--batch_size", required=False, default=32)   
    args = parser.parse_args()

    try:
        consts._epochs = int(args.epoch_size)
        consts._batch_size = int(args.batch_size)
    except:
        print ("Error: batch size and epoch size need to be integer values")
        sys.exit(0)
    
    
    print ("\nWe are good to go\n")
    print (f'\tepoch size: {args.epoch_size}\n\tbatch size: {args.batch_size}')
    print (f'\tEmotions picked: {consts._class_names}')

    # check if data is already preprocesed.
    folds = len(os.listdir(consts._dataset_png_path))
    if ( folds >= 1):
        print(f'There are {folds} folders in data_png, do you want to preprocess again?')
        respond = str(input('Preprocess: press y\t\tContinue: press n\t\tTo Terminate: press any other key\n'))
        if respond == "y":
            preprocess.run_preprocess()
            train.run_train()
            sys.exit(0)
        elif respond =="n":
            train.run_train()
            sys.exit(0)
        else:
            sys.exit(0)

    preprocess.run_preprocess()
    train.run_train()