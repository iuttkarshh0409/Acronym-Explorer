const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// MongoDB connection

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://dubeutkarsh7:Raam%40108@acrdbcluster.rjfwo0s.mongodb.net/?appName=acrDBCluster";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);


// Enable CORS
app.use(cors());

// Define Schema and Model
const acronymSchema = new mongoose.Schema({
    acronym: String,
    fullForm: String
});

const Acronym = mongoose.model('Acronym', acronymSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// API Endpoint to Fetch Acronym Full Form
app.get('/api/acronym/:acronym', (req, res) => {
    const inputAcronym = req.params.acronym.toUpperCase();
    Acronym.findOne({ acronym: inputAcronym })
        .then(result => {
            if (result) {
                res.json(result.fullForm);
            } else {
                res.status(404).json('Acronym not found');
            }
        })
        .catch(err => {
            console.error('Error fetching acronym:', err);
            res.status(500).json('Internal Server Error');
        });
});

// Start Server
app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
