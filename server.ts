

// const express = require('express')
import express, { Request } from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
dotenv.config();
import { signIn, signUp, getUsers } from './routes'
import cors from 'cors'


const app = express()

app.use(bodyParser.text())
app.use(bodyParser.json())
app.use(cors());

interface AuthRequest extends Request {
    headers: {
        authorization: string;
    }
}

const checkAuthToken = (req: AuthRequest, res: any, next: any) => {
    const authToken = req.headers.authorization;
    if (!authToken) {
        res.status(403).send(
            { message: 'Auth token required to access this route' })
        return;
    }
    next();
}

app.get('/users', checkAuthToken, getUsers)

// Error handling in login 
// case 1: user name and password both required
// case 2: username or password didn't matched

app.post('/sign-in', signIn)

app.post('/sign-up', signUp)

app.listen('3490', () => console.log('server is connected'))