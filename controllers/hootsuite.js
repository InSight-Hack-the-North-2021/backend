require("dotenv").config();

const axios = require('axios')
const delay = require('delay');
var fs = require("fs");
var URLSearchParams = require('url-search-params');
const  { db } = require("../firebaseSetup/firebase")

const getNewToken = async() => {

    console.log("\n\n1\n\n");
    const docRef = db.collection('refresh_token').doc("1");
    const data = await docRef.get()

    const config = {
        headers: { 
            Authorization: `Basic ${process.env.CREDENTIAL}` 
        }
    };

    const bodyParameters = {
        "grant_type": "refresh_token",
        "refresh_token": data.data().refresh_token
    }

    console.log("\n\n1.1\n\n");
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', data.data().refresh_token);

    console.log("\n\n1.2\n\n");
    var result = await axios.post("https://platform.hootsuite.com/oauth2/token",
            params,
            config
         ).catch(err=> console.log(err))

    console.log("\n\n1.3\n\n");
    await docRef.update(
            {
                refresh_token : result.data.refresh_token,
                access_token : result.data.access_token
            })

    console.log("\n\n1.4\n\n");
}

const uploadUrl = async () => {

    console.log("\n\n2\n\n");
        await getNewToken()

        const access_token = (await db.collection('refresh_token').doc("1").get()).data().access_token

        const config = {
            headers: { 
                Authorization: `Bearer ${access_token}` 
            }
        };
    
        const bodyParameters = {
            "sizeBytes": 383,
            "mimeType": "image/png"
        }
    
        var result = await axios.post("https://platform.hootsuite.com/v1/media",
            bodyParameters,
            config
        )

    return result.data.data   
}

const media = async function() {

    console.log("\n\n3\n\n");
    const upload =  await uploadUrl()

    fs.readFile('./public/images/emotion.png', async function(err, data) {

        // Encode to base64
        var encodedImage = new Buffer.from(data, "binary");
    
        await axios({
            method: "put",
            url: `${upload.uploadUrl}`,
            headers: {
                'Content-Type': 'image/png'
            },
            data: encodedImage
        })        
    });

    return upload.id
}

const uploadStatus = async function(){

    const id =  await media()
    await delay(10000)

    const access_token = (await db.collection('refresh_token').doc("1").get()).data().access_token

    console.log("\n\n4.3\n\n");
    var result = await axios({
        method: "get",
        url: `https://platform.hootsuite.com/v1/media/${id}`,
        headers: { 
            'Accept': 'application/json;charset=utf-8', 
            'Content-Type': 'application/json;charset=utf-8', 
            'Authorization': `Bearer ${access_token}` 
          }
    })

    console.log(result.data.data);
    return id
}

const schedulePost = async(req, res) => {
     
    console.log("\n\n5\n\n");
        const id =  await uploadStatus()
        const text = req.body.text
            console.log("Here is the id", id.toString());
            const access_token = (await db.collection('refresh_token').doc("1").get()).data().access_token
            console.log("Access token", access_token);
            
            // var data = `{\n  "text": "5 trends that will change how we use social media this year",\n  "socialProfileIds": [\n    "135675784"\n  ],\n  "scheduledSendTime": "2021-09-16T02:40:00Z",\n  "emailNotification": true,\n  "media": [\n      {\n          "id":${id}\n      }\n  ]\n}`        
            var data = {
                "text" : `${text}`,
                "socialProfileIds":[
                    "135675784"
                ],
                // "scheduledSendTime":"2021-09-16T20:40:00Z",
                "emailNotification": false,
                "media": [
                    {
                        "id" : `${id}`
                    }
                ]
            }
            await axios({
                method: "post",
                url: "https://platform.hootsuite.com/v1/messages",
                headers: { 
                    'Accept': 'application/json;charset=utf-8', 
                    'Content-Type': 'application/json;charset=utf-8', 
                    'Authorization': `Bearer ${access_token}`
                  },
                data: data
            })
            .then((result) => {
                // console.log(result);
                res.json(result.data)
            })
            .catch(err => {
                res.send(err)
            })
}

module.exports = { schedulePost };