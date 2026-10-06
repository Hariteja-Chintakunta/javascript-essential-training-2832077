// ABOUTME: Authenticates the utility to Microsoft Graph as the mailbox owner.
// ABOUTME: Persists MSAL tokens in a Windows-protected cache.
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const {
  InteractionRequiredAuthError,
  PublicClientApplication,
} = require("@azure/msal-node");
const {
  DataProtectionScope,
  FilePersistenceWithDataProtection,
  PersistenceCachePlugin,
} = require("@azure/msal-node-extensions");

const scopes = ["Mail.Read", "Mail.Send"];

async function getGraphAccessToken(clientId, tenantId) {
  const cacheDirectory = path.join(
    process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local"),
    "PegaQaJobDigest",
  );
  const cachePath = path.join(cacheDirectory, "msal-cache.json");
  await fs.mkdir(cacheDirectory, { recursive: true });

  const persistence = await FilePersistenceWithDataProtection.create(
    cachePath,
    DataProtectionScope.CurrentUser,
  );
  const application = new PublicClientApplication({
    auth: {
      clientId,
      authority: `https://login.microsoftonline.com/${tenantId}`,
    },
    cache: {
      cachePlugin: new PersistenceCachePlugin(persistence),
    },
  });

  const accounts = await application.getTokenCache().getAllAccounts();

  if (accounts.length > 0) {
    try {
      const result = await application.acquireTokenSilent({
        account: accounts[0],
        scopes,
      });
      return result.accessToken;
    } catch (error) {
      if (!(error instanceof InteractionRequiredAuthError)) {
        throw error;
      }
    }
  }

  const result = await application.acquireTokenByDeviceCode({
    scopes,
    deviceCodeCallback: (response) => console.log(response.message),
  });

  return result.accessToken;
}

module.exports = { getGraphAccessToken };