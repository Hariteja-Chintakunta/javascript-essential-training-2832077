// ABOUTME: Extracts job listings from LinkedIn alert email messages.
// ABOUTME: Keeps each listing's text scoped to its own email card.
const cheerio = require("cheerio");

function normalizeText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function getElementText($, element) {
  const html = ($(element).html() || "").replace(/<\//g, " </");
  return normalizeText(cheerio.load(html).text());
}

function isLinkedInAddress(address) {
  const domain = (address || "").split("@").pop().toLowerCase();
  return ["linkedin.com", "linkedinmail.com"].some((knownDomain) => (
    domain === knownDomain || domain.endsWith(`.${knownDomain}`)
  ));
}

function getJobUrl(value) {
  try {
    const url = new URL(value);
    const isLinkedInHost = url.hostname === "linkedin.com" || url.hostname.endsWith(".linkedin.com");
    const isJobPage = /^\/(?:comm\/)?jobs\/view(?:\/|$)/i.test(url.pathname);

    return url.protocol === "https:" && isLinkedInHost && isJobPage
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function getCardText($, anchor, title) {
  let parent = $(anchor).parent();

  while (parent.length && parent[0].tagName !== "body") {
    const text = getElementText($, parent);
    const jobUrls = new Set(
      parent.find("a[href]").map((_, link) => getJobUrl($(link).attr("href"))).get().filter(Boolean),
    );

    if (jobUrls.size === 1 && text.length > title.length && text.length <= 1500) {
      return text;
    }

    if (jobUrls.size > 1 || text.length > 1500) {
      break;
    }

    parent = parent.parent();
  }

  return title;
}

function extractJobsFromAlerts(messages) {
  const jobs = new Map();

  for (const message of messages) {
    const address = message.from?.emailAddress?.address;
    const html = message.body?.content || "";

    if (!isLinkedInAddress(address)) {
      continue;
    }

    const $ = cheerio.load(html);

    $("a[href]").each((_, anchor) => {
      const url = getJobUrl($(anchor).attr("href"));
      const title = normalizeText($(anchor).text()) || $(anchor).attr("aria-label") || "";

      if (!url || !title || jobs.has(url)) {
        return;
      }

      jobs.set(url, {
        title,
        url,
        description: getCardText($, anchor, title),
      });
    });
  }

  return [...jobs.values()];
}

module.exports = { extractJobsFromAlerts };