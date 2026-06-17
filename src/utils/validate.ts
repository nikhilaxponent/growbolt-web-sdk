export function validateApiKey(apiKey: string): boolean {
  if (typeof apiKey !== "string" || apiKey.trim().length === 0) {
    return false;
  }
  return apiKey.length >= 8; // minimum length
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

export function validateSessionId(sessionId: string): boolean {
  // uuid v4 format check
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(sessionId);
}

export function validateConfig(config: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.apiKey) {
    errors.push("apiKey is required");
  } else if (!validateApiKey(config.apiKey)) {
    errors.push("apiKey must be a non-empty string (min 8 chars)");
  }

  if (config.baseUrl && !validateUrl(config.baseUrl)) {
    errors.push("baseUrl must be a valid URL");
  }

  if (
    config.timeout !== undefined &&
    (typeof config.timeout !== "number" || config.timeout < 0)
  ) {
    errors.push("timeout must be a non-negative number");
  }

  if (
    config.sub4 !== undefined &&
    (typeof config.sub4 !== "string" || config.sub4.trim().length === 0)
  ) {
    errors.push("sub4 must be a non-empty string");
  }

  return { valid: errors.length === 0, errors };
}
