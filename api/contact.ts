export const config = { runtime: 'edge' };

const FROM_ADDRESS = 'onboarding@resend.dev';
const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const EVENT_TYPES = ['Wedding', 'Commercial', 'Narrative', 'Other'] as const;
const MAX_FIELD_LENGTH = 5000;

type EventType = (typeof EVENT_TYPES)[number];

interface Enquiry {
  name: string;
  email: string;
  eventType: EventType;
  date: string;
  budget: string;
  message: string;
}

declare const process: { env: Record<string, string | undefined> };

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function readString(source: Record<string, unknown>, key: string): string {
  const value = source[key];
  return typeof value === 'string' ? value.trim() : '';
}

function isEventType(value: string): value is EventType {
  return (EVENT_TYPES as readonly string[]).includes(value);
}

function validate(payload: Record<string, unknown>): Enquiry | null {
  const name = readString(payload, 'name');
  const email = readString(payload, 'email');
  const eventType = readString(payload, 'eventType');
  const date = readString(payload, 'date');
  const budget = readString(payload, 'budget');
  const message = readString(payload, 'message');

  const tooLong = [name, email, eventType, date, budget, message].some(
    (field) => field.length > MAX_FIELD_LENGTH,
  );
  if (tooLong) return null;

  if (name.length < 2) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  if (!isEventType(eventType)) return null;
  if (date.length < 1) return null;
  if (message.length < 10) return null;

  return { name, email, eventType, date, budget, message };
}

function buildText(enquiry: Enquiry): string {
  return [
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    `Event type: ${enquiry.eventType}`,
    `Date: ${enquiry.date}`,
    `Budget: ${enquiry.budget || 'Not specified'}`,
    '',
    'Message:',
    enquiry.message,
  ].join('\n');
}

function buildHtml(enquiry: Enquiry): string {
  const rows = [
    ['Name', enquiry.name],
    ['Email', enquiry.email],
    ['Event type', enquiry.eventType],
    ['Date', enquiry.date],
    ['Budget', enquiry.budget || 'Not specified'],
  ]
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;font-weight:600">${escapeHtml(String(label))}</td><td style="padding:4px 0">${escapeHtml(String(value))}</td></tr>`,
    )
    .join('');

  const message = escapeHtml(enquiry.message).replace(/\n/g, '<br />');

  return [
    '<div style="font-family:system-ui,-apple-system,sans-serif;font-size:15px;line-height:1.5">',
    '<h2 style="margin:0 0 16px">New enquiry</h2>',
    `<table style="border-collapse:collapse;margin-bottom:16px">${rows}</table>`,
    `<div><strong>Message</strong><p style="margin:8px 0 0">${message}</p></div>`,
    '</div>',
  ].join('');
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed' }, 405);
  }

  let payload: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return json({ ok: false, error: 'Invalid request body' }, 400);
    }
    payload = parsed as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: 'Invalid request body' }, 400);
  }

  if (readString(payload, 'honeypot').length > 0) {
    return json({ ok: true }, 200);
  }

  const enquiry = validate(payload);
  if (!enquiry) {
    return json({ ok: false, error: 'Invalid request body' }, 400);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !toEmail) {
    console.error(
      `contact: missing server configuration (RESEND_API_KEY set: ${Boolean(apiKey)}, CONTACT_TO_EMAIL set: ${Boolean(toEmail)})`,
    );
    return json({ ok: false, error: 'Server misconfigured' }, 500);
  }

  const response = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [toEmail],
      reply_to: enquiry.email,
      subject: `Enquiry — ${enquiry.name} — ${enquiry.eventType}`,
      text: buildText(enquiry),
      html: buildHtml(enquiry),
    }),
  });

  if (!response.ok) {
    console.error(
      `contact: Resend responded ${response.status}: ${await response.text()}`,
    );
    return json({ ok: false }, 502);
  }

  return json({ ok: true }, 200);
}
