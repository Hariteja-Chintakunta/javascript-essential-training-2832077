// ABOUTME: Runs the daily Pega QA job-alert digest workflow.
// ABOUTME: Filters Outlook messages and emails matching LinkedIn job links.
require("dotenv").config({ quiet: true });
const os = require("node:os");
const path = require("node:path");
const { getGraphAccessToken } = require("./auth.js");
const { renderDigest } = require("./digest.js");
const { listInboxMessagesSince, sendDigest } = require("./graph-client.js");
const { extractJobsFromAlerts } = require("./linkedin-alerts.js");
const { classifyJob } = require("./job-filter.js");
const { getNewJobs, loadJobState, saveJobState } = require("./job-state.js");

async function main() {
  const clientId = process.env.MS_CLIENT_ID;
  const tenantId = process.env.MS_TENANT_ID || "common";
  const recipient = process.env.DIGEST_EMAIL;

  if (!clientId || !recipient) {
    throw new Error("Set MS_CLIENT_ID and DIGEST_EMAIL in the .env file.");
  }

  const runStartedAt = new Date();
  const stateDirectory = path.join(
    process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local"),
    "PegaQaJobDigest",
  );
  const statePath = path.join(stateDirectory, "job-state.json");
  const state = await loadJobState(statePath);
  const since = state.lastSuccessfulRun
    ? new Date(state.lastSuccessfulRun)
    : new Date(runStartedAt.getTime() - 24 * 60 * 60 * 1000);
  const accessToken = await getGraphAccessToken(clientId, tenantId);
  const messages = await listInboxMessagesSince(accessToken, since);
  const jobs = getNewJobs(extractJobsFromAlerts(messages), state);
  const matches = [];
  const reviews = [];

  for (const job of jobs) {
    const classification = classifyJob(job);

    if (classification.status === "match") {
      matches.push(job);
    } else if (classification.status === "review") {
      reviews.push(job);
    }
  }

  const date = new Date().toISOString().slice(0, 10);
  const subject = `Pega QA job digest - ${date}`;
  await sendDigest(accessToken, recipient, subject, renderDigest({ matches, reviews }));
  await saveJobState(statePath, {
    lastSuccessfulRun: runStartedAt.toISOString(),
    seenUrls: [...new Set([
      ...state.seenUrls,
      ...matches.map((job) => job.url),
      ...reviews.map((job) => job.url),
    ])],
  });
  console.log(`Digest sent: ${matches.length} basic matches, ${reviews.length} need review.`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { main };