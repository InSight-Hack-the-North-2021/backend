
// Routes functions
const vision = require('@google-cloud/vision');
const { scorePerson,food_scorer, safe_search_scorer}=require(`../controllers/score`);
const { Storage } = require('@google-cloud/storage');

const score = async (req, res) => {
    // The ID of your GCS bucket
    const bucketName = 'makemecool.appspot.com';
    const storage = new Storage();

    const client = new vision.ImageAnnotatorClient({
        keyFilename: 'serviceAccountKey.json'
    });

    var scores = [];
    var file_names = [];
    var save_results = {};
    const [files] = await storage.bucket(bucketName).getFiles();
    for (const file of files) {
        image_name = `gs://makemecool.appspot.com/${file.name}`;
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
        const [object_response] = await client.objectLocalization(image_name);
        const [face_response] = await client.faceDetection(image_name);
        if (object_response.localizedObjectAnnotations.length == 0 && face_response.faceAnnotations.length == 0) {
            result['Final score'] = 10,
                recommendation['msg'] = "Try to include yourself in the picture. Your loved ones should know what you are doing.";
            result['recommendation'] = recommendation;
        }
        else {
            //Performs serveral detection on the image file
            const [label_response] = await client.labelDetection(image_name);
            const [safesearch_response] = await client.safeSearchDetection(image_name)
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
            }
            else if (Personexist) {
                result = scorePerson(face_response, label_response, safe_search_score, 0);
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
            }

        }
        scores.push(result["Final score"]);
        save_results[file.name] = result;
        // save_results.push[result];
        file_names.push(file.name);
    }
    var max = scores[0];
    var maxIndex = 0;
    for (var i = 1; i < scores.length; i++) {
        if (scores[i] > max) {
            maxIndex = i;
            max = scores[i];
        }
    }
    //get the image name with the max score
    var final_image = file_names[maxIndex];

    save_results[final_image]["image_url"] = "https://storage.googleapis.com/makemecool.appspot.com/" + final_image;
    const new_result = JSON.stringify(save_results[final_image]);
    console.log(new_result);

    res.json(save_results[final_image])

};

module.exports = { score };