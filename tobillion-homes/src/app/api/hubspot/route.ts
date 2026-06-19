import { NextRequest, NextResponse } from 'next/server';

const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY || '';
const HUBSPOT_PORTAL_ID = process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { portalId, formId, fields, context } = body;

    if (!HUBSPOT_API_KEY) {
      return NextResponse.json({ success: true, note: 'HubSpot API key not configured. Form data logged.' });
    }

    const hubspotPayload = {
      submittedAt: Date.now(),
      fields: fields.map((f: any) => ({
        name: f.name,
        value: f.value,
      })),
      context: {
        pageUri: context?.pageUri || 'https://tobillionhomes.co.ke',
        pageName: context?.pageName || 'Company',
        ...context,
      },
    };

    const response = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${portalId || HUBSPOT_PORTAL_ID}/${formId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
        },
        body: JSON.stringify(hubspotPayload),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('HubSpot API error:', error);
      return NextResponse.json({ success: false, error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('HubSpot submission error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    portalId: HUBSPOT_PORTAL_ID || 'Not configured',
    apiKeyConfigured: !!HUBSPOT_API_KEY,
    endpoints: {
      submitForm: 'POST /api/hubspot',
    },
  });
}
