import { User, IUser } from '../models/User.model';
import bcrypt from 'bcryptjs';

export class UserService {
    static async findByUsername(username: string): Promise<IUser | null> {
        return User.findOne({ username });
    }

    static async comparePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    static async createAdmin(username: string, password: string): Promise<IUser> {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const user = new User({ username, passwordHash: hash, role: 'admin' });
        return user.save();
    }
}