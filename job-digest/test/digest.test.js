// ABOUTME: Verifies safe HTML rendering for the job digest email.
// ABOUTME: Ensures email-provided text and links cannot inject markup.
const assert = require("node:assert/strict");
const test = require("node:test");
const cheerio = require("cheerio");
const { renderDigest } = require("../src/digest.js");

test("escapes listing content before adding it to the email body", () => {
  const html = renderDigest({
    matches: [{
      title: "Pega QA <Engineer>",
      url: "https://www.linkedin.com/jobs/view/123?x=\" onmouseover=\"bad()",
      description: "Basic automation & manual testing.",
    }],
    reviews: [],
  });

  assert.match(html, /Pega QA &lt;Engineer&gt;/);
  assert.match(html, /Basic automation &amp; manual testing\./);
  assert.equal(cheerio.load(html)("a").attr("onmouseover"), undefined);
});