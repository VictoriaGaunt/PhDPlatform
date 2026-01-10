import { Router } from 'express';
import { DataController } from '../controllers/data';

const router = Router();
const controller = new DataController();

router.get('/:sheetId', controller.getSheetData.bind(controller));
router.patch('/:sheetId/rows/:rowIndex', controller.updateRow.bind(controller));
router.post('/:sheetId/rows', controller.addRow.bind(controller));
router.delete('/:sheetId/rows/:rowIndex', controller.deleteRow.bind(controller));

export default router;