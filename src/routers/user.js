const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

const router = express.Router();

const User = require('../models/user');
const auth = require('../middlewares/auth');
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account');


//Multer set up
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/))
            return cb(new Error('Please upload an image'));

        cb(null, true);
    }
});



//Get user
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
});



//Get user profile picture
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar)
            throw new Error();

        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch (error) {
        res.status(404).send();
    }
});



//Sign up user
router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});



//Login user
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }
});



//Logout user
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
        await req.user.save();
        res.send('Logout successful');
    } catch (error) {
        console.log(error);
        res.status(500).send();
    }
});



//Logout of all devices
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send('Successfully logged out of all devices');
    } catch (error) {
        console.log(error);
        res.status(500).send();
    }
});



//Upload user profile picture
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const imageBuffer = await sharp(req.file.buffer).resize({ height: 300, width: 300 }).png().toBuffer();
    req.user.avatar = imageBuffer;
    await req.user.save();
    res.send('Succesfully uloaded your avatar');
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
});



//Edit and update user profile
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation)
        return res.status(400).send({ error: 'Invalid Operation' });

    try {
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();

        // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        res.send(req.user);
    } catch (error) {
        res.status(404).send(error);
    }
});



//Delete user account
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        sendCancellationEmail(req.user.email, req.user.name);
        res.send(req.user);
    } catch (error) {
        res.status(500).send();
    }
});



//Remove user profile picture
router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined;
        await req.user.save();
        res.status(200).send();
    } catch (error) {
        res.status(400).send();
    }
});


module.exports = router;