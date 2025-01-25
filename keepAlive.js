const axios = require('axios');
const cron = require('node-cron');

const websiteUrl = 'https://joseph-g-wathome.vercel.app/';

// Function to ping the website
const pingWebsite = async () => {
    try {
        const response = await axios.get(websiteUrl);
        console.log(`Website pinged successfully at ${new Date().toISOString()}`);
    } catch (error) {
        console.error(`Error pinging website: ${error.message}`);
    }
};

// Schedule the task to run every 24 hours
cron.schedule('0 0 */24 * * *', () => {
    pingWebsite();
});

console.log('Keep-alive script is running...');

// Export a handler function for Vercel
module.exports = (req, res) => {
    res.status(200).send('Keep-alive script is running in the background.');
};