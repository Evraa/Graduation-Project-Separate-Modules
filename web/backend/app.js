if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const { checkUser } = require('./middleware/authenticate');

const app = express();

mongoose.connect(process.env.dbURI, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true,useFindAndModify:false})
.then(result => {
    return app.listen(process.env.PORT);
}).then(() => {
    console.log("App is running");
}).catch(err => {
    console.log(err);
});

app.use(morgan('tiny'));
app.use(express.static('public'));
app.use(express.json());
app.use(passport.initialize());
app.use(express.urlencoded({extended:true}));
app.use(cors());

app.use('*', checkUser);

app.use('/api/job', require('./routes/JobRoutes'));
app.use('/api/user', require('./routes/UserRoutes'));
app.use('/api/question', require('./routes/َQuestionRoutes'));
app.use(require('./routes/ApplicationRoutes'));

app.use((req, res) => {
    res.status(404).json({msg:"The requested endpoint is not found"});
});