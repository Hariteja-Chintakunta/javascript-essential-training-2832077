// ABOUTME: Verifies classification of Pega QA job-alert listings.
// ABOUTME: Covers role matching and automation-experience screening.
const assert = require("node:assert/strict");
const test = require("node:test");
const { classifyJob } = require("../src/job-filter.js");

test("accepts Pega QA roles that describe basic automation", () => {
  const result = classifyJob({
    title: "Pega QA Engineer",
    description: "Manual testing with basic automation exposure.",
  });

  assert.equal(result.status, "match");
});

test("rejects jobs that require extensive automation experience", () => {
  const result = classifyJob({
    title: "Pega QA Engineer",
    description: "Requires 5 years of test automation framework experience.",
  });

  assert.equal(result.status, "excluded");
});

test("sets aside role matches when automation requirements are missing", () => {
  const result = classifyJob({
    title: "Pega QA Engineer",
    description: "",
  });

  assert.equal(result.status, "review");
});

test("rejects roles that are not Pega QA or test-engineering jobs", () => {
  const result = classifyJob({
    title: "Pega Automation Developer",
    description: "Basic automation exposure.",
  });

  assert.equal(result.status, "excluded");
});

test("rejects Pega QA roles without an engineer title", () => {
  const result = classifyJob({
    title: "Pega QA Analyst",
    description: "Basic automation exposure.",
  });

  assert.equal(result.status, "excluded");
});

test("rejects automation-focused engineer titles", () => {
  const result = classifyJob({
    title: "Pega QA Automation Engineer",
    description: "Basic automation exposure.",
  });

  assert.equal(result.status, "excluded");
});
