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
import matplotlib.pyplot as plt
#local imports
import consts

device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
print (device)
# Implementing the model

def model_init(num_classes,lr=0.001):
    '''
        Loads ResNet18 model by torch.

        Modify the last fc layer to be suitable with our model.

        Defines and returns model, criterion, optimizer and learning rate scheduler.
    '''
    #read the model RESNET18
    model = models.resnet18(pretrained=True)
    num_features = model.fc.in_features
    # model.fc = nn.Linear(num_features, num_classes)
    model.fc = nn.Linear(num_features, num_features//4)
    model.fc_2 = nn.Linear( num_features//4, num_classes) #intermediate hidden layer for more classification acc.
    
    model = model.to(device) #if cuda or not
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=lr)
    exp_lr_scheduler = lr_scheduler.StepLR(optimizer, step_size=30, gamma=0.1)
    return model, criterion, exp_lr_scheduler, optimizer



def data_load(eval_mode=False):
    '''
        loads the data at from folder ../data/data_png/
    '''
    # Creating the train/test dataloaders from images
    root_data_dir = consts._dataset_png_path
    #transform the data
    transform = transforms.Compose([transforms.RandomResizedCrop(224),transforms.RandomHorizontalFlip(),transforms.ToTensor(),transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])])
    total_dataset = datasets.ImageFolder(root_data_dir, transform)
    #split train and test
    if eval_mode:
        train_size = int(0.01 * len(total_dataset))
        test_size = int(0.001 * len(total_dataset))
        remain = len(total_dataset) - train_size - test_size
        train_dataset, test_dataset, remain_dataset = torch.utils.data.random_split(total_dataset, [train_size, test_size, remain])        
    else:
        train_size = int(0.8 * len(total_dataset))
        test_size = len(total_dataset) - train_size
        train_dataset, test_dataset = torch.utils.data.random_split(total_dataset, [train_size, test_size])


    print (f'Length of train dataset: {train_size}')
    print (f'Length of test dataset: {test_size}')
    
    
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
    accs = []
    for step, (inputs, labels) in enumerate(train_dataloader):
        if step%100 == 0: print (f'Step: {step}')
        inputs, labels = inputs.to(device), labels.to(device)

        optimizer.zero_grad()
        outputs = model(inputs)

        loss = criterion(outputs, labels)

        preds = torch.argmax(outputs, 1)
        acc = (preds == labels).sum().item()

        acc_counter += acc
        loss_counter += loss.item()
        batch_counter += len(labels)

        loss.backward()
        optimizer.step()

        accs.append(round(acc_counter/batch_counter, 4))
        if step % 101 == 0:
            print(f'Accuracy: {round(acc_counter/batch_counter, 4)} \t Loss: {loss_counter/counter}')
    
    return sum(accs) / len(accs)

def test(model, class_names, test_dataloader, criterion):
    print('=== VALIDATION ===')
    model.eval()
    acc_counter = 0
    loss_counter = 0
    batch_counter = 0
    counter = 0
    class_correct = [0 for i in range(len(class_names))]
    class_total = [0 for i in range(len(class_names))]
    accs = []
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

    accs.append(round(acc_counter/batch_counter, 4))
    print(f'Accuracy: {round(acc_counter/batch_counter, 4)} \t Loss: {round(loss_counter/counter, 4)}')
    for i in range(len(class_names)):
        print(f'Accuracy of {class_names[i]} : {round(class_correct[i]/class_total[i], 4)}')

    return sum(accs) / len(accs)

def run_train(eval_mode=False,lr=0.0004):
    train_dataloader, test_dataloader, num_classes,class_names = data_load(eval_mode=eval_mode)
    model, criterion, exp_lr_scheduler,optimizer = model_init(num_classes,lr)
    train_accs = []   
    test_accs = []
    epochs = []
    for epoch in range(consts._epochs):
        epochs.append(epoch+1)
        print(f'=== EPOCH {epoch+1} / {consts._epochs} ===')
        acc = train(model, criterion,train_dataloader, test_dataloader,optimizer)
        train_accs.append(acc)
        acc = test(model, class_names, test_dataloader, criterion)
        test_accs.append(acc)
        exp_lr_scheduler.step()
    
        #save model and replace after each epoch.
        if(not os.path.isdir('../model')):
            os.mkdir('../model')

        if epoch%10 == 0:
            # save each tenth model
            model_path = '../model/emotion_detect_model_' + str(epoch) + ".h5"
            torch.save(model, model_path)
    
    plt.plot(epochs, train_accs, 'bs',epochs, test_accs, 'g^')
    plt.xlabel("epoch")
    plt.ylabel("accuracy")
    plt.title("train and test accuraccy")
    plt.savefig("acc")