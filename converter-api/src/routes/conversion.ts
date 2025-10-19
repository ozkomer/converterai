import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { Logger } from '../utils/logger';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { ConversionService } from '../services/conversionService';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/json' || 
        file.originalname.toLowerCase().endsWith('.json') ||
        file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Only JSON files are allowed'));
    }
  }
});

/**
 * @swagger
 * /api/convert:
 *   post:
 *     summary: Convert AI output to template using file upload
 *     description: Upload AI output and template files to convert them
 *     tags: [Conversion]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - aiOutput
 *               - template
 *             properties:
 *               aiOutput:
 *                 type: string
 *                 format: binary
 *                 description: AI output JSON file
 *               template:
 *                 type: string
 *                 format: binary
 *                 description: Template JSON file
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
router.post('/', 
  upload.fields([
    { name: 'aiOutput', maxCount: 1 },
    { name: 'template', maxCount: 1 }
  ]),
  asyncHandler(async (req: Request, res: Response) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files.aiOutput || !files.template) {
      throw createError('Both aiOutput and template files are required', 400);
    }

    const aiOutputFile = files.aiOutput[0];
    const templateFile = files.template[0];

    Logger.info(`Conversion started: ${aiOutputFile.filename} + ${templateFile.filename}`);

    const conversionService = new ConversionService();
    const result = await conversionService.convert(
      aiOutputFile.path,
      templateFile.path
    );

    Logger.success(`Conversion completed: ${result.outputPath}`);

    res.json({
      success: true,
      message: 'Conversion completed successfully',
      data: {
        outputPath: result.outputPath,
        downloadUrl: `/outputs/converted/${path.basename(result.outputPath)}`,
        stats: result.stats,
        fileSize: result.fileSize
      }
    });
  })
);

/**
 * @swagger
 * /api/convert/url:
 *   post:
 *     summary: Convert AI output to template using file paths
 *     description: Convert using existing file paths on the server
 *     tags: [Conversion]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConversionRequest'
 *     responses:
 *       200:
 *         description: Conversion completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConversionResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/url', asyncHandler(async (req: Request, res: Response) => {
  const { aiOutputPath, templatePath } = req.body;

  if (!aiOutputPath || !templatePath) {
    throw createError('Both aiOutputPath and templatePath are required', 400);
  }

  Logger.info(`Conversion started from URLs: ${aiOutputPath} + ${templatePath}`);

  const conversionService = new ConversionService();
  const result = await conversionService.convert(aiOutputPath, templatePath);

  Logger.success(`Conversion completed: ${result.outputPath}`);

  res.json({
    success: true,
    message: 'Conversion completed successfully',
    data: {
      outputPath: result.outputPath,
      downloadUrl: `/outputs/converted/${path.basename(result.outputPath)}`,
      stats: result.stats,
      fileSize: result.fileSize
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
