const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const User = require('../src/models/user');

const userOneId = new mongoose.Types.ObjectId();

const userOne = {
    _id: userOneId,
    name: 'User One',
    email: 'userone@gmail.com',
    password: 'userone@123',
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
}

beforeEach(async () => {
    await User.deleteMany();
    await User(userOne).save();
});

test('Sign up a new user', async () => {
    await request(app).post('/users').send({
        name: 'Adam',
        email: 'adam@gmail.com',
        password: 'adam@123'
    }).expect(201);
});

test('Log in an existing user', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200);
});

test('Should not login non existing user', async () => {
    await request(app).post('/users/login').send({
        email: 'asdjaskf@dakfsaf.com',
        password: 'asdasfja@w2q111w'
    }).expect(400);
});

test('Get user profile only if authenticated', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
});


test('Should not get user profile if unauthenticatd', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401);
});

test('Should delete a user account only if authenticated', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
});

test('Should not delete a user account if not authenticated', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401);
});
