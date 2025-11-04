import { Router, Request, Response } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { ScenePredictor } from '../services/scenePredictor';
import { Logger } from '../utils/logger';

const router = Router();
const scenePredictor = new ScenePredictor();

/**
 * POST /api/convert/scene/analyze
 * Body: { template: {...} } veya { templatePath: "path/to/file.json" }
 */
router.post('/analyze', asyncHandler(async (req: Request, res: Response) => {
  const { template, templatePath } = req.body || {};

  if (!template && !templatePath) {
    throw createError('Either template or templatePath must be provided', 400);
  }

  let templateData = template;

  // Eğer dosya yolu verilmişse, dosyayı oku
  if (templatePath && !template) {
    const fs = require('fs');
    const path = require('path');
    const resolvedPath = path.resolve(templatePath);
    if (!fs.existsSync(resolvedPath)) {
      throw createError(`Template file not found: ${resolvedPath}`, 404);
    }
    const fileContent = fs.readFileSync(resolvedPath, 'utf8');
    templateData = JSON.parse(fileContent);
  }

  Logger.info(`Scene analysis requested for template: ${templatePath || 'provided'}`);

  const analysis = scenePredictor.getSceneAnalysis(templateData);

  res.json({
    success: true,
    analysis
  });
}));

/**
 * GET /api/convert/scene/predict/:pageId
 * Query: ?templatePath=... veya body'de template gönderilmeli
 */
router.get('/predict/:pageId', asyncHandler(async (req: Request, res: Response) => {
  const { pageId } = req.params;
  const { templatePath } = req.query;

  if (!templatePath) {
    throw createError('templatePath query parameter is required', 400);
  }

  const fs = require('fs');
  const path = require('path');
  const resolvedPath = path.resolve(templatePath as string);
  
  if (!fs.existsSync(resolvedPath)) {
    throw createError(`Template file not found: ${resolvedPath}`, 404);
  }

  const fileContent = fs.readFileSync(resolvedPath, 'utf8');
  const templateData = JSON.parse(fileContent);

  const sceneMap = scenePredictor.analyzeBoxes(templateData);
  const scene = sceneMap.get(pageId);

  if (!scene) {
    throw createError(`Scene not found for pageId: ${pageId}`, 404);
  }

  res.json({
    success: true,
    pageId,
    scene
  });
}));

export default router;

