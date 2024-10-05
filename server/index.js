require('dotenv/config');
const express = require('express');
const cors = require('cors');



const app = express();

app.use(express.json());
app.use(cors());

const postRouter = require('./routes/posts.js');
app.use('/posts', postRouter);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(5000, () => {
    console.log(`Server app on port 5000.`);
});
