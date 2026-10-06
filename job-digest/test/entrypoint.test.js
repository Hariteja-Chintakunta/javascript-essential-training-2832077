// ABOUTME: Verifies importing the command entrypoint has no side effects.
// ABOUTME: The inbox workflow should run only when the script is launched.
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");

test("importing the entrypoint does not start the workflow", () => {
  const entrypoint = path.join(__dirname, "..", "src", "index.js");
  const result = spawnSync(process.execPath, ["-e", `require(${JSON.stringify(entrypoint)})`], {
    encoding: "utf8",
  });

  assert.equal(result.status, 0);
  assert.equal(result.stderr, "");
});