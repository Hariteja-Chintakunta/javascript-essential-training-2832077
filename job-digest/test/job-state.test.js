// ABOUTME: Verifies persistent history for jobs already included in a digest.
// ABOUTME: Uses temporary files to exercise the real local state storage.
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { getNewJobs, loadJobState, saveJobState } = require("../src/job-state.js");

test("filters previously sent links and duplicate links in the same alert batch", () => {
  const state = {
    lastSuccessfulRun: "2026-10-05T22:00:00.000Z",
    seenUrls: ["https://www.linkedin.com/jobs/view/old"],
  };
  const jobs = [
    { title: "Previously sent", url: "https://www.linkedin.com/jobs/view/old" },
    { title: "New listing", url: "https://www.linkedin.com/jobs/view/new" },
    { title: "Duplicate alert", url: "https://www.linkedin.com/jobs/view/new" },
  ];

  assert.deepEqual(getNewJobs(jobs, state), [jobs[1]]);
});

test("loads an empty history when no state file exists", async (context) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "job-digest-state-"));
  context.after(() => fs.rm(directory, { recursive: true, force: true }));

  assert.deepEqual(await loadJobState(path.join(directory, "state.json")), {
    lastSuccessfulRun: null,
    seenUrls: [],
  });
});

test("saves and reloads the last successful run and sent links", async (context) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "job-digest-state-"));
  context.after(() => fs.rm(directory, { recursive: true, force: true }));
  const filePath = path.join(directory, "nested", "state.json");
  const state = {
    lastSuccessfulRun: "2026-10-06T22:00:00.000Z",
    seenUrls: ["https://www.linkedin.com/jobs/view/123"],
  };

  await saveJobState(filePath, state);

  assert.deepEqual(await loadJobState(filePath), state);
});