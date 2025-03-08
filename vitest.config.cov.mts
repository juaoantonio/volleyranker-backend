import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ["./test/vitest.setup.ts"],
    include: ["**/*.{spec,e2e-spec,int-spec}.ts"],
    testTimeout: 60000, // 60 seconds
    hookTimeout: 60000, // 60 seconds
    root: "./",
  },

  plugins: [
    // This is required to build the test files with SWC
    tsconfigPaths(),
    swc.vite({
      // Explicitly set the module type to avoid inheriting this value from a `.swcrc` config file
      module: { type: "es6" },
    }),
  ],
});
