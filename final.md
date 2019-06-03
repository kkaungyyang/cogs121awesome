# COGS 121 Spring 2019 (Final Submission)

## Team Name
* Editted

## Team Members
* Kaung Yang
* Mingbin Li 
* Andrew Or
* Hillary Thi 

---
## Developer's Contributions
Name | Contributions to the Project
------------ | -------------
Kaung Yang | Initial set up of the project directory, UI improvements, single page flow, animation, grid layout of flip-cards, responsiveness. Mostly front-end work. 
Mingbin Li | Analyze the Dog Breed Classifier Machine Learning Algorithm on Kaggle, then recreated the process on Microsoft Azure ML service. Turned the machine learning model into a Python Web App service and deployed it on Heroku. Provided API documentation so the WeDog app can make use of the Dog Breed classifier.
Andrew Or | Fetched information and images of different dog breeds from TheDogAPI. Integrated UploadCare for uploading images. Setup Firebase database. Some front-end changes - breed list page.
Hillary Thi | All front end work: most functionality of initial page layouts, lots of refactoring, ajax calls, flip cards.
    
---
## Decription of Source Code Files
*Final submission of code can be found in the __prod__ branch*

File Name | Description
------------ | -------------
app.js | Initialize and set up application with EJS and Express
script.js | Compililation of most Javascript used in application
seedDB.js | Fetch information from TheDogAPI, and write this information to firebase database for subsequent reads
index.css | General styling for website (non-bootstrap css)
card.css | Styling for card.ejs template
card.ejs | Template for dog breed information that displays the results of the machine learning
footer.ejs | Closing HTML body and html tags
header.ejs | HTML DOCTYPE and head tag that contains import of CDN urls that are used across all pages. Includes navigation bar
breed_list.ejs | HTML code for displaying the dog breed information database
index.ejs | Landing page that compiles all of our application into a single page

---

## [Link to Google Slides](https://docs.google.com/presentation/d/18Z8m6mijxqJ-MYc0MNGLrlbZm5V7n-RQ7_JXSV23SIg/)

## [Link to Video Demo](https://www.youtube.com/watch?v=WGZzsQK0Qqc)
