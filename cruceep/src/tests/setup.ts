import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Reset the DOM and localStorage between tests for isolation.
afterEach(() => {
  cleanup();
  try {
    window.localStorage.clear();
  } catch {
    // jsdom localStorage may be unavailable in some environments
  }
});
