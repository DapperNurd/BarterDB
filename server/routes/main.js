import express from 'express';
const router = express.Router();

// Routes
router.get('', (req, res) => {

    const locals = {
        title: "NodeJs Test",
        description: "Setting up stuff with NodeJS and Express."
    }

    res.render('index', locals);
});

router.get('/about', (req, res) => {
    res.render('about');
});

export default router;