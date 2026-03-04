import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    moduleFileExtensions: ['ts', 'js'],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
    transform: { '^.+\\.ts$': 'ts-jest' },
    testMatch: ['**/*.test.ts'],
};

export default config;