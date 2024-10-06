require('dotenv/config');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');

const saltRounds = 10;

const db = require('./db.js');

const app = express();

app.use(express.json());
app.use(cors());

app.post('/register', async (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.log(err);
        }

        db.query(
            'INSERT INTO test_table (email, password) VALUES (?, ?)', 
            [email, hash], 
            (err, result) => {
                if(err) res.send({err: err});
        
                if(result) res.send(result); 
                else res.send({message: 'Failed to insert data.'});
            }
        );
    });
});

app.post('/login', async (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    db.query(
        'SELECT * FROM test_table WHERE email = ?;', 
        [email], 
        (err, result) => {
            if(err) res.send({err: err});
    
            if(result.length > 0) {
                bcrypt.compare(password, result[0].password, (error, response) => {
                    if(response) {
                        res.send(result);
                    }
                    else {
                        res.send({message: 'Wrong email/password combination.'});
                    }
                });
            }
            else {
                res.send({message: 'Wrong email/password combination.'}); // In this case, user DNE. We don't want to say that though.
            }
        }
    );
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(5000, () => {
    console.log(`Server app on port 5000.`);
});
