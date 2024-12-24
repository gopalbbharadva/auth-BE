// const { Client } = require('pg')
import { Client } from 'pg'

const client = new Client({
    user: 'gopal_pg',  // owner 
    host: 'localhost',
    database: 'auth_db',
    password: 'Gopal123',
    port: 5432,
})

const createUserTable = async () => {
    const createTableQuery = `create table if not exists users (
    id text PRIMARY KEY,
    uname text not null,
    email text not null,
    password text not null 
   );
  `
    try {
        await client.connect();
        await client.query(createTableQuery)
    } catch (error) {
        console.log(error, 'error')
    }
}

createUserTable();

export default client 
