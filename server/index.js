require('dotenv/config');

const express = require('express');
const cors = require('cors');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const { db, db_options } = require('./db.js');

const app = express();

app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const sessionStore = new MySQLStore(db_options);

app.use(session({
    key: 'userId',
    secret: process.env.SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

const userRouter = require('./routes/users.js');
const postRouter = require('./routes/posts.js');
const partnershipRouter = require('./routes/partnerships.js');
const requestRouter = require('./routes/requests.js');

app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use("/partnerships", partnershipRouter);
app.use("/requests", requestRouter);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(5000, () => {
    console.log(`Server app on port 5000.`);
});
