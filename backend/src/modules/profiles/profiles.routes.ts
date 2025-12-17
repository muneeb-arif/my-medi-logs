import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { profilesController } from './profiles.controller';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /profiles:
 *   get:
 *     summary: List all profiles for authenticated account
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PersonProfile'
 *       401:
 *         $ref: '#/components/responses/Error'
 */
router.get('/', profilesController.list);

/**
 * @swagger
 * /profiles:
 *   post:
 *     summary: Create a new profile
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - dateOfBirth
 *               - gender
 *               - relationToAccount
 *               - emergencyContacts
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Sarah Ahmad
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: '1980-01-01'
 *               gender:
 *                 type: string
 *                 example: female
 *               relationToAccount:
 *                 type: string
 *                 example: self
 *               bloodType:
 *                 type: string
 *                 example: O+
 *               heightCm:
 *                 type: number
 *                 example: 164
 *               weightKg:
 *                 type: number
 *                 example: 68
 *               emergencyContacts:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - relation
 *                     - phone
 *                   properties:
 *                     name:
 *                       type: string
 *                     relation:
 *                       type: string
 *                     phone:
 *                       type: string
 *     responses:
 *       201:
 *         description: Profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PersonProfile'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 */
router.post('/', profilesController.create);

/**
 * @swagger
 * /profiles/{profileId}:
 *   get:
 *     summary: Get profile by ID
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *         example: prof_123
 *     responses:
 *       200:
 *         description: Profile details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PersonProfile'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         $ref: '#/components/responses/Error'
 */
router.get('/:profileId', profilesController.getById);

/**
 * @swagger
 * /profiles/{profileId}:
 *   patch:
 *     summary: Update profile
 *     tags: [Profiles]
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
 *             properties:
 *               fullName:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *               relationToAccount:
 *                 type: string
 *               bloodType:
 *                 type: string
 *               heightCm:
 *                 type: number
 *               weightKg:
 *                 type: number
 *               emergencyContacts:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PersonProfile'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         $ref: '#/components/responses/Error'
 */
router.patch('/:profileId', profilesController.update);

/**
 * @swagger
 * /profiles/{profileId}:
 *   delete:
 *     summary: Delete profile
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 *       401:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         $ref: '#/components/responses/Error'
 */
router.delete('/:profileId', profilesController.delete);

/**
 * @swagger
 * /profiles/{profileId}/settings:
 *   patch:
 *     summary: Update profile privacy settings
 *     tags: [Profiles]
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
 *               - emergencyAccessEnabled
 *               - doctorSharingEnabled
 *             properties:
 *               emergencyAccessEnabled:
 *                 type: boolean
 *               doctorSharingEnabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PersonProfile'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         $ref: '#/components/responses/Error'
 */
router.patch('/:profileId/settings', profilesController.updateSettings);

export default router;
