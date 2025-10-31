const express = require('express')
// Import routes
const authRoutes = require('./routes/authRoutes');
const informationRoutes = require('./routes/informationRoutes');
const transactionsRoutes = require('./routes/transactionRoutes');

const app = express()
const port = 3000

// Add middleware to parse JSON and URL-encoded bodies
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Routes
app.use('/', authRoutes);
app.use('/', informationRoutes);
app.use('/', transactionsRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})