import 'dotenv/config';
import express from 'express';
import expressLayout from 'express-ejs-layouts';
import db from './server/config/db.js';

const [rows] = await db.query("SELECT * FROM user");

console.log(rows);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static('public'));

// Templating Engine
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

app.use('/', (await import('./server/routes/main.js')).default);

app.listen(PORT, () => {
    console.log(`Server app on port ${PORT}.`);
});
