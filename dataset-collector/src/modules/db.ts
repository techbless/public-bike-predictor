import * as mysql from 'mysql';

const pool = mysql.createPool({
    "host": process.env.MYSQL_HOST,
    "user": process.env.MYSQL_USER,
    "password": process.env.MYSQL_PASSWORD,
    "database": process.env.MYSQL_DATABASE,
    "connectionLimit": 30
});

export function getConnection() : Promise<mysql.PoolConnection>{
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, conn) {
            if(err) {
                reject(err);
            }
            else {
                resolve(conn);
            }
          });
    });
}

export default getConnection;