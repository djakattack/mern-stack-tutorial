const express = require('express');
const connectDB = require('./config/db');
const app = express ();

// Connect Databse
connectDB();

// Init Middleware
app.use(express.json({extended: false}));

app.get('/', (req, res)=>res.send(`API Running`));

// Define Routes
app.use('/api/user', require('./routes/api/user'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/post', require('./routes/api/post'));

const PORT = process.env.PORT || 8000;

app.listen(PORT, ()=> console.log(`Server started on port ${PORT}`));

// FOR LATER
// Remove default.json in config and redo it with process.env for security purposes.  Will need to change password for access to mongodb.
// Used in config/db.js
// Used in routes/api/user.js
// User in middleware/auth.js

// Change JWT expirations
// api/user.js
// api/auth.js