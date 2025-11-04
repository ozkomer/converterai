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
 * Body options:
 *   1. { base: { size: 'Capsule', brand: 'default' }, variant: 'blue' }
 *   2. { base: { template: {...} }, variant: 'blue' }
 */
router.post('/generate', asyncHandler(async (req: Request, res: Response) => {
  const { base, variant } = req.body || {};

  if (!base || !variant) {
    throw createError('Required body: { base: { size, brand } OR base: { template }, variant }', 400);
  }

  let rawTemplate: any;

  // If template is provided directly, use it
  if (base.template) {
    Logger.info(`Variant generation requested: base=provided template, variant=${variant}`);
    rawTemplate = base.template;
  } 
  // Otherwise, fetch template using size and brand
  else if (base.size && base.brand) {
    Logger.info(`Variant generation requested: base=${base.size}-${base.brand}, variant=${variant}`);
    const baseResp = await templateRequestService.getTemplate({ size: base.size, brand: base.brand });
    rawTemplate = baseResp?.template;
    if (!rawTemplate) {
      throw createError('Base template could not be loaded', 500);
    }
  } else {
    throw createError('Either base.template or base.size+brand must be provided', 400);
  }

  const baseMinimal = adapter.buildMinimalScene(rawTemplate);

  const feature = await variantService.getCapsuleVariant(variant);
  if (!feature) {
    throw createError(`Unknown variant: ${variant}`, 404);
  }

  const generated = applier.apply(baseMinimal, feature);

  res.json({
    success: true,
    base: base.template ? { provided: true } : { size: base.size, brand: base.brand },
    variant,
    template: generated
  });
}));

export default router;
