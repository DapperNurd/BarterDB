require('dotenv/config');

const express = require('express');
const cors = require('cors');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const bcrypt = require('bcrypt');
const saltRounds = 10;

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

app.post('/api/getuser', async (req, res) => {
    const userId = req.body.userId;

    try {
        const [result] = await db.query('SELECT user_id, email, access_level FROM user WHERE user_id = ?;', [userId]);

        if (result.length > 0) {
            return res.send({user: result[0]});
        }
        else {
            res.send({message: 'User with associated ID does not exist.'});
        }
    }
    catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send({ err: err });
    }
});

app.post('/api/getposts', async (req, res) => {
    const userId = req.body.userId;

    try { // This gets all posts associated with the userId, and also gets the item names associating with the post item id's (just so we don't have to query again later)
        const [result] = await db.query(`SELECT p.*, 
                                            i1.name AS requesting_item_name, 
                                            i2.name AS offering_item_name
                                        FROM barterdb.post p
                                        JOIN barterdb.item i1 ON p.requesting_item_id = i1.item_id
                                        JOIN barterdb.item i2 ON p.offering_item_id = i2.item_id
                                        WHERE p.posting_partnership_id IN 
                                            (SELECT partnership_id 
                                            FROM barterdb.partnership 
                                            WHERE user1_id = ? OR user2_id = ?);
                                        `, [userId, userId]);

        if (result.length > 0) {
            return res.send({posts: result});
        }
        else {
            res.send({message: 'User does not have any posts.'});
        }
    }
    catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send({ err: err });
    }
});

app.get('/api/getitems', async (req, res) => {
    const userId = req.body.userId;

    try { // This gets all posts associated with the userId, and also gets the item names associating with the post item id's (just so we don't have to query again later)
        const [result] = await db.query('SELECT * FROM item');

        if (result.length > 0) {
            return res.send({items: result});
        }
        else {
            res.send({message: 'No items found.'});
        }
    }
    catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send({ err: err });
    }
});

app.post('/api/register', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const [result] = await db.query('SELECT * FROM user WHERE email = ?;', [email]);

        if (result.length > 0) {
            return res.send({message: 'Email already exists.'});
        }

        bcrypt.hash(password, saltRounds, async (err, hash) => {
            if (err) console.log(err);
    
            const [result] = await db.query('INSERT INTO user (email, password) VALUES (?, ?)', [email, hash]);
            
            if(result) res.send(result); 
            else res.send({message: 'Failed to insert data.'});
        });
    }
    catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send({ err: err });
    }
});

app.get('/api/logout', (req, res) => {
    if (req.session.userId) {
        req.session.destroy(err => {
            if (err) {
                console.log("1");
                return res.status(500).send({ message: 'Failed to log out.' });
            }
            console.log("2");
            res.clearCookie('user');
            req.session = null;
            return res.send({ message: 'Logged out successfully.' });
        });
    } else {
        console.log("3");
        return res.status(400).send({ message: 'No user to log out.' });
    }
});

app.get('/api/login', (req, res) => {
    if(req.session.userId) {
        res.send({loggedIn: true, userId: req.session.userId});
    }
    else {
        res.send({loggedIn: false});
    }
});
app.post('/api/login', async (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    try {
        const [result] = await db.query('SELECT * FROM user WHERE email = ?;', [email]);

        if(result.length > 0) {
            const passwordMatch = await bcrypt.compare(password, result[0].password);
            if(passwordMatch) {
                req.session.userId = result[0].user_id;
                req.session.save();
                return res.send({userId: result[0].user_id});
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
