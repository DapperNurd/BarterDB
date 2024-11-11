const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const saltRounds = 10;

const { db, db_options } = require('../db.js');

router.post('/get-post', async (req, res) => {
    const postId = req.body.postId;

    try { // This gets all posts associated with the userId, and also gets the item names associating with the post item id's (just so we don't have to query again later)
        const [result] = await db.query(`SELECT p.*, 
                                            i1.name AS requesting_item_name, 
                                            i2.name AS offering_item_name
                                        FROM post p
                                        JOIN item i1 ON p.requesting_item_id = i1.item_id
                                        JOIN item i2 ON p.offering_item_id = i2.item_id
                                        WHERE post_id = ?
                                        `, [postId]);

        if (result.length > 0) {
            return res.send({post: result[0]});
        }
        else {
            res.send({message: 'Post does not exist.'});
        }
    }
    catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send({ err: err });
    }
});

router.post('/get-posts', async (req, res) => {
    const userId = req.body.userId;

    try { // This gets all posts associated with the userId, and also gets the item names associating with the post item id's (just so we don't have to query again later)
        const [result] = await db.query(`SELECT p.*, 
                                        i1.name AS requesting_item_name, 
                                        i2.name AS offering_item_name
                                        FROM post p
                                        JOIN item i1 ON p.requesting_item_id = i1.item_id
                                        JOIN item i2 ON p.offering_item_id = i2.item_id
                                        WHERE posting_user_id = ?
                                        AND is_matched = ?
                                        `, [userId, false]);

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

router.post('/get-match-posts', async (req, res) => {
    const userId = req.body.userId;

    try { // This gets all posts associated with the userId, and also gets the item names associating with the post item id's (just so we don't have to query again later)
        const [result] = await db.query(`SELECT 
                                            p2.*,
                                            p1.post_id AS matching_post_id,
                                            item_offered_by_other.name AS offering_item_name,
                                            item_requested_by_other.name AS requesting_item_name
                                        FROM 
                                            post p1
                                        JOIN 
                                            post p2 
                                            ON p1.offering_item_id = p2.requesting_item_id
                                            AND p1.requesting_item_id = p2.offering_item_id
                                        JOIN 
                                            item item_offered_by_other 
                                            ON p2.offering_item_id = item_offered_by_other.item_id
                                        JOIN 
                                            item item_requested_by_other 
                                            ON p2.requesting_item_id = item_requested_by_other.item_id
                                        WHERE 
                                            p1.posting_user_id = ?
                                            AND p2.posting_user_id != ?
                                            AND p1.is_matched = FALSE
                                            AND p2.is_matched = FALSE
                                            AND (
                                                -- Condition for negotiable posts
                                                (p1.is_negotiable = TRUE AND p2.is_negotiable = TRUE)
                                                OR 
                                                -- Condition for exact matching amounts
                                                (p1.is_negotiable = FALSE 
                                                AND p2.is_negotiable = FALSE
                                                AND p1.requesting_amount = p2.offering_amount
                                                AND p2.requesting_amount = p1.offering_amount)
                                            );
                                            `, [userId, userId]);
        if (result.length > 0) {
            
            return res.send({posts: result});
        }
        else {
            res.send({message: 'User does not have any matching posts.'});
        }
    }
    catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send({ err: err });
    }
});

router.post('/create-post', async (req, res) => {
    const userId = req.body.userId;
    const requestingItemId = req.body.requestingItemId;
    const requestingItemAmt = req.body.requestingItemAmt;
    const offeringItemId = req.body.offeringItemId;
    const offeringItemAmt = req.body.offeringItemAmt;
    const receivingId = req.body.receivingId;
    const givingId = req.body.givingId;
    const isNegotiable = req.body.isNegotiable;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    try {
        const [result] = await db.query(`INSERT INTO post 
                                        (posting_user_id,
                                         requesting_item_id, 
                                         requesting_amount, 
                                         offering_item_id, 
                                         offering_amount,
                                         user_id_receiving,
                                         user_id_giving,
                                         is_negotiable) 
                                        VALUES 
                                        (?, ?, ?, ?, ?, ?, ?, ?)`, [userId, requestingItemId, requestingItemAmt, offeringItemId, offeringItemAmt, receivingId, givingId, isNegotiable]);

        if (result) {
            return res.send({status: true});
        }
        else {
            return res.send({status: false, message: 'Failed to create post.'});
        }
    }
    catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send({ err: err });
    }

});

router.post('/update-post', async (req, res) => {
    const userId = req.body.userId;
    const postId = req.body.postId;
    const requestingItemId = req.body.requestingItemId;
    const requestingItemAmt = req.body.requestingItemAmt;
    const offeringItemId = req.body.offeringItemId;
    const offeringItemAmt = req.body.offeringItemAmt;
    const isNegotiable = req.body.isNegotiable;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    try {
        const [result] = await db.query(`UPDATE post
                                        SET requesting_item_id = ?, 
                                            requesting_amount = ?, 
                                            offering_item_id = ?, 
                                            offering_amount = ?, 
                                            is_negotiable = ?
                                        WHERE post_id = ?`, [requestingItemId, requestingItemAmt, offeringItemId, offeringItemAmt, isNegotiable, postId]);
        

        if (result) {
            return res.send({status: true});
        }
        else {
            return res.send({status: false, message: 'Failed to create post.'});
        }
    }
    catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send({ err: err });
    }

});

router.post('/delete-post', async (req, res) => {
    const userId = req.body.userId;
    const postId = req.body.postId;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    try {
        const [result] = await db.query('DELETE FROM post WHERE post_id = ?;', [postId]);

        if (result) {
            return res.send({status: true});
        }
        else {
            return res.send({status: false, message: 'Failed to delete post.'});
        }
    }
    catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send({ err: err });
    }
});

router.post('/get-post-owner', async (req, res) => {
    const userId = req.body.userId;
    const postId = req.body.postId;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    const query = `
        WITH user_partners AS (
            -- Step 1: Find all partners of the given user_id
            SELECT 
                CASE 
                    WHEN user1_id = ? THEN user2_id
                    WHEN user2_id = ? THEN user1_id
                END AS partner_id
            FROM 
                partnership
            WHERE 
                ? IN (user1_id, user2_id)
        )
        -- Step 2: Check if the post's posting_user_id is either the user_id or their partner
        SELECT 
            post_id
        FROM 
            post
        WHERE 
            post_id = ? 
            AND (posting_user_id = ? OR posting_user_id IN (SELECT partner_id FROM user_partners));
    `;

    try {
        const [result] = await db.query(query, [userId, userId, userId, postId, userId]);

        if (result.length > 0) {
            return res.send({isOwner: true, post: result[0]});
        }
        else {
            return res.send({isOwner: false});
        }
    }
    catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send({ err: err });
    }
});

module.exports = router;