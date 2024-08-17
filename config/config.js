require("dotenv").config();

const config = {
    PORT: process.env.PORT,
    DATABASE: process.env.DATABASE_URL,
    JWT_AUTH_TOKEN: process.env.JWT_AUTH_TOKEN,
    SALT_ROUND: Number(process.env.SALT_ROUND),
    PIN_MIN_LENGTH: process.env.PIN_MIN_LENGTH,
    PIN_MAX_LENGTH: process.env.PIN_MAX_LENGTH,
    DB_HOST: process.env.DB_HOST,
    DB_DATABASE: process.env.DB_DATABASE,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
};

module.exports = config;
