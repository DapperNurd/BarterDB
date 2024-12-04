const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const saltRounds = 10;

const { db, db_options } = require('../db.js');

router.post('/get-partner', async (req, res) => {
    const userId = req.body.userId;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    try {
        const [result] = await db.query('SELECT * FROM partnership WHERE user1_id = ? OR user2_id = ?', [userId, userId]);

        if (result.length > 0) {
            const partnerId = result[0].user1_id === userId ? result[0].user2_id : result[0].user1_id;
            const [newResult] = await db.query('SELECT user_id, email FROM user WHERE user_id = ?;', [partnerId]);
            if(newResult.length > 0) {
                return res.send({partner: newResult[0]});
            }
            else {
                return res.send({message: 'Failed to get updated user info.'});
            }
        }
        else {
            res.send({message: 'User does not have a partnership.'});
        }
    }
    catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send({ err: err });
    }
});

router.post('/get-partnership', async (req, res) => {
    const userId = req.body.userId;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    try {
        const [result] = await db.query('SELECT * FROM partnership WHERE user1_id = ? OR user2_id = ?', [userId, userId]);

        if (result.length > 0) {
            return res.send({partner: result[0]});
        }
        else {
            res.send({message: 'User does not have a partnership.'});
        }
    }
    catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send({ err: err });
    }
});

router.post('/create-partnership', async (req, res) => {
    const user1_id = req.body.user1_id;
    const user2_id = req.body.user2_id;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== user1_id) return res.status(401).send({message: 'User ID does not match session ID.'});

    try {
        const [result] = await db.query('INSERT INTO partnership (user1_id, user2_id) VALUES (?, ?)', [user1_id, user2_id]);

        if (result) {
            const [newResult] = await db.query('SELECT user_id, email FROM user WHERE user_id = ?;', [user2_id]);
            return res.send({status: true, partner: newResult[0]});
        }
        else {
            return res.send({status: false, message: 'Failed to accept partnership.'});
        }
    }
    catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send({ err: err });
    }
});


router.post('/delete-partner', async (req, res) => {
    const userId = req.body.userId;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    try {
        const query = `
            SELECT t.*
            FROM transaction t
            JOIN post p_primary ON t.primary_post_id = p_primary.post_id
            JOIN post p_secondary ON t.secondary_post_id = p_secondary.post_id
            WHERE p_primary.user_id_giving = ?
            OR p_primary.user_id_receiving = ?
            OR p_secondary.user_id_giving = ?
            OR p_secondary.user_id_receiving = ?
        `;
        const [transactionFetchResult] = await db.query(query, [userId, userId, userId, userId]);
        transactionFetchResult.forEach(async transaction => await db.query('DELETE FROM item_transit WHERE associated_transaction_id = ?', [transaction.transaction_id]));

        transactionFetchResult.forEach(async transaction => await db.query('DELETE FROM transaction WHERE transaction_id = ?', [transaction.transaction_id]));
        
        await db.query('DELETE FROM partnership WHERE user1_id = ? OR user2_id = ?', [userId, userId]);

        const [deletePostsResult] = await db.query(`DELETE p FROM post AS p WHERE p.user_id_receiving = ? OR p.user_id_giving = ?`, [userId, userId]);

        db.query('DELETE FROM partnership WHERE user1_id = ? OR user2_id = ?', [userId, userId]);

        if (deletePostsResult) {
            return res.send({status: true});
        }
        else {
            return res.send({status: false, message: 'Failed to delete partnership.'});
        }
    }
    catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send({ err: err });
    }
});

module.exports = router;