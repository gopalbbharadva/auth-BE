
// const client = require('./db')
import client from './db'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Request, Response } from 'express'
import { QueryResult } from 'pg'

interface User {
    id: string,
    uname: string,
    email: string
}

interface SigninUserBody {
    username: string,
    password: string;
}

interface JsonResponse<T> {
    users?: T[],
    message?: string,
}

type ApiResponse<T> = Response<JsonResponse<T>>

interface UserType {
    id: string,
    uname: string,
    email: string
}

interface SignedInUserType extends UserType {
    password: string
}

const getUsers: (req: Request, res: ApiResponse<User>) => void = async (_, res) => {
    try {
        const response: QueryResult<UserType> = await client.query('select id,uname,email from users;')
        return res.json({ users: response.rows, message: '' })
    } catch (error) {
        return res.status(500).send({ message: 'something went wrong' })
    }
}

const signIn: (req: Request<{}, {}, SigninUserBody>, res: Response) => void = async (req, res) => {
    const { username, password } = req.body

    const findUserQuery = `select * from users where uname=$1`
    try {
        const user: QueryResult<SignedInUserType> = await client.query(findUserQuery, [username])
        const isValidUsername = !!user.rowCount

        // **  Case 1 handled
        if (!isValidUsername) {
            return res.status(401).send({ message: 'Username or password incorrect' })
        }
        else {
            const storedPassword = user.rows[0].password
            const token = jwt.sign(user.rows[0], process.env.SECRET_KEY ? process.env.SECRET_KEY : '', { expiresIn: '1m' })
            const isPasswordMatched = await bcrypt.compare(password, storedPassword)
            if (isPasswordMatched) {
                return res.status(200).send({ message: 'user successfully logged in', token })
            }
            // **  Case 2 handled
            return res.status(401).send({ message: 'username or password incorrect' })
        }
    } catch (error) {
        return res.status(500).send({ message: 'Something went wrong, please try again after some time' })
    }
}


type SignupRequestBodyType = {
    username: string,
    email: string,
    password: string
}

type SignUpType = Request<{}, {}, SignupRequestBodyType>

const signUp: (req: SignUpType, res: Response) => void = async (req, res) => {
    const { username, email, password } = req.body

    const insertQuery = `insert into users(
       id, uname, email, password 
    ) values ($1, $2, $3, $4);`

    const { rows }: QueryResult<UserType> = await client.query('select * from users;')
    const isUserExist = !!rows.find(user => user.email === email)

    if (isUserExist) {
        res.status(409).send({ message: 'User already exist with this email' })
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        await client.query(insertQuery, [Date.now(), username, email, hashedPassword])
        return res.status(201).send({ message: `${username} registered successfully` })
    } catch (error) {
        res.status(500).send({ message: 'something went wrong' })
    }
}

export { signIn, signUp, getUsers }