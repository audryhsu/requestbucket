const express = require("express");
const app = express();
require('dotenv').config();
const path = require('path');
const PORT = process.env.PORT;
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const PgSidekick = require("./utils/pg-sidekick")
const pg = new PgSidekick()
const { urlGenerator } = require("./services/url-generator");
const { sortRequests } =  require("./services/sortFunction");
const Request = require('./models/request')
const MAX_REQUESTS_PER_BIN = 20

// IMPORT SOCKET IO
const { createServer } = require("http");
const httpServer = createServer(app)
const { Server } = require("socket.io");
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"]
  }
});

// MIDDLEWARE
app.use(cors());
// app.use(express.static(path.join(__dirname, 'build')));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('connected to MongoDB');
    })
    .catch((error) => {
        console.error('error connecting to MongoDB:', error.message);
    });

// Websocket server listens for connection event for incoming sockets 
io.on('connection', (socket) => {
  const transport = socket.conn.transport.name; // in most cases, "polling"
  console.log('initial transport: ', transport)
  socket.conn.on("upgrade", () => {
    const upgradedTransport = socket.conn.transport.name; // in most cases, "websocket"
    console.log('------UPGRADED transport------', upgradedTransport)
  });

  console.log(`--------user connected: ${socket.id}`);

  socket.on('send_message', (data) => {
    console.log('got a message!')
    socket.broadcast.emit("receive_message", data)
  })

});

// - Home page
app.get('/', (req, res) => {
  // res.sendFile(path.join(__dirname+'/static/home.html'));
  
  res.json({'body': 'helloworld'}) // TESTING ONLY

})

app.post('/create', (req, res) => {
 // creates a new bucket and returns page with new bucket url
  let newUrl = urlGenerator();

  try {
    ;(async function () {
      // add to postgres db
      pg.addBucket(newUrl);
      // direct to 'created' page
      res.send(newUrl);
    })()
  } catch (error) {
    console.error(error)
  }
})


// - Bucket "page" that collects all incoming
app.all(`/:bucketUrl`, (req, res) => {
  const bucketUrl = req.params.bucketUrl
  const header = req.headers
  const requestType = req.method
  const body = req.body

  ;(async function () {
    try {
      const bucketId = await pg.getBucketId(bucketUrl);

      if (!bucketId) {
        return res.status(404).send('Bucket Url not found')
      } else {

        const bucketRequests = await pg.loadRequests(bucketUrl)
        const countRequests = bucketRequests.length

        // Delete oldest request from bucket
        if (countRequests >= MAX_REQUESTS_PER_BIN) {
          bucketRequests.sort(sortRequests)
          const oldestId = bucketRequests[0]['id']

          await pg.deleteRequest(oldestId);
        }

        // Write to MongoDB & Postgres
        const requestObj = new Request({
          headers: header,
          payload: body,
          requestType: requestType
        })
        
        const savedRequest = await requestObj.save()
        await pg.createRequest(bucketId, requestType, savedRequest._id)
      
        res.send('200')
      }

    } catch (error) {
      console.error(error);
    }
  })() 

})

// - Bin History page
app.get('/stash/:bucketUrl', (req, res) => {
  const bucketUrl = req.params.bucketUrl
  
  ;(async function () {
    try {
      const bucketId = await pg.getBucketId(bucketUrl);

      if (!bucketId) {
        return res.status(404).send('Bucket Url not found')
      } else {

        const bucketRequests = await pg.loadRequests(bucketUrl)
        const mongoIds = bucketRequests.map(req => req['mongo_document_ref'])

        if (mongoIds.length == 0) {
          return res.send(`No requests in bucket ${bucketUrl}`)
        }
        
        const data = await Request.find({
          '_id': {$in: mongoIds}
        });

        return res.json(data)
      }

    } catch (error) {
      console.error(error);
    }
  })() 
  
})

// app.get('*', (req, res) => {
//   // res.sendFile(path.join(__dirname+'/build/index.html'))

// })


// app.listen(PORT, () => {
//   console.log(`Express is running on port ${PORT}`)
// })

// must use server instead of express
httpServer.listen(PORT, () => {
  console.log(`httpServer is running on port ${PORT}`)
})

// - View Created page
// app.get('/create/:bucketUrl', (req, res) => {
//   // displays page with new bin url
//   let host = req.get('host');
//   let url = `${host}/${req.params.bucketUrl}`;
//   // button to view bin history
//   res.send(url);
// })