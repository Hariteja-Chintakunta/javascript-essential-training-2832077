// ABOUTME: Reads recent Outlook messages and sends the daily job digest.
// ABOUTME: Uses the Microsoft Graph REST API with delegated user permissions.
const graphRoot = "https://graph.microsoft.com/v1.0";

async function requestGraph(accessToken, url, options = {}) {
  const response = await fetch(url, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });

  if (response.status === 202 || response.status === 204) {
    return null;
  }

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const message = result?.error?.message || response.statusText;
    throw new Error(`Microsoft Graph request failed (${response.status}): ${message}`);
  }

  return result;
}

async function listInboxMessagesSince(accessToken, since) {
  const url = new URL(`${graphRoot}/me/mailFolders/inbox/messages`);
  url.searchParams.set("$select", "from,subject,receivedDateTime,body");
  url.searchParams.set("$filter", `receivedDateTime ge ${since.toISOString()}`);
  url.searchParams.set("$orderby", "receivedDateTime desc");
  url.searchParams.set("$top", "100");

  const messages = [];
  let nextUrl = url.toString();

  while (nextUrl) {
    const page = await requestGraph(accessToken, nextUrl, {
      headers: { Prefer: 'outlook.body-content-type="html"' },
    });
    messages.push(...(page.value || []));
    nextUrl = page["@odata.nextLink"] || null;
  }

  return messages;
}

async function sendDigest(accessToken, recipient, subject, html) {
  return requestGraph(accessToken, `${graphRoot}/me/sendMail`, {
    method: "POST",
    body: {
      message: {
        subject,
        body: { contentType: "HTML", content: html },
        toRecipients: [{ emailAddress: { address: recipient } }],
      },
    },
  });
}

module.exports = { listInboxMessagesSince, sendDigest };