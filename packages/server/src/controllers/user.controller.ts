import { Request, Response } from 'express';

export class UserController {
    static async getMe(req: Request, res: Response) {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Не авторизован' });
        }

        res.json({
            success: true,
            data: {
                id: req.user.id,
                role: req.user.role,
                username: process.env.ADMIN_USERNAME, // или получить из БД
            },
        });
    }
}