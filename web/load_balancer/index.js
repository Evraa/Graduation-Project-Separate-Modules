const express = require('express');
const axios = require('axios');

const app = express();

const PORT = 8080;
app.listen(PORT, err => {
    if (err) 
        console.log(err);
    else
        console.log(`Load balancer is running on port ${PORT}`);
});

const servers = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
];

let current = 0;

const handler = async (req, res) => {
    const {url, method, headers, body} = req;
    const server = servers[current];
    current = (current +1)%servers.length;
    try {
        const response = await axios({
            url: `${server}${url}`,
            method: method,
            headers: headers,
            data: body
        });
        res.send(response.data);
    } catch (err) {
        res.status(500).send("Server Error");
    }

};

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get('/favicon.ico', (req, res) => {
    res.status(404).send();
});

app.use((req, res) => handler(req, res));