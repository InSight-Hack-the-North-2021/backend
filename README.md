# InSight: Hack the North 2021
Describe Describe

 - Y
 - y
 - Y
 - y
    
### For a video/devpost demonstration visit
-  [Youtube Video]()

# Table of Contents
- [Installations](#installations)
- [How To Run](#run)
- [Endpoints](#endpoints)
- [Future Features](#future-features)
- [Contact Us](#contact-us)


<a name="installations"/>

## 1. Installations
- ### General
   - clone the code in your local environment
   - in terminal type the cmd ``` npm i```, to install all dependencies

- ### Hootsuite Dependencies
   - Make sure you have a developer account with hootsuite. Make sure you have an app on that account with access to the REST API.
   - Create a ```.env``` file in the root of the project. Inside the file create a variable named ```CREDENTIAL``` and put in your Hootsuite App's ```REST API Client ID:REST API Client Secret``` in base64.

   ```
      CREDENTIAL=base64(REST API Client ID:REST API Client Secret)
   ```
- ### Firebase Dependencies
   - Create a firebase project
   - Go to your ```Firebase project -> Project Settings -> Service Accounts``` and download the firebase SDK by clicking ```Generate New Private Key``` button
   - Rename the file to ``` serviceAccountKey.json ``` and put it in the root folder. The file will look like this
   ```
    {
     "type": ,
     "project_id": ,
     "private_key_id": ,
     "private_key": ,
     "client_email": ,
     "client_id": ,
     "auth_uri": ,
     "token_uri": ,
     "auth_provider_x509_cert_url": ,
     "client_x509_cert_url": 
   }
   ```

<a name="run"/>

## 2. How to run
- to run the code type ``` npm run start``` and head over to http:localhost:8000/. 

<a name="endpoints"/>

## 3. Endpoints

### 1. Scoring and Recommendation
- POST ```http://localhost:8000/image/score```:
```bash
{
    "blurred_scored": Integer || null,
    "facial_attr_score": Integer || null,
    "no_of_faces_score": Integer || null,
    "face_label_score": Integer || null,
    "safe_search_score": Integer || null,
    "food_score": Integer || null,
    "Final score": Integer || null,
    "recommendation": {
          "joy": String || null,
          "blurr": String || null,
          "msg": String || null, 
          "anger" : String || null,
          "safesearch" : String || null,
          "faces" : String || null
     },
    "labels": [
          "Gesture",
          "Formal wear",
          "Event", .......      
    ]
}

```

### 2. Hootsuite

- POST ```http://localhost:8000/hootsuite/schedulePost/:text```
  - ```:text``` is a parameter, it contains the text that user wants to enter with a post
  - Response - If it return status 200 its all good, for any other status pls give an error.
    
<a name="future-features"/>

## 4. Future Features

<a name="contact-us"/>

## 5. Contact Us

