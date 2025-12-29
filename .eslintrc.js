module.exports = {
    root: true,
    env: {
        node: true,
        browser: true,
        es2020: true
    },
    extends: [
        'eslint:recommended',
        'plugin:vue/vue3-recommended',
        '@vue/typescript/recommended'
    ],
    parser: 'vue-eslint-parser',
    parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 2020,
        sourceType: 'module',
        extraFileExtensions: ['.vue']
    },
    rules: {
        'vue/multi-word-component-names': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        'vue/no-v-html': 'off'
    },
    ignorePatterns: ['dist/**', 'node_modules/**']
};