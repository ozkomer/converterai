import { Router, Request, Response } from 'express';
import path from 'path';
import { Logger } from '../utils/logger';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { ConversionService } from '../services/conversionService';
import { TemplateService } from '../services/templateService';
import { DynamicTemplateService } from '../services/dynamicTemplateService';
import { TemplateRequestService } from '../services/templateRequestService';
import fs from 'fs-extra';

const router = Router();
const templateService = new TemplateService();
const dynamicTemplateService = new DynamicTemplateService();
const templateRequestService = new TemplateRequestService();

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

  if (!aiOutput) {
    throw createError('aiOutput is required', 400);
  }

  Logger.info(`Conversion started with template type: ${templateType}`);

  const conversionService = new ConversionService();

  // XL path: allow omitting template and load proper RawXL template file dynamically
  if ((templateType || '').startsWith('XL') && !template) {
    const chooseTemplatePath = async (): Promise<string> => {
      const candidates: string[] = [];
      if (templateType === 'XL-SOMPO') {
        candidates.push(
          path.resolve(__dirname, '../../../TestCases/inputs/templates/RawXLTemplates/voiceidealStudioTemplate_sompo.json'),
          path.resolve(__dirname, '../../TestCases/inputs/templates/RawXLTemplates/voiceidealStudioTemplate_sompo.json')
        );
      } else {
        candidates.push(
          path.resolve(__dirname, '../../../TestCases/inputs/templates/RawXLTemplates/voiceidealStudioTemplate.json'),
          path.resolve(__dirname, '../../TestCases/inputs/templates/RawXLTemplates/voiceidealStudioTemplate.json')
        );
      }
      for (const p of candidates) {
        if (await fs.pathExists(p)) return p;
      }
      throw createError('RawXL template file not found for XL conversion', 404);
    };
    await chooseTemplatePath(); // ensure template availability if needed later
    const skeletonCandidates: string[] = templateType === 'XL-SOMPO'
      ? [
          path.resolve(__dirname, '../../../TestCases/outputs/xl-outputs/9_XL_SOMPO_FinalOutput.json'),
          path.resolve(__dirname, '../../TestCases/outputs/xl-outputs/9_XL_SOMPO_FinalOutput.json')
        ]
      : [
          path.resolve(__dirname, '../../../TestCases/outputs/xl-outputs/5_XL_Blue_FinalOutput.json'),
          path.resolve(__dirname, '../../TestCases/outputs/xl-outputs/5_XL_Blue_FinalOutput.json')
        ];
    let skeletonPath: string | null = null;
    for (const p of skeletonCandidates) {
      if (await fs.pathExists(p)) { skeletonPath = p; break; }
    }
    if (!skeletonPath) {
      throw createError('Skeleton FinalOutput not found', 404);
    }
    const result = await conversionService.convertXLUsingSkeleton(aiOutput, skeletonPath);

    res.json({
      success: true,
      message: 'Conversion completed successfully',
      data: {
        convertedTemplate: result.convertedTemplate,
        stats: result.stats,
        templateType: templateType
      }
    });
    return; // ensure function returns here
  }

  if (!template) {
    throw createError('Both aiOutput and template are required', 400);
  }

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
  return; // explicit return
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

/**
 * @swagger
 * /api/templates/list:
 *   get:
 *     summary: List all available templates
 *     description: Get list of all available template sizes and variants
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
 *                     type: object
 *                     properties:
 *                       size:
 *                         type: string
 *                         example: "LSCapsule"
 *                       variant:
 *                         type: string
 *                         example: "default"
 *                       fileName:
 *                         type: string
 *                         example: "voiceidealStudioTemplate_default.json"
 *                       exists:
 *                         type: boolean
 *                         example: true
 */
router.get('/templates/list', asyncHandler(async (_req: Request, res: Response) => {
  try {
    const templates = await templateService.listAvailableTemplates();
    
    res.json({
      success: true,
      data: templates
    });
  } catch (error: any) {
    throw createError(`Failed to list templates: ${error.message}`, 500);
  }
}));

/**
 * @swagger
 * /api/templates/{templateType}/info:
 *   get:
 *     summary: Get template information
 *     description: Get detailed information about a specific template
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: templateType
 *         required: true
 *         schema:
 *           type: string
 *         description: Template type (e.g., LSCapsule-default, LSXL-samsung)
 *     responses:
 *       200:
 *         description: Template information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     size:
 *                       type: string
 *                       example: "LSCapsule"
 *                     variant:
 *                       type: string
 *                       example: "default"
 *                     fileName:
 *                       type: string
 *                       example: "voiceidealStudioTemplate_default.json"
 *                     exists:
 *                       type: boolean
 *                       example: true
 *       404:
 *         description: Template not found
 */
router.get('/templates/:templateType/info', asyncHandler(async (req: Request, res: Response) => {
  const { templateType } = req.params;
  
  try {
    const templateInfo = await templateService.getTemplateInfo(templateType);
    
    res.json({
      success: true,
      data: templateInfo
    });
  } catch (error: any) {
    throw createError(`Failed to get template info: ${error.message}`, 404);
  }
}));

/**
 * @swagger
 * /api/templates/{templateType}/metadata:
 *   get:
 *     summary: Get template metadata
 *     description: Get metadata about a specific template (version, config, etc.)
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: templateType
 *         required: true
 *         schema:
 *           type: string
 *         description: Template type (e.g., LSCapsule-default, LSXL-samsung)
 *     responses:
 *       200:
 *         description: Template metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     version:
 *                       type: string
 *                       example: "3"
 *                     boxesCount:
 *                       type: number
 *                       example: 25
 *                     templateType:
 *                       type: string
 *                       example: "LSCapsule-default"
 *       404:
 *         description: Template not found
 */
router.get('/templates/:templateType/metadata', asyncHandler(async (req: Request, res: Response) => {
  const { templateType } = req.params;
  
  try {
    const metadata = await templateService.getTemplateMetadata(templateType);
    
    res.json({
      success: true,
      data: metadata
    });
  } catch (error: any) {
    throw createError(`Failed to get template metadata: ${error.message}`, 404);
  }
}));

/**
 * @swagger
 * /api/convert/dynamic:
 *   post:
 *     summary: Create dynamic template from AI output
 *     description: Create a new template dynamically based on AI output using reference templates
 *     tags: [Conversion]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - aiOutput
 *               - templateType
 *             properties:
 *               aiOutput:
 *                 type: object
 *                 description: AI generated content in JSON format
 *               templateType:
 *                 type: string
 *                 description: Template type (e.g., LSCapsule-default, LSXL-samsung, LSMaxi-sompo)
 *                 example: "LSCapsule-blue"
 *     responses:
 *       200:
 *         description: Dynamic template created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Dynamic template created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     convertedTemplate:
 *                       type: object
 *                       description: Dynamically created template JSON
 *                     templateInfo:
 *                       type: object
 *                       description: Template information
 *                       properties:
 *                         size:
 *                           type: string
 *                           example: "LSCapsule"
 *                         variant:
 *                           type: string
 *                           example: "blue"
 *                         boxesCount:
 *                           type: number
 *                           example: 25
 *                         sectionsMapped:
 *                           type: number
 *                           example: 5
 *                         quizzesMapped:
 *                           type: number
 *                           example: 3
 *                     stats:
 *                       type: object
 *                       properties:
 *                         sections:
 *                           type: number
 *                           example: 5
 *                         quizzes:
 *                           type: number
 *                           example: 3
 *                         totalTags:
 *                           type: number
 *                           example: 25
 *                         replacedTags:
 *                           type: number
 *                           example: 8
 *                         templateSize:
 *                           type: string
 *                           example: "2.5 MB"
 *                         dynamicBoxesCreated:
 *                           type: number
 *                           example: 8
 *       400:
 *         description: Bad request - missing required fields
 *       404:
 *         description: Template not found
 *       500:
 *         description: Dynamic template creation failed
 */
router.post('/convert/dynamic', asyncHandler(async (req: Request, res: Response) => {
  const { aiOutput, templateType } = req.body;

  if (!aiOutput) {
    throw createError('aiOutput is required', 400);
  }

  if (!templateType) {
    throw createError('templateType is required', 400);
  }

  Logger.info(`Dynamic template creation started with template type: ${templateType}`);

  try {
    const result = await dynamicTemplateService.createDynamicTemplate(aiOutput, templateType);

    Logger.success(`Dynamic template created for ${templateType}: ${result.stats.dynamicBoxesCreated} boxes created`);

    res.json({
      success: true,
      message: 'Dynamic template created successfully',
      data: result
    });
  } catch (error: any) {
    Logger.error(`Dynamic template creation failed for ${templateType}:`, error);
    throw createError(`Dynamic template creation failed: ${error.message}`, 500);
  }
}));

/**
 * @swagger
 * /api/convert/template/request:
 *   post:
 *     summary: Get template by size and brand
 *     description: Request a specific template by size (Capsule, XL, Maxi, etc.) and brand (Creatio, Samsung, etc.). Returns raw template content with placeholders.
 *     tags: [Template Request]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TemplateRequest'
 *     responses:
 *       200:
 *         description: Template retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TemplateResponse'
 *       400:
 *         description: Bad request - invalid size or brand
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Template not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/template/request', asyncHandler(async (req: Request, res: Response) => {
  const { size, brand } = req.body;

  if (!size) {
    throw createError('size is required', 400);
  }

  if (!brand) {
    throw createError('brand is required', 400);
  }

  Logger.info(`Template request: ${size}-${brand}`);

  try {
    const result = await templateRequestService.getTemplate({ size, brand });

    Logger.success(`Template retrieved: ${size}-${brand}`);

    res.json(result);
  } catch (error: any) {
    Logger.error(`Template request failed for ${size}-${brand}:`, error);
    throw createError(`Template request failed: ${error.message}`, error.status || 500);
  }
}));

/**
 * @swagger
 * /api/convert/template/list:
 *   get:
 *     summary: List all available templates
 *     description: Get list of all available template sizes and brands
 *     tags: [Template Request]
 *     responses:
 *       200:
 *         description: List of available templates
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TemplateListResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/template/list', asyncHandler(async (_req: Request, res: Response) => {
  try {
    const templates = await templateRequestService.listAvailableTemplates();
    
    res.json({
      success: true,
      data: templates
    });
  } catch (error: any) {
    throw createError(`Failed to list templates: ${error.message}`, 500);
  }
}));

/**
 * @swagger
 * /api/convert/template/{size}/{brand}/metadata:
 *   get:
 *     summary: Get template metadata
 *     description: Get metadata about a specific template
 *     tags: [Template Request]
 *     parameters:
 *       - in: path
 *         name: size
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Capsule, XL, Maxi, Micro, Midi, Mini]
 *         description: Template size
 *         example: "Capsule"
 *       - in: path
 *         name: brand
 *         required: true
 *         schema:
 *           type: string
 *           enum: [creatio, samsung, sompo, default]
 *         description: Template brand
 *         example: "creatio"
 *     responses:
 *       200:
 *         description: Template metadata retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     size:
 *                       type: string
 *                       example: "Capsule"
 *                     brand:
 *                       type: string
 *                       example: "creatio"
 *                     fileName:
 *                       type: string
 *                       example: "voiceidealStudioTemplate_creatio.json"
 *                     fileSize:
 *                       type: string
 *                       example: "0.25 MB"
 *                     boxesCount:
 *                       type: number
 *                       example: 0
 *                     lastModified:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-21T08:25:37.000Z"
 *       404:
 *         description: Template not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/template/:size/:brand/metadata', asyncHandler(async (req: Request, res: Response) => {
  const { size, brand } = req.params;
  
  try {
    const metadata = await templateRequestService.getTemplateMetadata(size, brand);
    
    res.json({
      success: true,
      data: metadata
    });
  } catch (error: any) {
    throw createError(`Failed to get template metadata: ${error.message}`, 404);
  }
}));

export { router as conversionRoutes };
