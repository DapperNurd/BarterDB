const express = require('express');
const router = express.Router();

const db = require('../db.js');

router.get('/', async (req, res) => {
    const [rows] = await db.query("SELECT * FROM user");
    res.json(rows);
});

router.post('/', (req, res) => {
    console.log(req.body);
    res.json('test');
});

module.exports = router;