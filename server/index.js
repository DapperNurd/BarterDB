require('dotenv/config');

const express = require('express');
const cors = require('cors');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const db = require('./db.js');

const app = express();

app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    key: 'userId',
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 60 * 60 * 24 // 24 hours
    }
}));

app.post('/register', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const [result] = await db.query('SELECT * FROM test_table WHERE email = ?;', [email]);

        if (result.length > 0) {
            return res.send({message: 'Email already exists.'});
        }

        bcrypt.hash(password, saltRounds, async (err, hash) => {
            if (err) console.log(err);
    
            const [result] = await db.query('INSERT INTO test_table (email, password) VALUES (?, ?)', [email, hash]);
            
            if(result) res.send(result); 
            else res.send({message: 'Failed to insert data.'});
        });
    }
    catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send({ err: err });
    }

    
});

app.get('/login', (req, res) => {
    if(req.session.user) {
        res.send({loggedIn: true, user: req.session.user});
    }
    else {
        res.send({loggedIn: false});
    }
});
app.post('/login', async (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    try {
        const [result] = await db.query('SELECT * FROM test_table WHERE email = ?;', [email]);

        if(result.length > 0) {
            const passwordMatch = await bcrypt.compare(password, result[0].password);
            if(passwordMatch) {
                req.session.user = result[0];
                console.log(req.session.user);
                res.send(result[0]);
            }
            else {
                res.send({message: 'Wrong email/password combination.'});
            }
        }
        else {
            res.send({message: 'Wrong email/password combination.'}); // In this case, user DNE. We don't want to say that though.
        }
    } catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send({ err: err });;
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(5000, () => {
    console.log(`Server app on port 5000.`);
});
