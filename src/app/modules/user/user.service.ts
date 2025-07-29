import { IUser } from "./user.interface";
import { User } from "./user.model";

const createUser = async (payload: Partial<IUser>) => {

    const { name, email, phone, password, ...rest } = payload;

    // mongoose pre-hook is hashing password 
    // const hashedPassword = await bcrypt.hash(password as string, 10);

    const user = await User.create({
        name,
        email,
        phone,
        password,
        ...rest
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