---
topic: WeAnimal-DogClassifier
languages: Python 3.6
Platform: Heroku
Framework: Flask
---

### This is a simple Machine Learning API for classifying breeds of dog
The machine learning model is from https://www.kaggle.com/hengzheng/dog-breeds-classifier

## File Structure
### app.py
Contain the web app framework code, http routes, and the classifier

### requirements.txt
Contain Python packages needed to run this app

### dog_breed_classifier_model.h5
Keras weight file for the machine learning model

### model.json
Keras architecture file for the machine learning model

### labels
Contains labels for the machine learning model

### Procfile
Start script for heroku deployment

## How to deploy (Locally)
1. Make sure Python 3 and PIP is working
2. Install packages with 
```
pip install -r requirements.txt
```
3. Run with 
```
Flask run
```

## For deployment on Heroku, just deploy this branch

# How to use
### GET https://wedog.herokuapp.com/ 
Check the status of the app. Returns "Hiiiiii Woooorld!" if running

### GET https://wedog.herokuapp.com/\<URL to a picture of a dog>
Classify the dog in the picture. Return a string list of 5 most likely breeds: ["Probability\tBreed",...] 
  
  Example:
  GET https://wedog.herokuapp.com/https://cdn1.medicalnewstoday.com/content/images/articles/322/322868/golden-retriever-puppy.jpg
  Response: ["99.93%\tgolden_retriever", "0.04%\tBrittany_spaniel", "0.02%\tLabrador_retriever", "0.01%\tLeonberg", "0.00%\tChesapeake_Bay_retriever"]
