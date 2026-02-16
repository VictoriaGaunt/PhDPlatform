import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    passwordHash: string;
    role: 'admin';
    createdAt: Date;
}

const UserSchema = new Schema<IUser>({
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'admin', enum: ['admin'] },
    createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model<IUser>('User', UserSchema);