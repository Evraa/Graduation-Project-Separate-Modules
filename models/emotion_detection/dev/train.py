#global imports
import torch
import numpy as np
import matplotlib.pyplot as plt
from PIL import Image, ImageDraw, ImageFont
import os
from torchvision import datasets, models, transforms
import torch.nn as nn
import torch.optim as optim
from torch.optim import lr_scheduler
from facenet_pytorch import MTCNN
import torch.nn.functional as F
import time
#local imports
import consts

device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
# Implementing the model

def model_init(num_classes):
    '''
        Loads ResNet18 model by torch.

        Modify the last fc layer to be suitable with our model.

        Defines and returns model, criterion, optimizer and learning rate scheduler.
    '''
    #read the model RESNET18
    model = models.resnet18(pretrained=True)
    num_features = model.fc.in_features
    model.fc = nn.Linear(num_features, num_classes)
    model = model.to(device) #if cuda or not
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    exp_lr_scheduler = lr_scheduler.StepLR(optimizer, step_size=30, gamma=0.1)
    return model, criterion, exp_lr_scheduler, optimizer



def data_load():
    '''
        loads the data at from folder ../data/data_png/
    '''
    # Creating the train/test dataloaders from images
    root_data_dir = consts._dataset_png_path
    #transform the data
    transform = transforms.Compose([transforms.RandomResizedCrop(224),transforms.RandomHorizontalFlip(),transforms.ToTensor(),transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])])
    total_dataset = datasets.ImageFolder(root_data_dir, transform)
    #split train and test
    train_size = int(0.8 * len(total_dataset))
    test_size = len(total_dataset) - train_size
    train_dataset, test_dataset = torch.utils.data.random_split(total_dataset, [train_size, test_size])

    train_dataloader = torch.utils.data.DataLoader(train_dataset, batch_size=consts._batch_size, shuffle=True, num_workers=4)
    test_dataloader = torch.utils.data.DataLoader(test_dataset, batch_size=consts._batch_size, shuffle=True, num_workers=4)

    class_names = total_dataset.classes
    num_classes = len(class_names)
    return train_dataloader, test_dataloader, num_classes,class_names


def train(model, criterion,train_dataloader, test_dataloader, optimizer):
    print('=== TRAINING ===')
    model.train()
    counter = 0
    acc_counter = 0
    loss_counter = 0
    batch_counter = 0
    for inputs, labels in train_dataloader:
        inputs, labels = inputs.to(device), labels.to(device)

        optimizer.zero_grad()
        outputs = model(inputs)

        loss = criterion(outputs, labels)

        preds = torch.argmax(outputs, 1)
        acc = (preds == labels).sum().item()

        acc_counter += acc
        loss_counter += loss.item()
        batch_counter += len(labels)
        counter += 1

        loss.backward()
        optimizer.step()

        if(counter % 100 == 0):
            print(f'Accuracy: {round(acc_counter/batch_counter, 4)} \t Loss: {loss_counter/counter}')

def test(model, class_names, test_dataloader, criterion):
    print('=== VALIDATION ===')
    model.eval()
    acc_counter = 0
    loss_counter = 0
    batch_counter = 0
    counter = 0
    class_correct = [0 for i in range(len(class_names))]
    class_total = [0 for i in range(len(class_names))]
    with torch.no_grad():
        for inputs, labels in test_dataloader:
            inputs, labels = inputs.to(device), labels.to(device)

            outputs = model(inputs)

            loss = criterion(outputs, labels)

            preds = torch.argmax(outputs, 1)
            acc = (preds == labels).sum().item()
            c = (preds == labels)

            for i in range(len(labels)):
                label = labels[i]
                class_correct[label] += c[i].item()
                class_total[label] += 1

            acc_counter += acc
            loss_counter += loss.item()
            batch_counter += len(labels)
            counter += 1

    print(f'Accuracy: {round(acc_counter/batch_counter, 4)} \t Loss: {round(loss_counter/counter, 4)}')
    for i in range(len(class_names)):
        print(f'Accuracy of {class_names[i]} : {round(class_correct[i]/class_total[i], 4)}')


def run_train():
    train_dataloader, test_dataloader, num_classes,class_names = data_load()
    model, criterion, exp_lr_scheduler,optimizer = model_init(num_classes)
    for epoch in range(consts._epochs):
        print(f'=== EPOCH {epoch+1} / {consts._epochs} ===')
        train(model, criterion,train_dataloader, test_dataloader,optimizer)
        test(model, class_names, test_dataloader, criterion)
        exp_lr_scheduler.step()
     
        #save model and replace after each epoch.
        if(not os.path.isdir('../model')):
            os.mkdir('../model')
        # timestr = time.strftime("%Y%m%d-%H%M%S")  #not useful anymore.
        model_path = '../model/emotion_detect_model.h5'
        if(not os.path.exists(model_path)):
            torch.save(model, model_path)
            print("model is updated and replaced.")
        else:
            torch.save(model, model_path)
            print("model is created for the first epoch.")
