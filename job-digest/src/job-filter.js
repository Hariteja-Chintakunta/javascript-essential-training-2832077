// ABOUTME: Classifies LinkedIn alert listings for Pega QA roles.
// ABOUTME: Separates basic automation matches from exclusions and reviews.
const rolePattern = /\b(?:qa|quality assurance|test|testing)\b.{0,30}\bengineer\b|\bengineer\b.{0,30}\b(?:qa|quality assurance|test|testing)\b/i;
const pegaPattern = /\bpega\b/i;
const automationTitlePattern = /\bautomation\b/i;
const highAutomationPattern = /\b(?:advanced|extensive|expert|strong)\s+(?:test\s+)?automation\b|\bautomation\b.{0,60}\b(?:advanced|extensive|expert|strong)\b/i;
const automationYearsPattern = /\b(?:[3-9]|\d{2,})\+?\s+years?\b.{0,80}\bautomation\b|\bautomation\b.{0,80}\b(?:[3-9]|\d{2,})\+?\s+years?\b/i;
const basicAutomationPattern = /\b(?:basic|limited|some|foundational)\b.{0,50}\bautomation\b|\bautomation\b.{0,50}\b(?:basic|limited|some|foundational)\b|\b(?:exposure|familiarity)\s+to\s+(?:test\s+)?automation\b|\bautomation\s+(?:is\s+)?not\s+required\b/i;

function classifyJob(job) {
  const title = job.title || "";
  const description = job.description || "";

  if (!pegaPattern.test(title) || !rolePattern.test(title) || automationTitlePattern.test(title)) {
    return {
      status: "excluded",
      reason: "Title is not a Pega QA or test-engineering role.",
    };
  }

  if (
    highAutomationPattern.test(description) ||
    automationYearsPattern.test(description)
  ) {
    return {
      status: "excluded",
      reason: "The listing describes substantial automation experience.",
    };
  }

  if (basicAutomationPattern.test(description)) {
    return {
      status: "match",
      reason: "The listing describes basic or limited automation experience.",
    };
  }

  return {
    status: "review",
    reason: "The alert does not confirm the automation experience level.",
  };
}

module.exports = { classifyJob };
