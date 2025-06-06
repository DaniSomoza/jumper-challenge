const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ['<rootDir>/src/test/testSetup.ts'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  transform: {
    ...tsJestTransformCfg,
  },
};