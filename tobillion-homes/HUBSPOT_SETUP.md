# Tobillion Homes — HubSpot CRM Integration Guide

## 📋 Overview
This guide covers setting up HubSpot to capture leads from the Tobillion Homes website.
All forms (contact, valuation, tour requests, exit-intent popup) send data directly to HubSpot.

---

## 1️⃣ Create HubSpot Account

1. Go to [hubspot.com](https://hubspot.com) and sign up (free tier available)
2. Choose "Sales" or "Marketing" hub starter
3. Complete onboarding

---

## 2️⃣ Get Your Portal ID

1. In HubSpot, click the Settings icon (⚙️) in top navigation
2. Go to **Account Setup** → **Account Name & Branding**
3. Find **Portal ID** (a 6-7 digit number)
4. Copy to environment variable: `NEXT_PUBLIC_HUBSPOT_PORTAL_ID`

---

## 3️⃣ Create API Key

### Private App Token (Recommended)

1. Settings → **Integrations** → **Private Apps**
2. Click **Create Private App**
3. Name: `Tobillion Website Integration`
4. Scopes required:
   - `crm.objects.contacts.write`
   - `crm.objects.contacts.read`
   - `forms.forms.write`
   - `forms.forms.read`
5. Click **Create** → copy the token
6. Set as `HUBSPOT_API_KEY` in environment variables

---

## 4️⃣ Create HubSpot Forms

You can either:
- **A) Use existing forms** — update `formId` in components/forms/HubSpotForm.tsx
- **B) Create new forms** — follow below

### Create Contact Form
1. Marketing → Lead Capture → Forms
2. Click **Create Form** → **Embedded Form**
3. Add fields: First Name, Last Name, Email, Phone, Message
4. Save → copy Form ID from URL (e.g., `XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`)
5. Pass `formId` prop to HubSpotForm component

### Create Property Inquiry Form
- Copy Contact Form but add fields: Property Type, Neighborhood, Budget Range

### Create Valuation Form
- Fields: Name, Email, Phone, Property Type, Neighborhood, Estimated Value

---

## 5️⃣ Connect Forms to Website

In any component, use the HubSpotForm:

```tsx
<HubSpotForm
  portalId={process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID}
  formId="your-form-id-here"
  title="Interested in this property?"
  submitLabel="Send Inquiry"
/>
```

The form POSTs to `/api/hubspot` which forwards to HubSpot API.

---

## 6️⃣ Set Up Email Automation

### New Contact Follow-up
1. Automation → Workflows → **Create Workflow**
2. Trigger: **Contact is created**
3. Action: **Send internal email notification** to sales team
4. Delay: 5 minutes
5. Action: **Send follow-up email** to contact

### Property Alert Emails
1. Create a **Contact-based workflow**
2. Trigger: **Contact property preference matches**
3. Send: **Custom email with matching listings**
4. Frequency: Daily digest or instant as per user preference

### Abandoned Form Workflow
1. Trigger: **Contact submitted form but didn't complete**
2. Action: Send reminder email after 24 hours

---

## 7️⃣ Dashboard & Analytics

### View Leads
- CRM → Contacts → filter by "Tobillion Website" source
- Create custom views: "New Leads Today", "Hot Properties", "Valuation Requests"

### Track Performance
- Reports → Dashboards → **Create Dashboard**
- Add panels:
  - Form submissions over time
  - Lead source breakdown
  - Conversion rate by page

### Set Up Call Tracking
- Sales → Calling → Connect a phone number
- Log calls automatically from contact records

---

## 8️⃣ API Routes Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/hubspot` | POST | Submit form data to HubSpot |
| `/api/hubspot` | GET | Check HubSpot configuration status |

### POST /api/hubspot Payload
```json
{
  "portalId": "1234567",
  "formId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "fields": [
    { "name": "firstname", "value": "John" },
    { "name": "email", "value": "john@example.com" }
  ],
  "context": {
    "pageUri": "https://tobillionhomes.co.ke/properties/luxury-villa",
    "pageName": "Luxury Villa in Kilimani"
  }
}
```

---

## 9️⃣ Testing

1. Open website in incognito mode
2. Fill out and submit a HubSpot form
3. Check HubSpot CRM → Contacts → new contact should appear
4. Verify all fields mapped correctly
5. Test email automation by triggering workflows

---

## 🔟 Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Verify `HUBSPOT_API_KEY` is correct |
| 404 Form Not Found | Check `formId` and `portalId` values |
| Fields not mapping | Field names must match HubSpot field internal names |
| Contacts not appearing | Check workflow enrollment triggers |
| Rate limiting | HubSpot allows 100 requests per 10 seconds |

For additional help: [HubSpot Developer Docs](https://developers.hubspot.com/)
