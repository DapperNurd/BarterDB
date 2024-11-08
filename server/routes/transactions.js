const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const saltRounds = 10;

const { db, db_options } = require('../db.js');

router.post('/create-transaction', async (req, res) => {
    const userId = req.body.userId;
    const post1 = req.body.post1;
    const post2 = req.body.post2;
    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    try {
        const [result] = await db.query('INSERT INTO transaction (post1_id, post2_id, hash_code)VALUES(?, ?, 0000000000000000)', [post1, post2]);

        if (result) {
            const [result2] = await db.query('UPDATE post SET is_matched = true WHERE post_id = ? OR post_id = ?', [post1, post2]);
            return res.send({status: true});
        }
        else {
            return res.send({status: false, message: 'Failed to create transaction.'});
        }
    }
    catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send({ err: err });
    }
});

module.exports = router;