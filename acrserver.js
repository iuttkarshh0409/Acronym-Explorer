const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// MongoDB connection (local)
const uri = "mongodb://localhost:27017/acronymsDB";

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Adjust as needed
    socketTimeoutMS: 45000 // Adjust as needed
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
    Acronym.findOne({ acronym: inputAcronym })
        .then(result => {
            if (result) {
                res.json({ fullForm: result.fullForm });
            } else {
                res.status(404).json('Acronym not found');
            }
        })
        .catch(err => {
            console.error('Error fetching acronym:', err);
            res.status(500).json('Internal Server Error');
        });
});

// API Endpoint to Fetch Acronyms with Pagination
app.get('/api/acronyms', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const count = await Acronym.countDocuments({});
        const acronyms = await Acronym.find()
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            acronyms,
            totalPages: Math.ceil(count / limit),
        });
    } catch (err) {
        console.error('Error fetching acronyms:', err);
        res.status(500).json('Internal Server Error');
    }
});

// API Endpoint to Add a New Acronym
app.post('/api/addAcronym', (req, res) => {
    const { acronym, fullForm } = req.body;
    if (!acronym || !fullForm) {
        return res.status(400).json({ error: 'Both acronym and fullForm are required.' });
    }

    const newAcronym = new Acronym({
        acronym: acronym.toUpperCase(),
        fullForm
    });

    newAcronym.save()
        .then(() => {
            res.status(201).json(newAcronym);
        })
        .catch(err => {
            console.error('Error saving acronym:', err);
            res.status(500).json('Internal Server Error');
        });
});

// Start Server
app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
