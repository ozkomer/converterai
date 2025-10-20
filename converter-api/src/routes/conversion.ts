import { Router, Request, Response } from 'express';
import path from 'path';
import { Logger } from '../utils/logger';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { ConversionService } from '../services/conversionService';

const router = Router();

// Multer configuration removed - now using direct JSON input

/**
 * @swagger
 * /api/convert:
 *   post:
 *     summary: Convert AI output to VoiceIdeal Studio template
 *     description: Send AI output data and template data directly in JSON format for conversion
 *     tags: [Conversion]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - aiOutput
 *               - template
 *             properties:
 *               aiOutput:
 *                 type: object
 *                 description: AI generated content in JSON format
 *                 example:
 *                   CourseInfo:
 *                     Title: "Sample Course"
 *                     Description: "Course description"
 *                   Sections:
 *                     - Title: "Section 1"
 *                       Content: "Section content"
 *               template:
 *                 type: object
 *                 description: VoiceIdeal Studio template in JSON format
 *                 example:
 *                   training-title: "{{title}}"
 *                   training-description: "{{description}}"
 *               templateType:
 *                 type: string
 *                 description: Template type identifier
 *                 enum: ["Capsule-Default", "Capsule-Siyah", "XL-Blue", "XL-Samsung"]
 *                 default: "Capsule-Default"
 *     responses:
 *       200:
 *         description: Conversion completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConversionResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { aiOutput, template, templateType = 'Capsule-Default' } = req.body;

  if (!aiOutput || !template) {
    throw createError('Both aiOutput and template are required', 400);
  }

  Logger.info(`Conversion started with template type: ${templateType}`);

  const conversionService = new ConversionService();
  const result = await conversionService.convertFromData(aiOutput, template, templateType);

  Logger.success(`Conversion completed successfully`);

  res.json({
    success: true,
    message: 'Conversion completed successfully',
    data: {
      convertedTemplate: result.convertedTemplate,
      stats: result.stats,
      templateType: templateType
    }
  });
}));

/**
 * @swagger
 * /api/convert/templates:
 *   get:
 *     summary: List available templates
 *     description: Get list of all available template files organized by template type
 *     tags: [Templates]
 *     responses:
 *       200:
 *         description: List of available templates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TemplateInfo'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/templates', asyncHandler(async (_req: Request, res: Response) => {
  const fs = require('fs-extra');
  const templates = [];

  try {
    // Scene templates
    const sceneTemplatesPath = '/project/scene_templates';
    if (await fs.pathExists(sceneTemplatesPath)) {
      const templateDirs = await fs.readdir(sceneTemplatesPath);
      
      for (const dir of templateDirs) {
        const dirPath = path.join(sceneTemplatesPath, dir);
        const files = await fs.readdir(dirPath);
        
        const templateFiles = files
          .filter((file: string) => file.endsWith('.json'))
          .map((file: string) => ({
            name: file,
            path: path.join(dirPath, file),
            templateType: dir
          }));

        if (templateFiles.length > 0) {
          templates.push({
            templateType: dir,
            files: templateFiles
          });
        }
      }
    }

    // XL templates
    const xlTemplatesPath = '/project/XLSamples/RawXLTemplates';
    if (await fs.pathExists(xlTemplatesPath)) {
      const xlFiles = await fs.readdir(xlTemplatesPath);
      const xlTemplateFiles = xlFiles
        .filter((file: string) => file.endsWith('.json'))
        .map((file: string) => ({
          name: file,
          path: path.join(xlTemplatesPath, file),
          templateType: 'XL'
        }));

      if (xlTemplateFiles.length > 0) {
        templates.push({
          templateType: 'XL',
          files: xlTemplateFiles
        });
      }
    }

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    throw createError('Failed to list templates', 500);
  }
}));

/**
 * @swagger
 * /api/convert/outputs:
 *   get:
 *     summary: List converted outputs
 *     description: Get list of all converted output files with metadata
 *     tags: [Outputs]
 *     responses:
 *       200:
 *         description: List of converted outputs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OutputInfo'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/outputs', asyncHandler(async (_req: Request, res: Response) => {
  const outputsPath = path.join(__dirname, '../../outputs/converted');
  const fs = require('fs-extra');
  
  try {
    const files = await fs.readdir(outputsPath);
    const outputs = files
      .filter((file: string) => file.endsWith('.json'))
      .map((file: string) => {
        const filePath = path.join(outputsPath, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          size: stats.size,
          created: stats.birthtime,
          downloadUrl: `/outputs/converted/${file}`
        };
      })
      .sort((a: any, b: any) => b.created.getTime() - a.created.getTime());

    res.json({
      success: true,
      data: outputs
    });
  } catch (error) {
    throw createError('Failed to list outputs', 500);
  }
}));

export { router as conversionRoutes };
