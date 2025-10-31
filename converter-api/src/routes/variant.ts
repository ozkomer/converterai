import { Router, Request, Response } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { TemplateRequestService } from '../services/templateRequestService';
import { VariantService } from '../services/variantService';
import { VariantApplier } from '../services/variantApplier';
import { RawTemplateAdapter } from '../services/rawTemplateAdapter';
import { Logger } from '../utils/logger';

const router = Router();
const templateRequestService = new TemplateRequestService();
const variantService = new VariantService();
const applier = new VariantApplier();
const adapter = new RawTemplateAdapter();

/**
 * POST /api/convert/variant/generate
 * Body: { base: { size: 'Capsule', brand: 'default' }, variant: 'blue' }
 */
router.post('/generate', asyncHandler(async (req: Request, res: Response) => {
  const { base, variant } = req.body || {};

  if (!base || !base.size || !base.brand || !variant) {
    throw createError('Required body: { base: { size, brand }, variant }', 400);
  }

  Logger.info(`Variant generation requested: base=${base.size}-${base.brand}, variant=${variant}`);

  const baseResp = await templateRequestService.getTemplate({ size: base.size, brand: base.brand });
  const rawTemplate = baseResp?.template;
  if (!rawTemplate) {
    throw createError('Base template could not be loaded', 500);
  }

  const baseMinimal = adapter.buildMinimalScene(rawTemplate);

  const feature = await variantService.getCapsuleVariant(variant);
  if (!feature) {
    throw createError(`Unknown variant: ${variant}`, 404);
  }

  const generated = applier.apply(baseMinimal, feature);

  res.json({
    success: true,
    base: { size: base.size, brand: base.brand },
    variant,
    template: generated
  });
}));

export default router;
