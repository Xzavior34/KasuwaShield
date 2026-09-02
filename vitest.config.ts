// Plain config object (no `vitest/config` import) so this resolves even
// before `npm install` has been run and vitest is invoked via `npx`.
export default {
  test: {
    include: ["test/**/*.test.ts", "packages/**/*.test.ts"],
    // `ref/` vendors the DreamDEX bot-kit and hackathon starter template for
    // reference only — it is not part of this project and its own test
    // suites depend on packages that aren't installed here.
    exclude: ["ref/**", "node_modules/**", "**/node_modules/**"],
  },
};
