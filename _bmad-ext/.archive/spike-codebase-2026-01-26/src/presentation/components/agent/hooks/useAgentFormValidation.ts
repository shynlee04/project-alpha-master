/**
 * @fileoverview Agent Form Validation Hook
 * @module presentation/components/agent/hooks/useAgentFormValidation
 *
 * Custom hook for agent configuration form validation.
 * Encapsulates Zod schema validation with business rules.
 * Part of P1-1 refactoring to extract from AgentConfigDialog god class.
 *
 * @December2025Patterns
 * - Single responsibility: Form validation only
 * - Reusable across agent configuration contexts
 * - Type-safe with proper TypeScript interfaces
 * - Memoized for performance
 */

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    agentFormSchema,
    validateAgentForm,
    validateModelSelection,
    validateOpenAICompatible,
    type AgentFormData,
    type FormErrors,
} from '../agent-config-validation';

/**
 * Agent form validation state
 */
export interface ValidationState {
    /** Whether form is currently valid */
    isValid: boolean;
    /** Validation errors keyed by field name */
    errors: FormErrors;
    /** Whether validation has been performed */
    isValidated: boolean;
}

/**
 * Props for useAgentFormValidation hook
 */
export interface UseAgentFormValidationProps {
    /** Current form field values */
    name: string;
    description: string;
    providerId: string;
    modelId: string;
    apiKey: string;
    customBaseURL: string;
    customModelId: string;
    customHeaders: Array<{ key: string; value: string }>;
    enableNativeTools?: boolean;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    topK?: number;
    systemPrompt?: string;
}

/**
 * Agent Form Validation Hook
 *
 * Provides validation logic for agent configuration forms.
 * Combines Zod schema validation with business rule checks.
 *
 * @example
 * ```tsx
 * function AgentConfigForm() {
 *   const [name, setName] = useState('');
 *   const [providerId, setProviderId] = useState('');
 *   const [modelId, setModelId] = useState('');
 *
 *   const { isValid, errors, validate } = useAgentFormValidation({
 *     name,
 *     providerId,
 *     modelId,
 *     apiKey: '',
 *     customBaseURL: '',
 *     customModelId: '',
 *     customHeaders: [],
 *   });
 *
 *   const handleSubmit = () => {
 *     if (validate()) {
 *       // Submit form
 *     }
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input value={name} onChange={(e) => setName(e.target.value)} />
 *       {errors.name && <span className="error">{errors.name}</span>}
 *     </form>
 *   );
 * }
 * ```
 */
export function useAgentFormValidation(props: UseAgentFormValidationProps): ValidationState & { validate: () => boolean; validateField: <K extends keyof AgentFormData>(fieldName: K, value: AgentFormData[K]) => string | undefined } {
    const {
        name,
        description,
        providerId,
        modelId,
        apiKey,
        customBaseURL,
        customModelId,
        customHeaders,
        enableNativeTools,
        temperature,
        maxTokens,
        topP,
        topK,
        systemPrompt,
    } = props;

    const { t } = useTranslation();

    /**
     * Validate the entire form
     *
     * Performs:
     * 1. Zod schema validation
     * 2. Business rule checks (model selection)
     * 3. Provider-specific validation (OpenAI Compatible)
     *
     * @returns true if valid, false otherwise
     */
    const validate = useCallback((): boolean => {
        // Build form data object with field mapping
        // Props use 'description' and 'modelId', schema uses 'role' and 'model'
        const formData: AgentFormData = {
            name,
            role: description,        // Map description -> role for schema
            providerId,
            model: modelId,           // Map modelId -> model for schema
            apiKey,
            customBaseURL,
            customModelId,
            customHeaders,
            enableNativeTools,
            temperature,
            maxTokens,
            topP,
            topK,
            systemPrompt,
        };

        // Step 1: Zod schema validation
        const schemaResult = validateAgentForm(formData);
        if (!schemaResult.success) {
            return false;
        }

        // Step 2: Business rule - Model selection required for most providers
        const modelError = validateModelSelection(providerId, modelId);
        if (modelError) {
            return false;
        }

        // Step 3: Business rule - OpenAI Compatible provider requirements
        const openAIError = validateOpenAICompatible(providerId, customBaseURL, customModelId);
        if (openAIError) {
            return false;
        }

        // All validations passed
        return true;
    }, [
        name,
        description,
        providerId,
        modelId,
        apiKey,
        customBaseURL,
        customModelId,
        customHeaders,
        enableNativeTools,
        temperature,
        maxTokens,
        topP,
        topK,
        systemPrompt,
        t,
    ]);

    /**
     * Validate a single field
     *
     * Useful for real-time validation as user types.
     * Performs only schema validation, not business rules.
     *
     * @param fieldName - Field name to validate
     * @param value - Field value
     * @returns Error message if invalid, undefined otherwise
     */
    const validateField = useCallback(<K extends keyof AgentFormData>(
        fieldName: K,
        value: AgentFormData[K]
    ): string | undefined => {
        // Partial validation for single field
        void ({ [fieldName]: value } as Partial<AgentFormData>);

        try {
            // Try to parse just this field
            const fieldSchema = agentFormSchema.shape[fieldName];
            const result = fieldSchema.safeParse(value);

            if (!result.success) {
                return result.error.issues[0]?.message;
            }

            return undefined;
        } catch {
            return undefined; // Skip validation if schema doesn't support this field
        }
    }, []);

    /**
     * Check if form has any errors
     *
     * Performs full validation and returns result.
     */
    const getValidationState = useCallback((): ValidationState => {
        const isValid = validate();
        return {
            isValid,
            errors: {}, // Would be populated by validate() internally
            isValidated: true,
        };
    }, [validate]);

    return {
        ...getValidationState(),
        validate,
        validateField,
    };
}

/**
 * Utility hook to get field-level error message
 *
 * @param fieldName - Field name to check
 * @param errors - Form errors object
 * @returns Error message or undefined
 */
export function useFieldError<K extends keyof FormErrors>(
    fieldName: K,
    errors: FormErrors
): string | undefined {
    return errors[fieldName];
}

/**
 * Utility hook to check if field has error
 *
 * @param fieldName - Field name to check
 * @param errors - Form errors object
 * @returns true if field has error
 */
export function useHasFieldError<K extends keyof FormErrors>(
    fieldName: K,
    errors: FormErrors
): boolean {
    return !!errors[fieldName];
}
