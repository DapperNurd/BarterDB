const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const saltRounds = 10;

const { db, db_options } = require('../db.js');

router.post('/set-user-info', async (req, res) => {
    const userId = req.body.userId;
    const email = req.body.email;
    const phone = req.body.phone;
    const address = req.body.address;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    try {
        const [result] = await db.query('UPDATE user SET email = ?, phone_number = ?, address = ? WHERE user_id = ?;', [email, phone, address, userId]);

        if (result) {
            const [result] = await db.query('SELECT * FROM user WHERE user_id = ?;', [userId]);
            if(result.length > 0) {
                return res.send({user: result[0]});
            }
            else {
                return res.send({message: 'Failed to get updated user info.'});
            }
        }
        else {
            return res.send({message: 'Failed to update user info.'});
        }
    }
    catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send({ err: err });
    }
});

router.post('/compare-password', async (req, res) => {
    const userId = req.body.userId;
    const password = req.body.password;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    try {
        const [result] = await db.query('SELECT * FROM user WHERE user_id = ?;', [userId]);

        if (result.length > 0) {
            const passwordMatch = await bcrypt.compare(password, result[0].password);
            if(passwordMatch) {
                return res.send({status: true, userId: result[0].user_id});
            }
            else {
                return res.send({status: false, message: 'Password does not match.'});
            }
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

router.post('/change-user-password', async (req, res) => {
    const userId = req.body.userId;
    const password = req.body.password;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) console.log(err);

        try {
            const [result] = await db.query('UPDATE user SET password = ? WHERE user_id = ?;', [hash, userId]);

            if (result) {
                return res.send({userId: userId});
            }
            else {
                return res.send({message: 'Failed to update password.'});
            }
        }
        catch (err) {
            console.error("Error occurred:", err);
            return res.status(500).send({ err: err });
        }
    });
});

router.post('/check-user-exists', async (req, res) => {
    const userId = req.body.userId;
    const email = req.body.email;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    try {
        const [result] = await db.query('SELECT user_id, email FROM user WHERE email = ?;', [email]);

        if (result.length > 0) {
            return res.send({status: true, user: result[0]});
        }
        else {
            res.send({status: false, message: 'User with associated email does not exist.'});
        }
    }
    catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send({ err: err });
    }
});

router.post('/get-user', async (req, res) => {
    const userId = req.body.userId;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    try {
        const [result] = await db.query('SELECT * FROM user WHERE user_id = ?;', [userId]);

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

router.post('/delete-user', async (req, res) => {
    const userId = req.body.userId;
    const targetUserId = req.body.targetUserId;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    try {
        const [result] = await db.query('DELETE FROM user WHERE user_id = ?;', [targetUserId]);

        if (result) {
            return res.send({status: true});
        }
        else {
            return res.send({status: false, message: 'Failed to delete user.'});
        }
    }
    catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send({ err: err });
    }
});

router.post('/register', async (req, res) => {
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

router.get('/logout', (req, res) => {
    if (req.session.userId) {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).send({ message: 'Failed to log out.' });
            }
            res.clearCookie('user');
            req.session = null;
            return res.send({ message: 'Logged out successfully.' });
        });
    } else {
        return res.status(400).send({ message: 'No user to log out.' });
    }
});

router.get('/login', (req, res) => {
    if(req.session.userId) {
        res.send({loggedIn: true, userId: req.session.userId});
    }
    else {
        res.send({loggedIn: false});
    }
});

router.post('/login', async (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    try {
        const [result] = await db.query('SELECT * FROM user WHERE email = ?;', [email]);

        if(result.length > 0) {
            const passwordMatch = await bcrypt.compare(password, result[0].password);
            if(passwordMatch) {
                req.session.userId = result[0].user_id;
                req.session.save();
                return res.send({userId: result[0].user_id, access_level: result[0].access_level});
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

router.post('/get-all-verified-users', async (req, res) => {
    const userId = req.body.userId;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    try {
        const [result] = await db.query('SELECT user_id, email, access_level, created_at FROM user WHERE access_level <> 0', [userId]);

        if (result.length > 0) {
            return res.send({users: result});
        }
        else {
            res.send({message: 'No users found.'});
        }
    }
    catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send({ err: err });
    }
});

router.post('/get-all-unverified-users', async (req, res) => {
    const userId = req.body.userId;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    try {
        const [result] = await db.query('SELECT user_id, email, access_level, created_at FROM user WHERE access_level = 0', [userId]);
        return res.send({users: result});
    }
    catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send({ err: err });
    }
});

router.post('/set-access-level', async (req, res) => {
    const userId = req.body.userId;
    const targetUserId = req.body.targetUserId;
    const level = req.body.level;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    try {
        const [result] = await db.query('UPDATE user SET access_level = ? WHERE user_id = ?;', [level, targetUserId]);

        if (result) {
            return res.send({status: true, user: result[0]});
        }
        else {
            res.send({status: false, message: 'Error changing access level of user.'});
        }
    }
    catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send({ err: err });
    }
});

module.exports = router;