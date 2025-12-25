const express = require('express');
const path = require('path');
const app = express();

// Use the port Azure provides, or 8080 for local testing
const port = process.env.PORT || 8080;

// Tell Express to serve your static files (css, js, images)
app.use(express.static(__dirname));

// Serve index.html when someone visits the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});