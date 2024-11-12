const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const saltRounds = 10;

const { db, db_options } = require('../db.js');

router.get('/get-items', async (req, res) => {
    try { // This gets all posts associated with the userId, and also gets the item names associating with the post item id's (just so we don't have to query again later)
        const [result] = await db.query('SELECT * FROM item');

        if (result) {
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

router.post('/create-item', async (req, res) => {
    const userId = req.body.userId;
    const name = req.body.name;
    const value = req.body.value;
    const transfer_cost = req.body.transfer_cost;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    try {
        const [result] = await db.query('INSERT INTO item (name, value, transfer_cost) VALUES (?, ?, ?)', [name, value, transfer_cost]);

        if (result) {
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

router.post('/update-item', async (req, res) => {
    const userId = req.body.userId;
    const column = req.body.column;
    const newValue = req.body.newValue;
    const itemId = req.body.itemId;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    try {
        const [result] = await db.query(`UPDATE item SET ${column} = ? WHERE item_id = ?`, [newValue, itemId]);

        if (result) {
            return res.send({status: true});
        }
        else {
            return res.send({status: false, message: 'Failed to update item.'});
        }
    }
    catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send({ err: err });
    }
});

router.post('/delete-item', async (req, res) => {
    const userId = req.body.userId;
    const itemId = req.body.itemId;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    try {
        let deleteResult = null;
        deleteResult = await db.query('DELETE FROM user_item WHERE item_id = ?', [itemId, itemId]);
        deleteResult = await db.query('DELETE FROM item_transit WHERE received_item_id = ?', [itemId, itemId]);
        deleteResult = await db.query('DELETE FROM post WHERE requesting_item_id = ? OR offering_item_id = ?', [itemId, itemId]);
        const [result] = await db.query('DELETE FROM item WHERE item_id = ?', [itemId]);

        if (result) {
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

router.post('/get-inventory', async (req, res) => {
    const userId = req.body.userId;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    try { // This gets all posts associated with the userId, and also gets the item names associating with the post item id's (just so we don't have to query again later)
        const [result] = await db.query('SELECT user_item.*, item.name FROM user_item JOIN item ON user_item.item_id = item.item_id WHERE user_item.user_id = ?;', [userId]);

        if (result) {
            return res.send({items: result});
        }
        else {
            res.send({message: 'Error getting inventory.'});
        }
    }
    catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send({ err: err });
    }
});

router.post('/get-partner-inventory', async (req, res) => {
    let userId = req.body.userId;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    try { // This gets all posts associated with the userId, and also gets the item names associating with the post item id's (just so we don't have to query again later)
        const [partnerIdResult] = await db.query(`SELECT 
                                                    CASE 
                                                        WHEN user1_id = ? THEN user2_id
                                                        WHEN user2_id = ? THEN user1_id
                                                    END AS partner_id
                                                FROM partnership
                                                WHERE ? IN (user1_id, user2_id);`, [userId, userId, userId]);
        if(!partnerIdResult) return res.send({message: 'No partner found.'});
        userId = partnerIdResult[0].partner_id;

        const [result] = await db.query('SELECT user_item.*, item.name FROM user_item JOIN item ON user_item.item_id = item.item_id WHERE user_item.user_id = ?;', [userId]);

        if (result) {
            return res.send({items: result});
        }
        else {
            res.send({message: 'Error getting inventory.'});
        }
    }
    catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send({ err: err });
    }
});

router.post('/add-to-inventory', async (req, res) => {
    const userId = req.body.userId;
    const itemId = req.body.itemId;
    const amount = req.body.amount;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    try { // This gets all posts associated with the userId, and also gets the item names associating with the post item id's (just so we don't have to query again later)
        const [result] = await db.query('INSERT INTO user_item (user_id, item_id, item_amount) VALUES (?, ?, ?)', [userId, itemId, amount]);

        if (result) {
            return res.send({status: true, items: result});
        }
        else {
            res.send({status: false, message: 'Error adding item.'});
        }
    }
    catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send({ err: err });
    }
});

router.post('/update-inventory', async (req, res) => {
    const userId = req.body.userId;
    const itemId = req.body.itemId;
    const amount = req.body.amount;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    try { // This gets all posts associated with the userId, and also gets the item names associating with the post item id's (just so we don't have to query again later)
        const [result] = await db.query('UPDATE user_item SET item_amount = ? WHERE user_id = ? AND item_id = ?', [amount, userId, itemId]);

        if (result) {
            return res.send({status: true, items: result});
        }
        else {
            res.send({status: false, message: 'Error adding item.'});
        }
    }
    catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send({ err: err });
    }
});

router.post('/delete-from-inventory', async (req, res) => {
    const userId = req.body.userId;
    const itemId = req.body.itemId;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    try { // This gets all posts associated with the userId, and also gets the item names associating with the post item id's (just so we don't have to query again later)
        const [result] = await db.query('DELETE FROM user_item WHERE user_id = ? AND item_id = ?', [userId, itemId]);

        if (result) {
            return res.send({status: true, items: result});
        }
        else {
            res.send({status: false, message: 'Error deleting item.'});
        }
    }
    catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send({ err: err });
    }
});

module.exports = router;