# Local Smoke Checklist

Run backend on `:8000` and frontend on `:3000`.

## Authentication
- [ ] Email/password login succeeds.
- [ ] Invalid password shows API error.
- [ ] Google login succeeds with configured OAuth origin/client.

## Display Flows
- [ ] Register display with password returns pending + token.
- [ ] Register display without password returns pending + token.
- [ ] `/display-login` password mode works for password-enabled display.
- [ ] `/display-login` token mode works after approval.
- [ ] Password mode on passwordless display shows connection-token guidance.
- [ ] Pending display via token shows waiting state.
- [ ] Rejected display shows rejection reason.

## Connection Request Admin Flow
- [ ] Pending requests list loads without parser errors.
- [ ] Approve updates status and enables token login.
- [ ] Reject updates status and reason is visible.

## Advertisement Upload
- [ ] File upload path (image) uploads via signed URL and creates ad.
- [ ] File upload path (video) honors size cap.
- [ ] URL mode ad creation works.

## Dashboard Modules
- [ ] Ads page loads.
- [ ] Displays page loads.
- [ ] Display loops page loads.
- [ ] Logs page loads.
- [ ] Analytics page loads.
- [ ] Profile page loads.
