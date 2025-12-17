import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { vitalsController } from './vitals.controller';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /profiles/{profileId}/vitals:
 *   post:
 *     summary: Add vital reading
 *     tags: [Vitals]
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
 *               - type
 *               - value
 *               - unit
 *               - recordedAt
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [blood_pressure, blood_glucose, heart_rate, temperature, weight, spo2]
 *               value:
 *                 oneOf:
 *                   - type: number
 *                   - type: object
 *                     properties:
 *                       systolic:
 *                         type: number
 *                       diastolic:
 *                         type: number
 *               unit:
 *                 type: string
 *                 example: mmHg
 *               recordedAt:
 *                 type: string
 *                 format: date-time
 *               conditionProfileId:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Vital created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vital'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 */
router.post('/:profileId/vitals', vitalsController.create);

/**
 * @swagger
 * /profiles/{profileId}/vitals:
 *   get:
 *     summary: List vital readings
 *     tags: [Vitals]
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
 *           enum: [blood_pressure, blood_glucose, heart_rate, temperature, weight, spo2]
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
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
 *         description: List of vitals
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Vital'
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
router.get('/:profileId/vitals', vitalsController.list);

/**
 * @swagger
 * /profiles/{profileId}/vitals/{vitalId}:
 *   get:
 *     summary: Get vital by ID
 *     tags: [Vitals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: vitalId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vital details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vital'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         $ref: '#/components/responses/Error'
 */
router.get('/:profileId/vitals/:vitalId', vitalsController.getById);

/**
 * @swagger
 * /profiles/{profileId}/vitals/{vitalId}:
 *   delete:
 *     summary: Delete vital reading
 *     tags: [Vitals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: vitalId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vital deleted successfully
 *       401:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         $ref: '#/components/responses/Error'
 */
router.delete('/:profileId/vitals/:vitalId', vitalsController.delete);

export default router;

