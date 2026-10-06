// ABOUTME: Renders a daily email from filtered LinkedIn job listings.
// ABOUTME: Escapes all alert content before embedding it in HTML.
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[character]);
}

function renderListing(job, needsReview) {
  const description = job.description.length > 700
    ? `${job.description.slice(0, 697)}...`
    : job.description;
  const reviewNote = needsReview
    ? "<p>The alert does not show the automation requirement. Review the listing before applying.</p>"
    : "";

  return `<li><h3><a href="${escapeHtml(job.url)}">${escapeHtml(job.title)}</a></h3><p>${escapeHtml(description)}</p>${reviewNote}</li>`;
}

function renderSection(title, jobs, needsReview) {
  if (jobs.length === 0) {
    return "";
  }

  return `<section><h2>${title} (${jobs.length})</h2><ul>${jobs.map((job) => renderListing(job, needsReview)).join("")}</ul></section>`;
}

function renderDigest({ matches, reviews }) {
  const content = [
    renderSection("Basic automation matches", matches, false),
    renderSection("Needs review", reviews, true),
  ].filter(Boolean).join("");

  return `<!doctype html><html><body><main style="font-family:Arial,sans-serif;line-height:1.5;color:#222;max-width:720px;margin:0 auto;padding:16px"><h1>Pega QA job digest</h1>${content || "<p>No matching Pega QA jobs were found in LinkedIn alerts received during the last 24 hours.</p>"}</main></body></html>`;
}

module.exports = { renderDigest };