const express = require("express");
const PORT = 3000;
const app = express();
require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose')
const morgan = require('morgan');
const PgSidekick = require("./utils/pg-sidekick")
const pg = new PgSidekick()
const Request = require('./models/request')

app.use(cors());
app.use(express.static('build'));
app.use(express.json())
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

  // test object for MongoDB data 
  // DELETE CODE BELOW AFTER TESTING
  const testRequest = {
    headers: {
      'content-type': 'json',
    },
    payload: {
      'data': 'some data'
    },
    rawbody: 'asdfa;sldkfjasd'
  }
  const request = new Request(testRequest)
  
  ;(async function () {
    const buckets = await pg.loadBuckets()
    console.log(buckets)
    console.log('------------------------------');
    
    const returnedRequest = await request.save()
    console.log("returned request", returnedRequest);
    console.log('------------------------------');
    const requests = await Request.find({})
    console.log(requests)
  })()
  // DELETE CODE ABOVE AFTER TESTING

  // return the home page with "create bin button"
  // create bin button sends POST to /create route
})

app.post('/create', (req, res) => {
 // creates a new bin and returns page with new bin url (passing through mongo reference id in the url)
})


// - View Created page
app.get('/create/:binUrl', (req, res) => {
  // displays page with new bin url
  // button to view bin history
})

// - Bin "page" that collects all incoming
app.all(`/:binUrl`, (req, res) => {
  // inspect http req
  
})

// app.get('/:binUrl', (req, res) => {
//   // display ok/bin history
// })

// - Bin History page
app.get('/history/:binUrl', (req, res) => {
  // pull data for this binUrl to provide for the React template
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})