const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const saltRounds = 10;

const { db, db_options } = require('../db.js');

router.get('/get-items', async (req, res) => {
    const userId = req.body.userId;

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
        const [deleteResult] = await db.query('DELETE FROM post WHERE requesting_item_id = ? OR offering_item_id = ?', [itemId, itemId]);
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

module.exports = router;