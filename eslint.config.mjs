// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    eslint.configs.recommended,
    // tseslint.configs.recommended,
    tseslint.configs.strict,
    tseslint.configs.stylistic,
    {
        rules: {
            // Add any additional rules or overrides here
            'no-console': 'warn', // Example rule: warn on console statements
            'eqeqeq': 'error', // Example rule: enforce strict equality
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }] // Ignore unused vars with leading underscore
        }
    }
);