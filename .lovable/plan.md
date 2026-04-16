

## Fix Razorpay Authentication — Update API Keys

The Razorpay integration keeps returning "Authentication failed" because the stored credentials are invalid. Here's the plan:

### What needs to happen

1. **Prompt you to re-enter both Razorpay secrets** — `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` with fresh values from your Razorpay Dashboard.

2. **Test the edge function** immediately after to confirm the new keys work.

### Before approving — get your keys ready

Go to your [Razorpay Dashboard → Settings → API Keys](https://dashboard.razorpay.com/app/website-app-settings/api-keys):
- **Generate a new key pair** (this invalidates old ones)
- Copy the **Key ID** (starts with `rzp_test_` or `rzp_live_`)
- Copy the **Key Secret** (shown only once — save it immediately)

### Technical details
- No code changes needed — the edge function already reads from environment variables
- We'll use the secrets tool to update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
- After updating, we'll call the edge function to verify authentication succeeds

