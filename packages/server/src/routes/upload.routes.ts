import { Router } from 'express';
import multer from 'multer';
import { UploadController } from '../controllers/upload';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const controller = new UploadController();

router.post('/', upload.single('file'), controller.upload.bind(controller));
router.get('/sheets', controller.listSheets.bind(controller));

export default router;