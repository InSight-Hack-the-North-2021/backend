# backend

## Do not make this repo public, we will create a new one for hack the north. Keep this one private

## How to run
- clone the code in your local environment
- in terminal type the cmd ``` npm i```, to install all dependencies
- to run the code type ``` npm run start``` and head over to http:localhost:8000/. 

## Endpoints

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
    


