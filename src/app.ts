/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Request, Response } from 'express'
import cors from 'cors';
import router from './app/routes';
import { globalErrorHandler } from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import cookieParser from 'cookie-parser';


const app = express()

app.use(cookieParser());
app.use(express.json());
// app.use(cors());
// app.use(cors({
//     origin: ["http://localhost:3000", "https://l2-b5-assignment-6-digital-wallet-f.vercel.app", "https://*.vercel.app"], // exact origin — not '*'
//     credentials: true,               // allow cookies/credentials
// }));

const allowedOrigins = [
    "http://localhost:3000",
    "https://l2-b5-assignment-6-digital-wallet-f.vercel.app",
    "https://*.vercel.app"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // Check if it's a Vercel preview deployment
            if (origin.endsWith('.vercel.app')) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'), false);
            }
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use("/api/v1", router);


app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Welcome to Digital Wallet Backend"
    });
});

// Global error handler
app.use(globalErrorHandler);

app.use(notFound);

export default app;