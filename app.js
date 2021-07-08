const axios = require('axios').default;
const UserAgent = require('user-agents');
const path = require('path');
const axiosRetry = require('axios-retry');
const express = require('express');
const { token, channelId, viewerPort, fetchDelay } = require('./config.json');

const sleep = t => new Promise(r => setTimeout(r, t));

(async () => {
    console.log('Beginning message scraping...');

    axios.defaults.headers.common['Authorization'] = token;
    axios.defaults.headers.common['User-Agent'] = new UserAgent().toString();
    axiosRetry(axios, { retries: 5 });

    let messageDayPairs = new Map();
    let messageHourPairs = new Map();
    let scrapedCount = 0;
    let lastMessage;

    for (let i = 0; i < 24; i++) {
        messageHourPairs.set(i, 0);
    }

    do {
        const { data } = await axios(`https://discord.com/api/v9/channels/${channelId}/messages?limit=100${lastMessage ? `&before=${lastMessage}` : ''}`);

        for (const message of data) {
            const date = new Date(message.timestamp);

            const dateString = `${["Jan", "Feb", "Mar", "Apr", "May", "June",
                "July", "Aug", "Sep", "Oct", "Nov", "Dec"
            ][date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

            if (messageDayPairs.has(dateString)) {
                messageDayPairs.set(dateString, messageDayPairs.get(dateString) + 1)
            } else {
                messageDayPairs.set(dateString, 1)
            }

            messageHourPairs.set(date.getHours(), messageHourPairs.get(date.getHours()) + 1)
        }

        lastMessage = data[data.length - 1] ? data[data.length - 1].id : null;

        scrapedCount += 100;
        console.log(`Scraped: ${scrapedCount} (${messageDayPairs.size} total days of messages)`);

        await sleep(fetchDelay);
    } while (lastMessage);
    
    console.log('Starting data viwer server...');
    const app = express();

    app.get('/data', (_, res) => res.json({
        daily: {
            days: Array.from(messageDayPairs.keys()),
            counts: Array.from(messageDayPairs.values())
        },
        hourly: {
            hours: Array.from(messageHourPairs.keys()),
            counts: Array.from(messageHourPairs.values()).map(count => count / Array.from(messageDayPairs.keys()).length)
        }
    }));
    app.get('/', (_, res) => res.sendFile(path.join(__dirname, 'visualizer.html')));

    app.listen(viewerPort, () => console.log(`Viewer started on: http://localhost:${viewerPort}`));
})();