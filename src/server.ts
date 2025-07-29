/* eslint-disable no-console */
import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import { envVars } from './app/config/env';

let server: Server;


const startServer = async () => {
    try {
        await mongoose.connect(envVars.DB_URL)
        console.log("Connected to MongoDB");
        server = app.listen(envVars.PORT, () => {
            console.log(`Server is running on port ${envVars.PORT}`);
        })
    } catch (error) {
        console.error("Error starting the server:", error);
    }
}

startServer();


process.on("unhandledRejection", (error) => {
    console.log("Unhandled Rejection.., shutting down the server", error);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
})

process.on("uncaughtException", (error) => {
    console.log("Uncaught Exception.., shutting down the server", error);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
})


process.on("SIGTERM", () => {
    console.log("SIGTERM received.., shutting down the server");
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
})


process.on("SIGINT", () => {
    console.log("SIGINT received.., shutting down the server");
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
})