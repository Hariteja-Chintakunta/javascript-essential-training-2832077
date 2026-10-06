// ABOUTME: Loads and saves the digest's sent-job history.
// ABOUTME: Filters out links already delivered in earlier digests.
const fs = require("node:fs/promises");
const path = require("node:path");

function createEmptyState() {
  return { lastSuccessfulRun: null, seenUrls: [] };
}

function isValidState(state) {
  const validRun = state.lastSuccessfulRun === null || (
    typeof state.lastSuccessfulRun === "string" &&
    !Number.isNaN(Date.parse(state.lastSuccessfulRun))
  );

  return validRun && Array.isArray(state.seenUrls) && state.seenUrls.every((url) => typeof url === "string");
}

async function loadJobState(filePath) {
  try {
    const state = JSON.parse(await fs.readFile(filePath, "utf8"));

    if (!state || !isValidState(state)) {
      throw new Error("The saved job history has an invalid format.");
    }

    return state;
  } catch (error) {
    if (error.code === "ENOENT") {
      return createEmptyState();
    }

    throw error;
  }
}

async function saveJobState(filePath, state) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function getNewJobs(jobs, state) {
  const seenUrls = new Set(state.seenUrls);
  const newJobs = [];

  for (const job of jobs) {
    if (job.url && !seenUrls.has(job.url)) {
      seenUrls.add(job.url);
      newJobs.push(job);
    }
  }

  return newJobs;
}

module.exports = { getNewJobs, loadJobState, saveJobState };