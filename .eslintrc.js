module.exports = {
    root: true,
    env: { node: true, browser: true },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
    },
    plugins: ['@typescript-eslint'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:vue/vue3-recommended'
    ],
    rules: {
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        'vue/multi-word-component-names': 'off'
    },
    overrides: [
        {
            files: ['packages/client/**/*.{ts,vue}'],
            rules: {
                'vue/require-default-prop': 'off'
            }
        },
        {
            files: ['packages/server/**/*.ts'],
            rules: {
                '@typescript-eslint/no-var-requires': 'off'
            }
        }
    ]
}