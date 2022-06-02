const express = require("express");
const app = express();
require('dotenv').config();
const PORT = process.env.PORT;
const cors = require('cors');
const mongoose = require('mongoose')
const morgan = require('morgan');
const PgSidekick = require("./utils/pg-sidekick")
const { urlGenerator } = require("./services/url-generator");
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
  // return the home page with "create bin button"
  // create bin button sends POST to /create route
})

app.post('/create', (req, res) => {
 // creates a new bucket and returns page with new bucket url
  let newUrl = urlGenerator();

  ;(async function () {
    // add to postgres db
    pg.addBucket(newUrl);
    // direct to 'created' page
    res.redirect(`/create/${newUrl}`)
  })()
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
  // inspect http req
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