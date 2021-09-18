
// Routes functions
const vision = require('@google-cloud/vision');


const labelscorer = (labels) => {
    var face_label_score = 0;
    labels.forEach(label => {
        if (label.description == 'Smile') {
            face_label_score += 1;
        }
        if (label.description == 'Happy') {
            face_label_score += 1;
        }
        if (label.description == 'Flash photography') {
            face_label_score += 1;
        }
        if (label.description == 'Street fashion') {
            face_label_score += 1;
        }
        if (label.description == 'Leisure') {
            face_label_score += 1;
        }
    });
    // console.log(face_label_score);
    if (face_label_score == 0) {
        face_label_score = 3;
    }
    else {
        face_label_score = Math.min(15, 3 + Math.ceil((face_label_score / 5) * 15));
    }
    return face_label_score;
}

const safe_search_scorer = (safesearch) => {
    var total_safe_score = 0;
    if (likinesstoValue(safesearch.violence) >= 2) {
        total_safe_score += ((likinesstoValue(safesearch.racy)) * 33);
    }
    if (likinesstoValue(safesearch.adult) >= 2) {
        total_safe_score += (likinesstoValue(safesearch.adult) * 33);
    }
    if (likinesstoValue(safesearch.racy) >= 2) {
        total_safe_score += (likinesstoValue(safesearch.violence) * 33) / 4;
    }

    return - Math.min(100, total_safe_score);
}
const food_scorer = (labels) => {
    var face_label_score = 0;
    labels.forEach(label => {

        if (label.description == 'Food') {
            face_label_score += 1;
        }
        if (label.description == 'Cuisine') {
            face_label_score += 1;
        }
        if (label.description == 'Recipe') {
            face_label_score += 1;
        }
        if (label.description == 'Ingredient') {
            face_label_score += 1;
        }
    });

    return Math.min(5, 2 + (face_label_score / 4) * 5);


}
const recommend = (joy_score, anger_score, sorrow_score, blurred_score, safe_search_score, face_label_score, total_score, count) => {
    var recommendation = {
        "joy": null,
        "blurr": null,
        "msg": null,
        "anger": null,
        "safesearch": null,
        "faces": null
    };
    if (joy_score / (4 * count) < 0.75) {
        recommendation['joy'] = "Try to smile more, your smile alone can show how confident and glowing you can be";
    }
    if (anger_score / (4 * count) < 0.75) {
        recommendation['anger'] = "Take a chill pill bro! You  don't want people to run away from you, do you?";
    }
    if (sorrow_score / (4 * count) < 0.75) {
        recommendation['sorrow'] = "Why that long face? Cheer up a bit, there is so much about you to love.";
    }
    if (blurred_score < -15) {
        recommendation['blurr'] = " It seems your image is blurry, try to take a btter picture";
    }
    if (safe_search_score < -15) {
        recommendation['safesearch'] = "Uh oh! we can't let you upload inappropriate or explicit pictures like that.";
    }
    if (face_label_score < 8) {
        recommendation['msg'] = "Try taking your picture in a better setting, wear something stylish, and cheer up ";
    }
    if (75 < total_score && total_score < 80 && count < 5) {
        recommendation['faces'] = "Try taking pictures with friends and family to improve your score"
    }
    return recommendation;
}

const face_scorer = (Faces, face_label_score, safe_search_score, food_score) => {
    var count = 0;
    var blurred_score = 0;
    var facial_attr_score = 0;
    var no_of_faces_score = 0;
    var joy_score = 0;
    var sorrow_score = 0;
    var anger_score = 0;
    Faces.forEach(face => {
        count = count + 1;
        blurred_score += likinesstoValue(face.blurredLikelihood);
        joy_score += likinesstoValue(face.joyLikelihood);
        sorrow_score += 4 - likinesstoValue(face.sorrowLikelihood);
        anger_score += 4 - likinesstoValue(face.angerLikelihood);
        facial_attr_score += (likinesstoValue(face.joyLikelihood) + (4 - likinesstoValue(face.sorrowLikelihood)) + (4 - likinesstoValue(face.angerLikelihood)))
    })
    // console.log('Face count:' + count);
    blurred_score = - Math.min(40, blurred_score * 5 / (0.3 * count));
    facial_attr_score = 40 * (facial_attr_score / (12 * count));
    if (facial_attr_score < 30 && count < 5) {
        no_of_faces_score = 26 + Math.min(10, count * 3) - Math.max(0, count - 7);
    }
    else {
        no_of_faces_score = 35 + Math.min(10, count * 3) - Math.max(0, count - 7);
    }


    var total_score = Math.max(10, Math.min(100, no_of_faces_score + facial_attr_score + blurred_score + safe_search_score + face_label_score + food_score));
    var recommendation = recommend(joy_score, anger_score, sorrow_score, blurred_score, safe_search_score, face_label_score, total_score, count);
    var result = {
        'blurred_scored': Math.floor(blurred_score),
        'facial_attr_score': Math.floor(facial_attr_score),
        'no_of_faces_score': Math.floor(no_of_faces_score),
        'face_label_score': Math.floor(face_label_score),
        'safe_search_score': Math.floor(safe_search_score),
        'food_score': Math.floor(food_score),
        'Final score': Math.floor(Math.floor(total_score)),
        "labels": []
    }
    result['recommendation'] = recommendation;
    return result;
}
const scorePerson = (face_response, label_response, safe_search_score, food_score) => {
    if (face_response.faceAnnotations.length == 0) {
        var result = {
            "blurred_scored": null,
            "facial_attr_score": null,
            "no_of_faces_score": null,
            "face_label_score": null,
            "safe_search_score": null,
            "food_score": null,
            // "hasPerson" : Boolean,
            "Final score": null,
            "recommendation": {
                "joy": null,
                "blurr": null,
                "msg": null,
                "anger": null,
                "safesearch": null,
                "faces": null
            },
            "labels": []
        };

        result['Final score'] = Math.max(0, 10 + safe_search_score),
            result['recommendation']['msg'] = "Try to include yourself in the picture. Your loved ones should know how deighted you are."
    } else {
        var face_label_score = labelscorer(label_response.labelAnnotations);
        const array = [];
        label_response.labelAnnotations.forEach(label => {
            array.push(label.description);
        });
        result = face_scorer(face_response.faceAnnotations, face_label_score, safe_search_score, food_score);
        result['labels'] = array;
    }
    return result;
}

const likinesstoValue = (p) => {
    if (p == 'VERY_UNLIKELY') {
        return 0;
    }
    else if (p == 'UNLIKELY') {
        return 1;
    }
    else if (p == 'POSSIBLE') {
        return 2;
    }
    else if (p == 'LIKELY') {
        return 3;
    }
    else if (p == 'VERY_LIKELY') {
        return 4;
    }
}

const score = async (req, res) => {
    // Creates a client
    const client = new vision.ImageAnnotatorClient({
        keyFilename: 'serviceAccountKey.json'
    });

    image_name = './public/images/emotion.png'
    var result = {
        "blurred_scored": null,
        "facial_attr_score": null,
        "no_of_faces_score": null,
        "face_label_score": null,
        "safe_search_score": null,
        "food_score": null,
        // "hasPerson" : Boolean,
        "Final score": null,
        "recommendation": {
            "joy": null,
            "blurr": null,
            "msg": null,
            "anger": null,
            "safesearch": null,
            "faces": null
        },
        "labels": []
    };
    var recommendation = {
        "joy": null,
        "blurr": null,
        "msg": null,
        "anger": null,
        "safesearch": null,
        "faces": null
    };
    //Detect if there is a Object or not
    const [object_response] = await client.objectLocalization('./' + image_name);
    const [face_response] = await client.faceDetection('./' + image_name);
    if (object_response.localizedObjectAnnotations.length == 0 && face_response.faceAnnotations.length == 0) {
        result['Final score'] = 10,
            recommendation['msg'] = "Try to include yourself in the picture. Your loved ones should know what you are doing.";
        result['recommendation'] = recommendation;
    }
    else {
        //Performs serveral detection on the image file
        const [label_response] = await client.labelDetection('./' + image_name);
        const [safesearch_response] = await client.safeSearchDetection('./' + image_name)
        var safe_search_score = safe_search_scorer(safesearch_response.safeSearchAnnotation);
        var Personexist = false;
        var foodexist = false;
        if (safe_search_score < -15) {
            result['Final score'] = 0;
            recommendation['safeseacrh'] = "Uh oh! we can't let you upload inappropriate or explicit pictures like that.";
            result['recommendation'] = recommendation;
        }

        //Detect if there is a PEROSN OR FOOD 
        object_response.localizedObjectAnnotations.forEach(output => {
            if (output.name == 'Person') {
                Personexist = true;
            }
            if (output.name == 'Food') {
                foodexist = true;
            }
        })
        if (face_response.faceAnnotations.length != 0) {
            Personexist = true;
        }
        if (foodexist && Personexist) {
            result = scorePerson(face_response, label_response, safe_search_score, food_scorer(label_response.labelAnnotations))
            // result['hasPerson'] = true
        }
        else if (Personexist) {
            result = scorePerson(face_response, label_response, safe_search_score, 0);
            // result['hasPerson'] = true
        }
        else if (foodexist) {
            result['Final score'] = Math.floor(40 + 5 * food_scorer(label_response.labelAnnotations));
            recommendation['msg'] = "Try to include yourself in the picture. Your loved ones should know how deighted you are.";
            result['recommendation'] = recommendation;
            // result['hasPerson'] = false
            const array = [];
            label_response.labelAnnotations.forEach(label => {
                array.push(label.description);
            });
            result['labels'] = array;
        }
        else {
            result['Final score'] = Math.max(0, 30 + safe_search_score);
            recommendation['msg'] = "Try to include yourself in the picture. Your loved ones should know what you are doing";
            result['recommendation'] = recommendation;
            // result['hasPerson'] = false
        }

    }

    console.log(result);
    res.json(result)

};

module.exports = { score, scorePerson, food_scorer, safe_search_scorer };