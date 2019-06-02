# Machine Learning Stuff
import keras
import tensorflow as tf
from keras.models import model_from_json
import json
import os
from PIL import Image
from skimage.io import imread
from keras.applications.densenet import DenseNet121, preprocess_input
import numpy as np
import requests
from io import BytesIO
from flask import Flask

# Init machine learning model from files
with open('labels',"r") as json_file_labels:
    labels = json.loads(json_file_labels.read().replace("\'","\""))

with open('model.json') as json_file:
    json_string = json.load(json_file)
    model = model_from_json(json_string)

model.load_weights('dog_breed_classifier_model.h5')
model._make_predict_function()


# Main function that download and classify and picture
def download_and_predict(url):
    # download and pre-process the picture
    response = requests.get(url)
    img = Image.open(BytesIO(response.content))
    img = img.convert('RGB')
    img = img.resize((224, 224))
    
    # predict
    img = np.array(img)
    img = preprocess_input(img)
    probs = model.predict(np.expand_dims(img, axis=0))

    # Format the results and return the 5 most likely breeds
    result = []
    for idx in probs.argsort()[0][::-1][:5]:
        result.append("{:.2f}%".format(probs[0][idx]*100) + "\t" + labels[idx].split("-")[-1])

    return json.dumps(result)


# app stuff
app = Flask(__name__)


# Index, and test method
@app.route("/")
def hello():
    return "hiiiiiiiiii wooooooolrd"


# Main classifier service, accept a URL to the picture as GET parameter
@app.route('/<path:subpath>')
def classify(subpath):
    return download_and_predict(subpath)
