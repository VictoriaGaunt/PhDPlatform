import { Router } from 'express';
const router = Router();
// Заглушка: можно добавить несколько тестовых маршрутов
router.get('/test', (req, res) => res.json({ message: 'OK' }));
export default router;