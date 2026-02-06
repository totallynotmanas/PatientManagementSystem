// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

Object.assign(global, { TextEncoder, TextDecoder });

// Polyfill ResizeObserver (needed for Recharts)
global.ResizeObserver = class ResizeObserver {
   observe() { }
   unobserve() { }
   disconnect() { }
};

// Polyfill matchMedia
global.matchMedia = global.matchMedia || function (query) {
   return {
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
   };
};
