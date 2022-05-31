const express = require("express");
const PORT = 3000;
const app = express();
require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose')
const morgan = require('morgan');

app.use(cors());
app.use(express.static('build'));
app.use(express.json())
app.use(morgan('dev'))

// - Home page
app.get('/', (req, res) => {
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