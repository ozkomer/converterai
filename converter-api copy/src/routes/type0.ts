import { Router, Request, Response } from 'express';
import { Logger } from '../utils/logger';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { Type0TemplateService } from '../services/type0TemplateService';

const router = Router();
const type0Service = new Type0TemplateService();

/**
 * @swagger
 * /api/convert/type0/brands:
 *   get:
 *     summary: List available Type0 brands
 *     description: Get list of all available Type0 template brands
 *     tags: [Type0]
 *     responses:
 *       200:
 *         description: List of available brands
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 brands:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get('/brands', asyncHandler(async (_req: Request, res: Response) => {
  Logger.info('Listing Type0 brands...');
  const brands = await type0Service.listAvailableBrands();
  
  res.json({
    success: true,
    brands
  });
}));

/**
 * @swagger
 * /api/convert/type0/brand/{brand}/info:
 *   get:
 *     summary: Get Type0 brand information
 *     description: Get detailed information about a specific Type0 brand
 *     tags: [Type0]
 *     parameters:
 *       - in: path
 *         name: brand
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand name (blue, sompo, samsung, etc.)
 *     responses:
 *       200:
 *         description: Brand information
 *       400:
 *         description: Brand not found
 */
router.get('/brand/:brand/info', asyncHandler(async (req: Request, res: Response) => {
  const { brand } = req.params;
  Logger.info(`Getting brand info for: ${brand}`);

  try {
    const brandInfo = await type0Service.getBrandInfo(brand);
    
    res.json({
      success: true,
      brandInfo
    });
  } catch (error) {
    throw createError(`Brand not found: ${brand}`, 400);
  }
}));

/**
 * @swagger
 * /api/convert/type0/generate:
 *   post:
 *     summary: Generate Type0 template
 *     description: Generate a Type0 template for the specified brand with provided content
 *     tags: [Type0]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - brand
 *               - content
 *             properties:
 *               brand:
 *                 type: string
 *                 description: Brand name (blue, sompo, samsung, etc.)
 *                 example: blue
 *               content:
 *                 type: object
 *                 required:
 *                   - title
 *                   - mandatory
 *                 properties:
 *                   title:
 *                     type: string
 *                     description: Title text for the scene
 *                     example: "Güvenlik Eğitimi"
 *                   imageUrl:
 *                     type: string
 *                     description: Optional image URL
 *                     example: "https://example.com/image.jpg"
 *                   mandatory:
 *                     type: boolean
 *                     description: Whether the scene is mandatory
 *                     example: true
 *     responses:
 *       200:
 *         description: Type0 template generated successfully
 *       400:
 *         description: Invalid brand or content
 */
router.post('/generate', asyncHandler(async (req: Request, res: Response) => {
  const { brand, content } = req.body;

  if (!brand || !content) {
    throw createError('Both brand and content are required', 400);
  }

  if (!content.title || typeof content.mandatory !== 'boolean') {
    throw createError('Content must have title and mandatory fields', 400);
  }

  Logger.info(`Generating Type0 template for brand: ${brand}`);

  try {
    const result = await type0Service.generateType0Template(brand, content);

    res.json({
      success: true,
      message: 'Type0 template generated successfully',
      template: result.template,
      metadata: result.metadata
    });
  } catch (error: any) {
    throw createError(`Failed to generate Type0 template: ${error.message}`, 400);
  }
}));

/**
 * @swagger
 * /api/convert/type0/generate-from-template:
 *   post:
 *     summary: Generate Type0 template from template type
 *     description: Generate Type0 template by extracting brand from template type (e.g., "Capsule-Blue" -> "blue")
 *     tags: [Type0]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - templateType
 *               - content
 *             properties:
 *               templateType:
 *                 type: string
 *                 description: Template type (e.g., "Capsule-Blue", "LSXL-Samsung")
 *                 example: Capsule-Blue
 *               content:
 *                 type: object
 *                 required:
 *                   - title
 *                   - mandatory
 *                 properties:
 *                   title:
 *                     type: string
 *                     example: "Eğitim Başlığı"
 *                   imageUrl:
 *                     type: string
 *                   mandatory:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Type0 template generated successfully
 */
router.post('/generate-from-template', asyncHandler(async (req: Request, res: Response) => {
  const { templateType, content } = req.body;

  if (!templateType || !content) {
    throw createError('Both templateType and content are required', 400);
  }

  Logger.info(`Generating Type0 from template type: ${templateType}`);

  try {
    const result = await type0Service.generateType0FromTemplateType(templateType, content);

    res.json({
      success: true,
      message: 'Type0 template generated successfully',
      template: result.template,
      metadata: result.metadata
    });
  } catch (error: any) {
    throw createError(`Failed to generate Type0 template: ${error.message}`, 400);
  }
}));

export default router;

