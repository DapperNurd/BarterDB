const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const saltRounds = 10;

const { db, db_options } = require('../db.js');

router.post('/check-request-exists', async (req, res) => {
    const userId = req.body.userId;
    const requestedUserId = req.body.requestedUserId;

    try {
        const [result] = await db.query('SELECT * FROM partnership_request WHERE requesting_user_id = ? AND requested_user_id = ?', [userId, requestedUserId]);

        if (result.length > 0) {
            return res.send({status: true});
        }
        else {
            return res.send({status: false, message: 'Partnership request does not exist.'});
        }
    }
    catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send({ err: err });
    }
});

router.post('/create-request', async (req, res) => {
    const userId = req.body.userId;
    const requestedUserId = req.body.requestedUserId;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    try {
        const [result] = await db.query('INSERT INTO partnership_request (requesting_user_id, requested_user_id) VALUES (?, ?)', [userId, requestedUserId]);

        if (result) {
            return res.send({status: true});
        }
        else {
            return res.send({status: false, message: 'Failed to create request.'});
        }
    }
    catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send({ err: err });
    }
});

router.post('/delete-request', async (req, res) => {
    const requestingUserId = req.body.requestingUserId;
    const requestedUserId = req.body.requestedUserId;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== requestingUserId && req.session.userId !== requestedUserId) return res.status(401).send({message: 'User ID does not match session ID.'});

    try {
        const [result] = await db.query('DELETE FROM partnership_request WHERE requesting_user_id = ? AND requested_user_id = ?', [requestingUserId, requestedUserId]);

        if (result) {
            return res.send({status: true});
        }
        else {
            return res.send({status: false, message: 'Failed to delete request.'});
        }
    }
    catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send({ err: err });
    }
});

router.post('/get-incoming-requests', async (req, res) => {
    const userId = req.body.userId;

    try { // This gets all posts associated with the userId, and also gets the item names associating with the post item id's (just so we don't have to query again later)
        const [result] = await db.query(`SELECT 
                                            pr.*, 
                                            ru.email AS requesting_user_email, 
                                            su.email AS requested_user_email
                                        FROM 
                                            partnership_request pr
                                        JOIN 
                                            user AS ru ON pr.requesting_user_id = ru.user_id
                                        JOIN 
                                            user AS su ON pr.requested_user_id = su.user_id
                                        WHERE 
                                            pr.requested_user_id = ?`, [userId]);

        if (result.length > 0) {
            return res.send({incoming: result});
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

router.post('/get-outgoing-requests', async (req, res) => {
    const userId = req.body.userId;

    try {
        const [result] = await db.query(`SELECT 
                                            pr.*, 
                                            ru.email AS requesting_user_email, 
                                            su.email AS requested_user_email
                                        FROM 
                                            partnership_request pr
                                        JOIN 
                                            user AS ru ON pr.requesting_user_id = ru.user_id
                                        JOIN 
                                            user AS su ON pr.requested_user_id = su.user_id
                                        WHERE 
                                            pr.requesting_user_id = ?`, [userId]);

        if (result.length > 0) {
            return res.send({outgoing: result});
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

router.post('/clear-all-outgoing-requests', async (req, res) => {
    const userId = req.body.userDeleting;
    const clearingUserId = req.body.deletingFor;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    try {
        const [result] = await db.query('DELETE FROM partnership_request WHERE requesting_user_id = ?', [clearingUserId]);

        if (result) {
            return res.send({status: true});
        }
        else {
            return res.send({status: false, message: 'Failed to clear requests.'});
        }
    }
    catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send({ err: err });
    }
});

module.exports = router;