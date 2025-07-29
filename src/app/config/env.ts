import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
    PORT: string,
    DB_URL: string,
    NODE_ENV: "development" | "production",
    JWT_SECRET: string,
    JWT_EXPIRATION: string,
    JWT_REFRESH_SECRET: string,
    JWT_REFRESH_EXPIRATION: string,
    BCRYPT_SALT_ROUNDS: string,
    SUPER_ADMIN_EMAIL: string,
    SUPER_ADMIN_PASSWORD: string
}

const leadEnvVariables = (): EnvConfig => {
    const requiredVariables = ['PORT', 'DB_URL', 'NODE_ENV', 'JWT_SECRET', 'JWT_EXPIRATION', 'JWT_REFRESH_SECRET', 'JWT_REFRESH_EXPIRATION', 'BCRYPT_SALT_ROUNDS', 'SUPER_ADMIN_EMAIL', 'SUPER_ADMIN_PASSWORD'];
    requiredVariables.forEach((variable) => {
        if (!process.env[variable]) {
            throw new Error(`Environment variable ${variable} is not defined`);
        }
    });

    return {
        PORT: process.env.PORT as string,
        DB_URL: process.env.DB_URL as string,
        NODE_ENV: process.env.NODE_ENV as "development" | "production",
        JWT_SECRET: process.env.JWT_SECRET as string,
        JWT_EXPIRATION: process.env.JWT_EXPIRATION as string,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
        JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION as string,
        BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS as string,
        SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL as string,
        SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD as string
    };
}


export const envVars = leadEnvVariables();