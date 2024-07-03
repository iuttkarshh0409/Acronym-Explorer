const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/acronymsDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

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
    console.log(`Received request for acronym: ${inputAcronym}`); // Log the request
    Acronym.findOne({ acronym: inputAcronym })
        .then(result => {
            console.log('Database result:', result); // Log the database result
            if (result) {
                res.json({ fullForm: result.fullForm });
            } else {
                res.status(404).json({ message: 'Acronym not found' });
            }
        })
        .catch(err => {
            console.error('Error fetching acronym:', err);
            res.status(500).json({ message: 'Internal Server Error' });
        });
});

// Start Server
app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
