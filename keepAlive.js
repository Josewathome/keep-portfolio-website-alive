const axios = require('axios');
const cron = require('node-cron');
const express = require('express');
const fs = require('fs');

const app = express();
const dataFile = 'data.json';

// List of URLs to scrape and ping
const urls = [
    'https://joseph-g-wathome.vercel.app/projects',
    'https://joseph-g-wathome.vercel.app/experiences/5c006d7b-50c0-490c-a8cb-1bc75a18d358',  // Add more URLs here
];

let lastPingTime = null;
let nextPingTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

// Function to scrape data from URLs
const scrapeData = async () => {
    let scrapedData = [];

    for (const url of urls) {
        try {
            console.log(`Scraping: ${url}`);
            const response = await axios.get(url);
            scrapedData.push({ url, data: response.data });
        } catch (error) {
            console.error(`Error scraping ${url}: ${error.message}`);
        }
    }

    // Store new data and overwrite existing data.json
    fs.writeFileSync(dataFile, JSON.stringify(scrapedData, null, 2));
    console.log('Scraped data saved to data.json');
};

// Function to ping the websites
const pingWebsites = async () => {
    for (const url of urls) {
        try {
            await axios.get(url);
            lastPingTime = new Date().toISOString();
            console.log(`Successfully pinged: ${url} at ${lastPingTime}`);
        } catch (error) {
            console.error(`Error pinging ${url}: ${error.message}`);
        }
    }
};

// Schedule scraping and pinging every 24 hours
cron.schedule('0 0 */24 * * *', async () => {
    console.log('Running scheduled task...');
    await scrapeData();
    await pingWebsites();
    nextPingTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
});

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Serve scraped data
app.get('/scraped-data', (req, res) => {
    if (fs.existsSync(dataFile)) {
        res.sendFile(__dirname + `/${dataFile}`);
    } else {
        res.json({ message: 'No data available. Scraping may not have run yet.' });
    }
});

// Serve ping status
app.get('/ping-data', (req, res) => {
    res.json({
        lastPingTime,
        nextPingTime,
        status: 'Scraping and pinging script is running.'
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await scrapeData();  // Run scraping immediately on startup
    await pingWebsites();
});
