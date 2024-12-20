
const client = require('./db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


const getUsers = async (req, res) => {
    const authToken = req.headers.authorization;
    // console.log(req, 'req**')
    console.log(authToken, 'authToken')


    try {
        const response = await client.query('select * from users;')
        return res.json({ users: response.rows })
    } catch (error) {
        res.status(500).send({ message: 'something went wrong' })
    }
}

const signIn = async (req, res) => {
    const { username, password } = req.body
    console.log(username, 'username')
    const findUserQuery = `select * from users where uname=$1`
    try {
        const user = await client.query(findUserQuery, [username])
        console.log(user, 'user')
        const isValidUsername = !!user.rowCount
        console.log(isValidUsername, 'isValid username')
        // Case 1 handled
        if (!isValidUsername) {
            res.status(401).send({ message: 'Username or password incorrect' })
            return;
        }
        else {
            const storedPassword = user.rows[0].password
            const token = jwt.sign(user.rows[0], process.env.SECRET_KEY, { expiresIn: '1m' })
            const isPasswordMatched = await bcrypt.compare(password, storedPassword)
            if (isPasswordMatched) {
                res.status(200).send({ message: 'user successfully logged in', token })
                return;
            }
            // Case 2 handled
            res.status(401).send({ message: 'username or password incorrect' })
        }
    } catch (error) {
        res.status(500).send({ message: 'Something went wrong, please try again after some time' })
    }
}

const signUp = async (req, res) => {
    const { username, email, password } = req.body

    const insertQuery = `insert into users(
       id, uname, email, password 
    ) values ($1, $2, $3, $4);`

    const { rows } = await client.query('select * from users;')
    console.log(rows, 'rows')
    const isUserExist = !!rows.find(user => user.email === email)

    if (isUserExist) {
        res.status(409).send({ message: 'user already exist with this email' })
        return;
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        await client.query(insertQuery, [Date.now(), username, email, hashedPassword])
        res.status(201).send({ message: `${username} registered successfully` })
    } catch (error) {
        res.status(500).send({ message: 'something went wrong' })
    }
}

module.exports = { signIn, signUp, getUsers }