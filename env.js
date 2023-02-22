require('dotenv').config()
const env = process.env

module.exports = {
    database:{
        host: env.DB_HOST,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        database: env.DB_NAME
    },
    server:{
        port: env.PORT,
    },
    jwt:{
        secret: env.JWT_SECRET,
    },
    stat:{
        static_string : env.string_stat,
    }
}