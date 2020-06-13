const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL,
    {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })
    .then(result => console.log('Database connected! '))
    .catch(error => console.log('Something went wrong while connecting to database...', error));
