require('dotenv').config()

const express=require('express')
const { json, urlencoded } = require("body-parser");
const port = process.env.PORT || 8000
const app = express()
const cors = require("cors");

var requestTime = function (req, res, next) {
    req.requestTime = Date.now()
    next()
}
  
app.use(requestTime)
  
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(__dirname + "/public"))

// Routes

const { ScoreRoutes, HootsuiteRoutes,  PremiumRoutes} = require("./routes");

app.use("/image", ScoreRoutes);
app.use("/hootsuite", HootsuiteRoutes);
app.use("/premium", PremiumRoutes);

app.listen(port, (req,res)=>{
  console.info(`Running on ${port}`)
})