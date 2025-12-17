import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { reportsController } from './reports.controller';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /profiles/{profileId}/reports/upload-url:
 *   post:
 *     summary: Get signed upload URL for report file
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileName
 *               - fileType
 *             properties:
 *               fileName:
 *                 type: string
 *                 example: report.pdf
 *               fileType:
 *                 type: string
 *                 example: application/pdf
 *     responses:
 *       200:
 *         description: Upload URL generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uploadUrl:
 *                   type: string
 *                   example: http://localhost:3000/fake-upload/reports/prof_123/abc.pdf
 *                 fileKey:
 *                   type: string
 *                   example: reports/prof_123/abc.pdf
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 */
router.post('/:profileId/reports/upload-url', reportsController.getUploadUrl);

/**
 * @swagger
 * /profiles/{profileId}/reports:
 *   post:
 *     summary: Create report metadata
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - reportDate
 *               - type
 *               - fileKey
 *             properties:
 *               title:
 *                 type: string
 *                 example: CBC Lab Report
 *               reportDate:
 *                 type: string
 *                 format: date
 *                 example: '2025-07-15'
 *               type:
 *                 type: string
 *                 enum: [lab, radiology, prescription, visit_note, discharge, other]
 *               doctorName:
 *                 type: string
 *               facility:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               conditionProfileId:
 *                 type: string
 *               fileKey:
 *                 type: string
 *               includeInEmergency:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Report created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 */
router.post('/:profileId/reports', reportsController.create);

/**
 * @swagger
 * /profiles/{profileId}/reports:
 *   get:
 *     summary: List reports for a profile
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [lab, radiology, prescription, visit_note, discharge, other]
 *       - in: query
 *         name: conditionProfileId
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of reports
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Report'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/Error'
 */
router.get('/:profileId/reports', reportsController.list);

/**
 * @swagger
 * /profiles/{profileId}/reports/{reportId}:
 *   get:
 *     summary: Get report by ID
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         $ref: '#/components/responses/Error'
 */
router.get('/:profileId/reports/:reportId', reportsController.getById);

/**
 * @swagger
 * /profiles/{profileId}/reports/{reportId}:
 *   patch:
 *     summary: Update report metadata
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               reportDate:
 *                 type: string
 *                 format: date
 *               type:
 *                 type: string
 *                 enum: [lab, radiology, prescription, visit_note, discharge, other]
 *               doctorName:
 *                 type: string
 *               facility:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               includeInEmergency:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Report updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         $ref: '#/components/responses/Error'
 */
router.patch('/:profileId/reports/:reportId', reportsController.update);

/**
 * @swagger
 * /profiles/{profileId}/reports/{reportId}:
 *   delete:
 *     summary: Delete report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report deleted successfully
 *       401:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         $ref: '#/components/responses/Error'
 */
router.delete('/:profileId/reports/:reportId', reportsController.delete);

export default router;
