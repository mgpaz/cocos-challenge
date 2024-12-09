module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest', // Esto asegura que Jest use ts-jest para archivos .ts y .tsx
  },
  transformIgnorePatterns: [
    "node_modules/(?!@nestjs|some-other-package)" // Asegúrate de que las dependencias necesarias sean transformadas
  ],
  setupFilesAfterEnv: ['<rootDir>/../jest.setup.js'], // Asegúrate de que el setup se cargue correctamente
  preset: 'ts-jest', // Usa el preset ts-jest para manejar TypeScript
  globals: {
    'ts-jest': {
      isolatedModules: true, // Esto ayuda si tienes problemas con la compilación de tipos
    },
  },
};