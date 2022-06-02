const express = require("express");
const app = express();
require('dotenv').config();
const PORT = process.env.PORT;
const cors = require('cors');
const mongoose = require('mongoose')
const morgan = require('morgan');
const PgSidekick = require("./utils/pg-sidekick")
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

  // return the home page with "create bin button"
  // create bin button sends POST to /create route
})

app.post('/create', (req, res) => {
 // creates a new bin and returns page with new bin url (passing through mongo reference id in the url)
})

// - View Created page
app.get('/create/:bucketUrl', (req, res) => {
  // displays page with new bin url
  // button to view bin history
})

// - Bin "page" that collects all incoming
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
      const bucketId = bucketRequests[0]['bucket_id']

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

// - Bin History page
app.get('/history/:binUrl', (req, res) => {
  // pull data for this binUrl to provide for the React template
})
// app.get('/:binUrl', (req, res) => {
//   // display ok/bin history
// })

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})