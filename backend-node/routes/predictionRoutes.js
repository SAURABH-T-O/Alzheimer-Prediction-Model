import { Router } from 'express';

import { ApiError, predictAssessment, predictMriScan } from '../services/predictionService.js';

export const predictionRouter = Router();

predictionRouter.post('/prediction/predict', async (request, response, next) => {
  try {
    if (!request.is('application/json')) {
      throw new ApiError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Use application/json for prediction requests.');
    }

    if (Object.hasOwn(request.body || {}, 'Diagnosis')) {
      throw new ApiError(400, 'INVALID_REQUEST', 'Diagnosis is an output and cannot be submitted.');
    }

    const result = await predictAssessment(request.body);
    response.json(result);
  } catch (error) {
    next(error);
  }
});

predictionRouter.post('/prediction/mri', async (request, response, next) => {
  try {
    const result = await predictMriScan({
      contentType: request.get('content-type'),
      fileName: request.get('x-file-name'),
      imageBytes: request.body,
    });
    response.json(result);
  } catch (error) {
    next(error);
  }
});
