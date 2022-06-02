const express = require("express");
const app = express();
require('dotenv').config();
const path = require('path');
const PORT = process.env.PORT;
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const PgSidekick = require("./utils/pg-sidekick")
const { urlGenerator } = require("./services/url-generator");
const pg = new PgSidekick()
const Request = require('./models/request')

app.use(cors());
app.use(express.static('build'));
app.use(express.json())
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(morgan('dev'))

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('connected to MongoDB');
    })
    .catch((error) => {
        console.error('error connecting to MongoDB:', error.message);
    });

// - Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname+'/static/home.html'));
})

app.post('/create', (req, res) => {
 // creates a new bucket and returns page with new bucket url
  let newUrl = urlGenerator();

  try {
    ;(async function () {
      // add to postgres db
      pg.addBucket(newUrl);
      // direct to 'created' page
      res.redirect(`/create/${newUrl}`)
    })()
  } catch (error) {
    console.error(error)
  }
})

// - View Created page
app.get('/create/:bucketUrl', (req, res) => {
  // displays page with new bin url
  let host = req.get('host');
  let url = `${host}/${req.params.bucketUrl}`;
  // button to view bin history
  res.send(url);
})

// - Bucket "page" that collects all incoming
app.all(`/:bucketUrl`, (req, res) => {
  const bucketUrl = req.params.bucketUrl
  const header = req.headers
  const requestType = req.method
  const body = req.body

  // TODO: validate if bucketURL exists in database
  // if not, return an helpful error to user  

  const requestObj = new Request({
    headers: header,
    payload: body
  })
  // let countRequests; TODO
  
  ;(async function () {
    try {
      const bucketRequests = await pg.loadRequests(bucketUrl)
      countRequests = bucketRequests.length
      const bucketId = await pg.getBucketId(bucketUrl);

      // Write to MongoDB
      const savedRequest = await requestObj.save()
      const mongoId = savedRequest._id

      const newRequest = await pg.createRequest(bucketId, requestType, mongoId)

    } catch (error) {
      console.error(error);
    }
  })() 
  // TODO: 
  // if (countRequests >= 20) {
  //   // delete oldest request from bucket
  // }

  res.send('200')
})

// app.get('/:bucketUrl', (req, res) => {
//   // display ok/bucket history
// })

// - Bin History page
app.get('/history/:bucketUrl', (req, res) => {
  // pull data for this bucketUrl to provide for the React template
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})