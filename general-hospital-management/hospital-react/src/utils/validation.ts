/**
 * Form Validation Utilities
 * Các hàm validation cho forms trong ứng dụng
 */

export interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    min?: number;
    max?: number;
    email?: boolean;
    phone?: boolean;
    custom?: (value: any) => boolean;
    message?: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}

/**
 * Validate một field theo rules
 */
export function validateField(value: any, rules: ValidationRule): string | null {
    // Required
    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        return rules.message || 'Trường này là bắt buộc';
    }

    // Nếu không required và value rỗng, skip các validation khác
    if (!value || (typeof value === 'string' && value.trim() === '')) {
        return null;
    }

    // Min length
    if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        return rules.message || `Tối thiểu ${rules.minLength} ký tự`;
    }

    // Max length
    if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
        return rules.message || `Tối đa ${rules.maxLength} ký tự`;
    }

    // Pattern
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
        return rules.message || 'Định dạng không hợp lệ';
    }

    // Min value
    if (rules.min !== undefined && typeof value === 'number' && value < rules.min) {
        return rules.message || `Giá trị tối thiểu là ${rules.min}`;
    }

    // Max value
    if (rules.max !== undefined && typeof value === 'number' && value > rules.max) {
        return rules.message || `Giá trị tối đa là ${rules.max}`;
    }

    // Email
    if (rules.email && typeof value === 'string') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return rules.message || 'Email không hợp lệ';
        }
    }

    // Phone
    if (rules.phone && typeof value === 'string') {
        const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
            return rules.message || 'Số điện thoại không hợp lệ';
        }
    }

    // Custom validation
    if (rules.custom && !rules.custom(value)) {
        return rules.message || 'Giá trị không hợp lệ';
    }

    return null;
}

/**
 * Validate toàn bộ form
 */
export function validateForm(
    data: Record<string, any>,
    rules: Record<string, ValidationRule>
): ValidationResult {
    const errors: Record<string, string> = {};

    Object.keys(rules).forEach((field) => {
        const error = validateField(data[field], rules[field]);
        if (error) {
            errors[field] = error;
        }
    });

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}

/**
 * Validation rules thông dụng
 */
export const commonRules = {
    required: (message?: string): ValidationRule => ({
        required: true,
        message: message || 'Trường này là bắt buộc',
    }),

    email: (message?: string): ValidationRule => ({
        email: true,
        message: message || 'Email không hợp lệ',
    }),

    phone: (message?: string): ValidationRule => ({
        phone: true,
        message: message || 'Số điện thoại không hợp lệ (10-11 số)',
    }),

    minLength: (length: number, message?: string): ValidationRule => ({
        minLength: length,
        message: message || `Tối thiểu ${length} ký tự`,
    }),

    maxLength: (length: number, message?: string): ValidationRule => ({
        maxLength: length,
        message: message || `Tối đa ${length} ký tự`,
    }),

    minValue: (min: number, message?: string): ValidationRule => ({
        min,
        message: message || `Giá trị tối thiểu là ${min}`,
    }),

    maxValue: (max: number, message?: string): ValidationRule => ({
        max,
        message: message || `Giá trị tối đa là ${max}`,
    }),

    pattern: (regex: RegExp, message?: string): ValidationRule => ({
        pattern: regex,
        message: message || 'Định dạng không hợp lệ',
    }),

    // Validation cho mật khẩu mạnh
    strongPassword: (message?: string): ValidationRule => ({
        minLength: 8,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        message: message || 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
    }),

    // Validation cho số BHYT (15 ký tự)
    bhytCard: (message?: string): ValidationRule => ({
        pattern: /^[A-Z0-9]{15}$/,
        message: message || 'Số thẻ BHYT phải có 15 ký tự (chữ in hoa và số)',
    }),

    // Validation cho CCCD (12 số)
    cccd: (message?: string): ValidationRule => ({
        pattern: /^\d{12}$/,
        message: message || 'Số CCCD phải có 12 chữ số',
    }),
};

/**
 * Hook-like function để sử dụng trong component
 */
export function useFormValidation<T extends Record<string, any>>(
    initialData: T,
    rules: Record<keyof T, ValidationRule>
) {
    const validate = (data: T): ValidationResult => {
        return validateForm(data, rules);
    };

    const validateSingleField = (field: keyof T, value: any): string | null => {
        return validateField(value, rules[field]);
    };

    return {
        validate,
        validateSingleField,
    };
}
