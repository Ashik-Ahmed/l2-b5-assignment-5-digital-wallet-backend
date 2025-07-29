import { IUser } from "./user.interface";
import { User } from "./user.model";

const createUser = async (payload: Partial<IUser>) => {

    const { name, email, phone, password, role } = payload;
    const user = await User.create({
        name,
        email,
        phone,
        password,
        role
    });
    return user;
}

const getAllUsers = async () => {
    const users = await User.find({});

    const totalUsers = await User.countDocuments({});

    return {
        users,
        meta: {
            total: totalUsers
        }
    };
}

export const UserService = {
    createUser,
    getAllUsers
};