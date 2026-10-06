# Pega QA Job Digest

This Windows utility reads LinkedIn job-alert emails from an Outlook inbox and sends a daily digest to your email address. It does not scrape LinkedIn or submit applications.

It tracks job links already emailed. The first run checks alerts received in the previous 24 hours; later runs check from the last successful digest and omit links already shown. LinkedIn alert emails may not include the actual posting date, so “new” means a previously unseen job link from a newly received alert, not an independently verified posting date.

## Matching rules

- A listing title must contain `Pega` and a QA, quality assurance, or test-engineer role.
- A listing is a match only when the alert text explicitly describes basic, limited, or similar automation experience.
- Listings that state substantial automation requirements are excluded.
- Listings whose alert text does not reveal the automation requirement appear under **Needs review**. LinkedIn alert emails often omit the full job description, so the utility cannot verify those requirements by itself.

## Setup

1. In LinkedIn, create a daily job alert for `Pega QA Engineer`, choose your preferred location, and make sure it is delivered to the Outlook inbox you will connect.
2. In Microsoft Entra, register an app for accounts that match your Outlook account type. Enable public-client/device-code authentication and add the delegated Microsoft Graph permissions `Mail.Read` and `Mail.Send`. Grant consent if your organization requires it.
3. Install dependencies from this folder with `npm install`. If npm reports that `keytar`'s install script was blocked, approve and build it with:

   ```powershell
   npm install-scripts approve keytar
   npm rebuild keytar
   ```

4. Copy `.env.example` to `.env` and set `MS_CLIENT_ID` to the app registration's client ID and `DIGEST_EMAIL` to the address that should receive the digest. Keep `.env` private.
5. Run `npm test`, then `npm start`. The first run displays a device sign-in code. Sign in with the Outlook account that receives the LinkedIn alerts and approve the requested Graph permissions.

MSAL stores its token cache under your local Windows profile and protects it with Windows DPAPI. Run the scheduled task as the same Windows user.

## Run daily at 10 PM

After completing setup and successfully running `npm start` once, register the 10 PM local-time task from this folder:

```powershell
.\register-task.ps1
```

The task runs as the current Windows user. The PC must be awake and that user must be logged in at 10 PM. Each run sends a digest, including a no-new-jobs message when all links have already been shown.