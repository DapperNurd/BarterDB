const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const saltRounds = 10;

const { db, db_options } = require('../db.js');

router.post('/create-transaction', async (req, res) => {
    const userId = req.body.userId;
    const primaryPost = req.body.primaryPost;
    const secondaryPost = req.body.secondaryPost;
    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    const hashCode = "0000000000000000";

    try {
        const [result] = await db.query('INSERT INTO transaction (primary_post_id, secondary_post_id, hash_code) VALUES (?, ?, ?)', [primaryPost, secondaryPost, hashCode]);

        if (result) {
            const [result2] = await db.query('UPDATE post SET is_matched = true WHERE post_id = ? OR post_id = ?', [primaryPost, secondaryPost]);
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

router.post('/get-transactions', async (req, res) => {
    const userId = req.body.userId;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    const query = `
        WITH user_partners AS (
            -- Step 1: Get all user IDs in the partnership including the given user_id
            SELECT 
                CASE 
                    WHEN user1_id = ? THEN user2_id
                    WHEN user2_id = ? THEN user1_id
                END AS partner_id
            FROM 
                partnership
            WHERE 
                ? IN (user1_id, user2_id)
        ), related_posts AS (
            -- Step 2: Get all post IDs where the posting user is the user_id or their partner
            SELECT 
                post_id
            FROM 
                post
            WHERE 
                posting_user_id = ? 
                OR posting_user_id IN (SELECT partner_id FROM user_partners)
        )
        -- Step 3: Select transactions where either primary or secondary post is in related posts
        SELECT 
            *
        FROM 
            transaction
        WHERE 
            primary_post_id IN (SELECT post_id FROM related_posts)
            OR secondary_post_id IN (SELECT post_id FROM related_posts);
    `;

    try {
        const [result] = await db.query(query, [userId, userId, userId, userId]);

        if (result) {
            return res.send({transactions: result});
        }
        else {
            return res.send({message: 'Error finding transactions.'});
        }
    }
    catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send({ err: err });
    }
});

router.post('/update-transaction-approval', async (req, res) => {
    const userId = req.body.userId;
    const transactionId = req.body.transactionId;
    const isPrimary = req.body.isPrimary;
    const approval = req.body.approval ?? 0;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    const column = isPrimary ? 'primary_approved' : 'secondary_approved';

    try {
        const [result] = await db.query(`UPDATE transaction SET ${column} = ? WHERE transaction_id = ?`, [approval, transactionId]);

        if (result) {
            const [updatingStateResult] = await db.query(`UPDATE transaction SET state = CASE WHEN primary_approved = TRUE AND secondary_approved = TRUE THEN 1 ELSE 0 END;`);
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

router.post('/make-proposal', async (req, res) => {
    const userId = req.body.userId;
    const transactionId = req.body.transactionId;
    const proposingPostId = req.body.proposingPostId;
    const proposingRequestAmount = req.body.proposingRequestAmount;
    const proposingOfferAmount = req.body.proposingOfferAmount;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    try {
        const [result] = await db.query(`UPDATE transaction SET proposing_post_id = ?, proposing_primary_request_amt = ?, proposing_primary_offer_amt = ? WHERE transaction_id = ?`, [proposingPostId, proposingRequestAmount, proposingOfferAmount, transactionId]);

        if (result) {
            const [updatingStateResult] = await db.query(`UPDATE transaction SET state = CASE WHEN primary_approved = TRUE AND secondary_approved = TRUE THEN 1 ELSE 0 END;`);
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