export type StringFieldMessages = Partial<{
  required: string;
  minLength: string;
  maxLength: string;
  pattern: string;
}>;

export type StringFieldConfig<T extends string> = {
  key: T;
  value: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  trim?: boolean;
  messages?: StringFieldMessages;
};

const defaultMessages = {
  required: "هذا الحقل إجباري",
  minLength: (min: number) => `النص قصير جدًا (الحد الأدنى ${min} أحرف)` ,
  maxLength: (max: number) => `النص طويل جدًا (الحد الأقصى ${max} حرفًا)`,
  pattern: "تنسيق غير صحيح",
};

export const validateStringFields = <T extends string>(
  configs: StringFieldConfig<T>[]
): Partial<Record<T, string>> => {
  const errors: Partial<Record<T, string>> = {};

  configs.forEach(({
    key,
    value,
    required,
    minLength,
    maxLength,
    pattern,
    trim = true,
    messages = {},
  }) => {
    const text = trim ? value.trim() : value;

    if (required && !text) {
      errors[key] = messages.required ?? defaultMessages.required;
      return;
    }

    if (!text) {
      return;
    }

    if (minLength && text.length < minLength) {
      errors[key] =
        messages.minLength ?? defaultMessages.minLength(minLength);
      return;
    }

    if (maxLength && text.length > maxLength) {
      errors[key] =
        messages.maxLength ?? defaultMessages.maxLength(maxLength);
      return;
    }

    if (pattern && !pattern.test(text)) {
      errors[key] = messages.pattern ?? defaultMessages.pattern;
    }
  });

  return errors;
};
