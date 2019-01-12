/* EXPRESS SETUP */
const express = require('express');
const path = require('path'); 
const app = express();

/* AUTHENTICATION */
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/public/html', 'welcome.html')));

const port = process.env.PORT || 3000;

app.listen(port , () => console.log('App listening on port ' + port));