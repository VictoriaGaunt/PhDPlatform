import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import environment from '../config/environment';
//import { UserService } from '../services/user.service';

export class AuthController {
    static async login(req: Request, res: Response) {
        const {username, password} = req.body;
        if (
            username !== environment.ADMIN_USERNAME ||
            password !== environment.ADMIN_PASSWORD
        ) {
            return res.status(401).json({
                success: false,
                error: 'Неверное имя пользователя или пароль',
            });
        }
        const token = jwt.sign(
            {id: 'admin', role: 'admin'},
            environment.JWT_SECRET,
            {expiresIn: environment.JWT_EXPIRES_IN}
        );
        const refreshToken = jwt.sign(
            {id: 'admin', role: 'admin'},
            environment.JWT_REFRESH_SECRET,
            {expiresIn: environment.JWT_REFRESH_EXPIRES_IN}
        );

        res.json({
            success: true,
            data: {
                accessToken: token,
                refreshToken,
                user: {
                    id: 'admin',
                    username: environment.ADMIN_USERNAME,
                    role: 'admin',
                },
            },
        });
    }
    static async logout(_req: Request, res: Response) {
       res.json({ success: true, message: 'Выход выполнен' });
    }
}