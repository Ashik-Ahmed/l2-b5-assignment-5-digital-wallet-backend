import { Request, Response } from "express";
import { User } from "./user.model";
import httpStatus from "http-status-codes";

const createUser = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, password, role } = req.body;
        const user = await User.create({
            name,
            email,
            phone,
            password,
            role
        });

        res.status(httpStatus.CREATED).json({
            message: "User created successfully",
            user: user
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error: error.message });

    }
}

export const UserController = {
    createUser
};