/**
 * Validates whether the given blueprint object strictly matches the required AI blueprint JSON contract.
 * Contract:
 * {
 *   "title": string,
 *   "building_type": string,
 *   "total_floors": number,
 *   "dimensions": { "width": number, "height": number },
 *   "floors": array
 * }
 */
export const validateBlueprintJSON = (data) => {
  const errors = [];

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { isValid: false, errors: ['Blueprint data must be a valid JSON object.'] };
  }

  if (!data.title || typeof data.title !== 'string') {
    errors.push('Field "title" is required and must be a non-empty string.');
  }

  if (!data.building_type || typeof data.building_type !== 'string') {
    errors.push('Field "building_type" is required and must be a non-empty string.');
  }

  if (typeof data.total_floors !== 'number' || data.total_floors < 1) {
    errors.push('Field "total_floors" is required and must be a positive number.');
  }

  if (!data.dimensions || typeof data.dimensions !== 'object') {
    errors.push('Field "dimensions" is required and must be an object with width and height.');
  } else {
    if (typeof data.dimensions.width !== 'number' || data.dimensions.width <= 0) {
      errors.push('Field "dimensions.width" must be a positive number.');
    }
    if (typeof data.dimensions.height !== 'number' || data.dimensions.height <= 0) {
      errors.push('Field "dimensions.height" must be a positive number.');
    }
  }

  if (!Array.isArray(data.floors)) {
    errors.push('Field "floors" is required and must be an array.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
