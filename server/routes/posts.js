const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const saltRounds = 10;

const { db, db_options } = require('../db.js');

router.post('/get-posts', async (req, res) => {
    const userId = req.body.userId;

    try { // This gets all posts associated with the userId, and also gets the item names associating with the post item id's (just so we don't have to query again later)
        const [result] = await db.query(`SELECT p.*, 
                                            i1.name AS requesting_item_name, 
                                            i2.name AS offering_item_name
                                        FROM post p
                                        JOIN item i1 ON p.requesting_item_id = i1.item_id
                                        JOIN item i2 ON p.offering_item_id = i2.item_id
                                        WHERE p.posting_partnership_id IN 
                                            (SELECT partnership_id 
                                            FROM partnership 
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

router.post('/create-post', async (req, res) => {
    const userId = req.body.userId;
    const postingPartnershipId = req.body.postingPartnershipId;
    const requestingItemId = req.body.requestingItemId;
    const requestingItemAmt = req.body.requestingItemAmt;
    const offeringItemId = req.body.offeringItemId;
    const offeringItemAmt = req.body.offeringItemAmt;
    const isNegotiable = req.body.isNegotiable;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    try {
        const [result] = await db.query(`INSERT INTO post 
                                        (posting_partnership_id, 
                                         requesting_item_id, 
                                         requesting_amount, 
                                         offering_item_id, 
                                         offering_amount, 
                                         is_negotiable) 
                                        VALUES 
                                        (?, ?, ?, ?, ?, ?)`, [postingPartnershipId, requestingItemId, requestingItemAmt, offeringItemId, offeringItemAmt, isNegotiable]);

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

router.get('/get-items', async (req, res) => {
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

module.exports = router;