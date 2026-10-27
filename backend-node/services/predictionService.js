import { allPredictionFields } from '../../frontend/prediction-field.js';

const fieldMap = new Map(allPredictionFields.map((field) => [field.name, field]));

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function validatePayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new ApiError(400, 'INVALID_REQUEST', 'Prediction input must be a JSON object.');
  }

  const unknownFields = Object.keys(payload).filter((name) => !fieldMap.has(name));
  if (unknownFields.length > 0) {
    throw new ApiError(422, 'UNKNOWN_FIELDS', `Unknown field(s): ${unknownFields.join(', ')}.`);
  }

  const missingFields = allPredictionFields
    .filter((field) => !Object.hasOwn(payload, field.name))
    .map((field) => field.name);
  if (missingFields.length > 0) {
    throw new ApiError(422, 'MISSING_FIELDS', `Required field(s) are missing: ${missingFields.join(', ')}.`);
  }

  const normalized = {};
  const invalidFields = [];

  for (const field of allPredictionFields) {
    const value = payload[field.name];
    if (typeof value !== 'number' && typeof value !== 'string') {
      invalidFields.push(field.name);
      continue;
    }

    const number = Number(value);
    if (!Number.isFinite(number) || number < field.min || number > field.max) {
      invalidFields.push(field.name);
      continue;
    }

    if (field.step === 1 && !Number.isInteger(number)) {
      invalidFields.push(field.name);
      continue;
    }

    if (field.options && !field.options.some((option) => option.value === String(value))) {
      invalidFields.push(field.name);
      continue;
    }

    normalized[field.name] = number;
  }

  if (invalidFields.length > 0) {
    throw new ApiError(422, 'INVALID_FIELDS', `Invalid value(s) for: ${invalidFields.join(', ')}.`);
  }

  return normalized;
}

export async function predictAssessment(payload) {
  const features = validatePayload(payload);
  const mlServiceUrl = (process.env.PYTHON_ML_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
  const timeoutMs = Number(process.env.ML_REQUEST_TIMEOUT_MS) || 10000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(`${mlServiceUrl}/api/prediction/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(features),
      signal: controller.signal,
    });
  } catch (error) {
    const timedOut = error.name === 'AbortError';
    throw new ApiError(
      timedOut ? 504 : 503,
      timedOut ? 'ML_SERVICE_TIMEOUT' : 'ML_SERVICE_UNAVAILABLE',
      timedOut
        ? 'The prediction service did not respond in time.'
        : 'The prediction service is unavailable.',
    );
  } finally {
    clearTimeout(timeout);
  }

  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success || !body?.data) {
    throw new ApiError(
      response.status === 503 ? 503 : response.status === 422 ? 422 : 502,
      body?.error?.code || 'ML_SERVICE_ERROR',
      body?.error?.message || 'The prediction service returned an invalid response.',
    );
  }

  const probability = Number(body.data.probability);
  const prediction = Number(body.data.prediction);
  if (!Number.isFinite(probability) || probability < 0 || probability > 100 || ![0, 1].includes(prediction)) {
    throw new ApiError(502, 'INVALID_ML_RESPONSE', 'The prediction service returned an invalid result.');
  }

  return {
    success: true,
    data: {
      probability,
      prediction,
      status: 'success',
    },
  };

}
