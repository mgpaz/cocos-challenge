require('@testing-library/jest-dom');
jest.setTimeout(30000);
globalThis['process.env'] = { ...process.env };

beforeAll(() => {
  console.log('Setting up global configurations for tests...');
});