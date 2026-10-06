// ABOUTME: Verifies extraction of job cards from LinkedIn alert messages.
// ABOUTME: Ensures unrelated senders and non-job links are ignored.
const assert = require("node:assert/strict");
const test = require("node:test");
const { extractJobsFromAlerts } = require("../src/linkedin-alerts.js");

test("extracts a LinkedIn job link and its card description", () => {
  const jobs = extractJobsFromAlerts([
    {
      from: { emailAddress: { address: "jobs-noreply@linkedin.com" } },
      body: {
        contentType: "html",
        content: "<ul><li><a href=\"https://www.linkedin.com/jobs/view/123\">Pega QA Engineer</a><p>Basic automation exposure.</p></li></ul>",
      },
    },
  ]);

  assert.deepEqual(jobs, [
    {
      title: "Pega QA Engineer",
      url: "https://www.linkedin.com/jobs/view/123",
      description: "Pega QA Engineer Basic automation exposure.",
    },
  ]);
});

test("ignores unrelated senders and links outside LinkedIn job pages", () => {
  const jobs = extractJobsFromAlerts([
    {
      from: { emailAddress: { address: "alerts@example.com" } },
      body: {
        contentType: "html",
        content: "<a href=\"https://www.linkedin.com/jobs/view/456\">Pega QA Engineer</a>",
      },
    },
    {
      from: { emailAddress: { address: "jobs-noreply@linkedin.com" } },
      body: {
        contentType: "html",
        content: "<a href=\"https://example.com/jobs/view/789\">Pega QA Engineer</a>",
      },
    },
  ]);

  assert.deepEqual(jobs, []);
});