import { allPredictionFields } from './prediction-field.js';

const fieldsByName = new Map(
  allPredictionFields.map((field) => [field.name, field]),
);

export function validateFieldValue(field, value) {
  if (value === undefined || value === null || value === '') {
    return 'This field is required.';
  }

  if (field.options) {
    const normalized = String(value).trim();
    return field.options.some((option) => option.value === normalized)
      ? ''
      : 'Choose one of the listed options.';
  }

  if (typeof value !== 'number' && typeof value !== 'string') {
    return 'Enter a number.';
  }

  if (typeof value === 'string' && value.trim() === '') {
    return 'This field is required.';
  }

  const number = Number(value);
  if (!Number.isFinite(number)) {
    return 'Enter a valid number.';
  }
  if (number < field.min || number > field.max) {
    return `Enter a value from ${field.min} to ${field.max}.`;
  }
  if (field.step === 1 && !Number.isInteger(number)) {
    return 'Enter a whole number.';
  }

  return '';
}

export function parseQuickFill(text) {
  let parsed;

  try {
    parsed = JSON.parse(text);
  } catch {
    return {
      updates: {},
      issues: ['The pasted text is not valid JSON. Check the quotation marks, commas, and braces.'],
    };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      updates: {},
      issues: ['Paste a JSON object with field names and values.'],
    };
  }

  const updates = {};
  const issues = [];

  for (const [name, value] of Object.entries(parsed)) {
    const field = fieldsByName.get(name);

    if (!field) {
      issues.push(`Unknown field: ${name}.`);
      continue;
    }

    if (field.options) {
      const error = validateFieldValue(field, value);
      if (error) {
        issues.push(`${field.label}: ${error}`);
        continue;
      }
      updates[name] = String(value).trim();
      continue;
    }

    if (typeof value !== 'number' && typeof value !== 'string') {
      issues.push(`${field.label}: Enter a number.`);
      continue;
    }

    const normalized = String(value).trim();
    const error = validateFieldValue(field, normalized);
    if (error) {
      issues.push(`${field.label}: ${error}`);
      continue;
    }
    updates[name] = normalized;
  }

  if (Object.keys(parsed).length === 0) {
    issues.push('The JSON object does not contain any fields to import.');
  }

  return { updates, issues };
}
