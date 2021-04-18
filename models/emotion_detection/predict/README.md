## requirements:
    + python
    + pip install -r requirements
    + download dataset, and place it at "./data/" then tar (unzip) it there.

## how to run:     
    To use a model:
        1.1- to test a video, place it at folder ./test_video
        1.2- to test an image, place it at folder ./test_images
        2-  python predict.py -m [v | i]
            v: for video
            i: for image
            ex: python predict.py -m v
            
        3-  pick the model you want.
            if file was empty, please train first.
