const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const saltRounds = 10;

const { db, db_options } = require('../db.js');

router.post('/getposts', async (req, res) => {
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

router.get('/getitems', async (req, res) => {
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