import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
    PORT: string,
    DB_URL: string,
    NODE_ENV: "development" | "production"
}

const leadEnvVariables = (): EnvConfig => {
    const requiredVariables = ['PORT', 'DB_URL', 'NODE_ENV'];
    requiredVariables.forEach((variable) => {
        if (!process.env[variable]) {
            throw new Error(`Environment variable ${variable} is not defined`);
        }
    });

    return {
        PORT: process.env.PORT as string,
        DB_URL: process.env.DB_URL as string,
        NODE_ENV: process.env.NODE_ENV as "development" | "production",
    };
}


export const envVars = leadEnvVariables();