const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); // For Cross-Origin Resource Sharing

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/database';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define a schema for the quotes
const quoteSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, validate: {
        validator: function(v) {
            return /^\d{10}$/.test(v); // Ensure phone number is 10 digits
        },
        message: props => `${props.value} is not a valid phone number!`
    }},
    email: { type: String, required: true, match: /^\S+@\S+\.\S+$/ }, // Basic email validation
});

// Create a model
const Quote = mongoose.model('Quote', quoteSchema);

// Route to handle form submission
app.post('/submit-quote', async (req, res) => {
    console.log('Received body:', req.body); // Log the body to see what is received
    const { name, phone, email } = req.body;

    // Create a new quote document
    const newQuote = new Quote({ name, phone, email });

    try {
        await newQuote.save();
        res.status(200).send('Quote submitted successfully!');
    } catch (error) {
        console.error('Error saving quote:', error);
        res.status(500).send('Error saving quote: ' + error.message);
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
