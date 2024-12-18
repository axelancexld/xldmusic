const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const app = express();
const port = 80;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');


// Routes
app.use('/', authRoutes);
const songRoutes = require('./routes/song');
app.use('/', songRoutes);

// Server başlatma
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
