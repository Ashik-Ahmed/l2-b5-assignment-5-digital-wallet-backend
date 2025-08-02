/* eslint-disable no-console */
import { User } from "../modules/user/user.model";
import { envVars } from "../config/env";
import { IUser, USER_ROLES } from "../modules/user/user.interface";

export const seedAdmin = async () => {
    try {
        const isAdminExist = await User.findOne({ email: envVars.SUPER_ADMIN_EMAIL })

        if (isAdminExist) {
            // console.log("Admin Already Exists!");
            return;
        }

        console.log("Trying to create Admin...");

        // const hashedPassword = await bcryptjs.hash(envVars.SUPER_ADMIN_PASSWORD, Number(envVars.BCRYPT_SALT_ROUNDS))

        const payload: Partial<IUser> = {
            name: "Admin User",
            role: USER_ROLES.ADMIN,
            email: envVars.SUPER_ADMIN_EMAIL,
            password: envVars.SUPER_ADMIN_PASSWORD,
            phone: "01710112233",
            isActive: true
        }

        const admin = await User.create(payload)
        console.log("Admin User Created: \n", admin);

    } catch (error) {
        console.log(error);
    }
}