import * as mysql from 'mysql2/promise';

export const pool = mysql.createPool({
    "host": process.env.MYSQL_HOST,
    "user": process.env.MYSQL_USER,
    "password": process.env.MYSQL_PASSWORD,
    "database": process.env.MYSQL_DATABASE,
    "connectionLimit": 30
});


export default pool;