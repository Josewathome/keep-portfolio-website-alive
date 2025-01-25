const axios = require('axios');
const cron = require('node-cron');
const express = require('express'); // Add Express for serving HTML and data

const app = express();
const websiteUrl = 'https://joseph-g-wathome.vercel.app/projects';

// Variables to store ping times
let lastPingTime = null;
let nextPingTime = null;

// Function to ping the website
const pingWebsite = async () => {
    try {
        const response = await axios.get(websiteUrl);
        lastPingTime = new Date().toISOString();
        console.log(`Website pinged successfully at ${lastPingTime}`);
    } catch (error) {
        console.error(`Error pinging website: ${error.message}`);
    }
};

// Schedule the task to run every 24 hours
cron.schedule('0 0 */24 * * *', () => {
    pingWebsite();
    nextPingTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Set next ping time
});

// Initialize next ping time
nextPingTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Endpoint to get ping data
app.get('/ping-data', (req, res) => {
    res.json({
        lastPingTime,
        nextPingTime,
        status: 'Keep-alive script is running in the background.'
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});