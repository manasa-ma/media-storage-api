require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/folders', require('./routes/folderRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));
app.use('/api/trash', require('./routes/trashRoutes')); // NEW
app.use('/api/starred', require('./routes/starredRoutes'));
app.use('/api/shares', require('./routes/shareRoutes'));

app.listen(5000, () => console.log('✅ Backend: http://localhost:5000'));

module.exports = app; // Add this for Vercel