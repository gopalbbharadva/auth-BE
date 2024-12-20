
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config();
const { signIn, signUp, getUsers } = require('./routes')

const app = express()

app.use(bodyParser.text())
app.use(bodyParser.json())
app.use(cors());

app.use((req, res, next) => {
    const authToken = req.headers.authorization;
    console.log(authToken, 'authToken')
    if (!authToken) {
        res.status(403).send(
            { message: 'Auth token required to access this route' })
        return;
    }
    next();
})


// app.use((req, res, next) => {
//     next();
// })

app.get('/users', getUsers)

// Error handling in login 
// case 1: user name and password both required
// case 2: username or password didn't matched

app.post('/sign-in', signIn)

app.post('/sign-up', signUp)

app.listen('3490', () => console.log('server is connected'))