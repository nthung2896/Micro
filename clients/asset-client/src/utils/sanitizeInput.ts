// utils/sanitizeInput.ts
export function sanitizeInput<T extends object>(
  data: any,
  allowedFields: (keyof T)[],
): Partial<T> {
  const sanitized: Partial<T> = {};
  for (const key of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      sanitized[key] = data[key];
    }
  }
  return sanitized;
}
