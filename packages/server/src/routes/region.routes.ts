// import express from 'express';
// import RegionController from '../controllers/region.controller';
// import { authenticate, authorize } from '../middleware/auth.middleware';
// import { validate } from '../middleware/validation.middleware';
// import {
//     getRegionSchema,
//     updateRegionSchema,
//     compareRegionsSchema
// } from '../schemas/region.schema';
//
// const router = express.Router();
//
// // Public routes
// router.get('/', RegionController.getAllRegions);
// router.get('/:code', validate(getRegionSchema), RegionController.getRegionByCode);
// router.get('/:code/indicators', RegionController.getRegionIndicators);
//
// // Protected routes (require authentication)
// router.post(
//     '/compare',
//     authenticate,
//     validate(compareRegionsSchema),
//     RegionController.compareRegions
// );
//
// // Admin only routes
// router.put(
//     '/:code',
//     authenticate,
//     authorize('admin'),
//     validate(updateRegionSchema),
//     RegionController.updateRegionData
// );
//
// export default router;