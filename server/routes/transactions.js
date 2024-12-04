const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const saltRounds = 10;

const { db, db_options } = require('../db.js');

router.post('/create-transaction', async (req, res) => {
    const userId = req.body.userId;
    const primaryPost = req.body.primaryPost;
    const secondaryPostId = req.body.secondaryPostId;
    const isNegotiating = req.body.isNegotiating;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    let hash = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    // Loop to generate characters for the specified length
    for (let i = 0; i < 16; i++) {
        const randomInd = Math.floor(Math.random() * characters.length);
        hash += characters.charAt(randomInd);
    }

    try {
        const [result] = await db.query('INSERT INTO transaction (primary_post_id, secondary_post_id, hash_code, proposing_post_id, proposing_primary_request_amt, proposing_primary_offer_amt, primary_approved) VALUES (?, ?, ?, ?, ?, ?, ?)', [primaryPost.post_id, secondaryPostId, hash, primaryPost.post_id, primaryPost.requestingAmount, primaryPost.offeringAmount, isNegotiating ? 1 : 0]);

        if (result) {
            const [result2] = await db.query('UPDATE post SET is_matched = true WHERE post_id = ? OR post_id = ?', [primaryPost.post_id, secondaryPostId]);
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

router.post('/get-all-transactions', async (req, res) => {
    const userId = req.body.userId;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    try {
        const [result] = await db.query('SELECT * FROM transaction');

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
            OR secondary_post_id IN (SELECT post_id FROM related_posts)
        ORDER BY state, created_at;
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

router.post('/approve-transaction', async (req, res) => {
    const userId = req.body.userId;
    const transactionId = req.body.transactionId;
    const isPrimary = req.body.isPrimary;
    const primaryFee = req.body.primaryFee;
    const secondaryFee = req.body.secondaryFee;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    const column = isPrimary ? 'primary_approved' : 'secondary_approved';

    try {
        const [result] = await db.query(`UPDATE transaction SET ${column} = 1 WHERE transaction_id = ?`, [transactionId]);

        if (result) {
            const [checkStatusResponse] = await db.query(`SELECT primary_approved, secondary_approved FROM transaction WHERE transaction_id = ?`, [transactionId]);
            if(checkStatusResponse[0].primary_approved > 0 && checkStatusResponse[0].secondary_approved > 0) {
                const updateInventoriesQuery = `
                    UPDATE user_item
                    JOIN transaction t ON t.transaction_id = ?
                    JOIN post p1 ON t.primary_post_id = p1.post_id
                    JOIN post p2 ON t.secondary_post_id = p2.post_id
                    SET 
                        user_item.item_amount = CASE
                            WHEN user_item.user_id = p1.user_id_giving AND user_item.item_id = p1.offering_item_id THEN user_item.item_amount - (p1.offering_amount + ?)
                            WHEN user_item.user_id = p2.user_id_giving AND user_item.item_id = p2.offering_item_id THEN user_item.item_amount - (p2.offering_amount + ?)
                            ELSE user_item.item_amount
                        END
                    WHERE 
                        (user_item.user_id = p1.user_id_giving AND user_item.item_id = p1.offering_item_id) OR
                        (user_item.user_id = p2.user_id_receiving AND user_item.item_id = p1.offering_item_id) OR
                        (user_item.user_id = p2.user_id_giving AND user_item.item_id = p2.offering_item_id) OR
                        (user_item.user_id = p1.user_id_receiving AND user_item.item_id = p2.offering_item_id);
                `;
                const [updateInventoriesResult] = await db.query(updateInventoriesQuery, [transactionId, primaryFee, secondaryFee]);
                if(!updateInventoriesResult) return res.send({status: false, message: 'Failed at inventory move step 1.'});

                const correctionQuery = 'DELETE FROM user_item WHERE item_amount <= 0;';
                const [correctionResult] = await db.query(correctionQuery);
                if(!correctionResult) return res.send({status: false, message: 'Failed at inventory move step 2.'});

                const insertionQuery = `
                    INSERT INTO item_transit (receiving_user_id, received_item_id, receiving_amount, associated_transaction_id)
                    SELECT 
                        p2.user_id_receiving, p1.offering_item_id, p1.offering_amount, t.transaction_id
                    FROM 
                        transaction t
                    JOIN 
                        post p1 ON t.primary_post_id = p1.post_id
                    JOIN 
                        post p2 ON t.secondary_post_id = p2.post_id
                    WHERE 
                        t.transaction_id = ?
                    UNION ALL
                    SELECT 
                        p1.user_id_receiving, p2.offering_item_id, p2.offering_amount, t.transaction_id
                    FROM 
                        transaction t
                    JOIN 
                        post p1 ON t.primary_post_id = p1.post_id
                    JOIN 
                        post p2 ON t.secondary_post_id = p2.post_id
                    WHERE 
                        t.transaction_id = ?;
                `;
                const [insertionResult] = await db.query(insertionQuery, [transactionId, transactionId]);
                if(!insertionResult) return res.send({status: false, message: 'Failed at inventory move step 3.'});

                const updateTransactionQuery = `UPDATE transaction SET state = 1, primary_approved = 0, secondary_approved = 0 WHERE transaction_id = ?`;
                const [updateTransactionResult] = await db.query(updateTransactionQuery, [transactionId]);
                if(!updateTransactionResult) return res.send({status: false, message: 'Failed to update transaction state.'});
            }
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

router.post('/confirm-hash', async (req, res) => {
    const userId = req.body.userId;
    const transactionId = req.body.transactionId;
    const isPrimary = req.body.isPrimary;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    const column = isPrimary ? 'primary_approved' : 'secondary_approved';

    try {
        const [result] = await db.query(`UPDATE transaction SET ${column} = 1 WHERE transaction_id = ?`, [transactionId]);

        if (result) {
            const [checkStatusResponse] = await db.query(`SELECT primary_approved, secondary_approved FROM transaction WHERE transaction_id = ?`, [transactionId]);
            if(checkStatusResponse[0].primary_approved > 0 && checkStatusResponse[0].secondary_approved > 0) {
                // move items from transit to proper inventories
                const moveItemsQuery = `
                    INSERT INTO user_item (user_id, item_id, item_amount)
                    SELECT 
                        it.receiving_user_id, 
                        it.received_item_id, 
                        it.receiving_amount
                    FROM 
                        item_transit it
                    WHERE 
                        it.associated_transaction_id = ?
                    ON DUPLICATE KEY UPDATE 
                        item_amount = item_amount + VALUES(item_amount)
                `;
                const [moveItemsResult] = await db.query(moveItemsQuery, [transactionId]);
                if(!moveItemsResult) return res.send({status: false, message: 'Failed to move items.'});

                // delete the items from transit
                const deleteTransitQuery = `DELETE FROM item_transit WHERE associated_transaction_id = ?`;
                const [deleteTransitResult] = await db.query(deleteTransitQuery, [transactionId]);
                if(!deleteTransitResult) return res.send({status: false, message: 'Failed to delete items from transit.'});

                // update transaction state to 2, meaning it's completed
                const updateTransactionQuery = `UPDATE transaction SET state = 2 WHERE transaction_id = ?`;
                const [updateTransactionResult] = await db.query(updateTransactionQuery, [transactionId]);
                if(!updateTransactionResult) return res.send({status: false, message: 'Failed to update transaction state.'});
            }
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
    const isPrimary = req.body.isPrimary;

    // This is a security measure to ensure that the user ID in the session matches the user ID in the request.
    // Basically makes it so you can't just get the user's info by knowing their user ID.
    if(req.session.userId !== userId) return res.status(401).send({message: 'User ID does not match session ID.'});

    const approvalColumn = isPrimary ? 'primary_approved' : 'secondary_approved';
    const otherApprovalColumn = !isPrimary ? 'primary_approved' : 'secondary_approved';

    try {
        const [result] = await db.query(`UPDATE transaction SET proposing_post_id = ?, proposing_primary_request_amt = ?, proposing_primary_offer_amt = ? WHERE transaction_id = ?`, [proposingPostId, proposingRequestAmount, proposingOfferAmount, transactionId]);

        if (result) {
            // When a proposal is made, the approvals for both parties should be reset.
            const [updatingApprovalsResult] = await db.query(`UPDATE transaction SET ${approvalColumn} = 1, ${otherApprovalColumn} = 0 WHERE transaction_id = ?`, [transactionId]);
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