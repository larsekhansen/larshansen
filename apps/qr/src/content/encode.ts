// Turns form fields into the exact text stored in the QR code.
// Each format is a de facto standard that phone cameras recognise:
//   link     https://…
//   Wi-Fi    WIFI:T:WPA;S:<name>;P:<password>;;
//   e-mail   mailto:<address>?subject=…&body=…
//   SMS      SMSTO:<number>:<message>
//   phone    tel:<number>
//   contact  vCard 3.0 (RFC 2426)
// An empty string means "not enough information yet" and the preview shows a hint instead.

import type {
  Content,
  ContactFields,
  EmailFields,
  PhoneFields,
  SmsFields,
  UrlFields,
  WifiFields
} from "./content";

/** Adds https:// when the user typed a bare address like "ki.norge.no/ki-tiltak". */
export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (trimmed === "") return "";

  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed);
  return hasScheme ? trimmed : `https://${trimmed}`;
}

export function encodeUrl(fields: UrlFields): string {
  const address = normalizeUrl(fields.address);
  if (address === "") return "";

  const utm = {
    utm_source: fields.utmSource.trim(),
    utm_medium: fields.utmMedium.trim(),
    utm_campaign: fields.utmCampaign.trim()
  };
  const hasUtm = Object.values(utm).some((value) => value !== "");
  if (!hasUtm) return address;

  try {
    const url = new URL(address);
    for (const [name, value] of Object.entries(utm)) {
      if (value !== "") url.searchParams.set(name, value);
    }
    return url.toString();
  } catch {
    // Not a valid URL (yet); encode it as typed rather than guessing.
    return address;
  }
}

/** The Wi-Fi format reserves \ ; , : and " and escapes them with a backslash. */
function escapeWifi(value: string): string {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

export function encodeWifi(fields: WifiFields): string {
  if (fields.networkName.trim() === "") return "";

  const parts = [`T:${fields.security}`, `S:${escapeWifi(fields.networkName)}`];
  if (fields.security !== "nopass") parts.push(`P:${escapeWifi(fields.password)}`);
  if (fields.hidden) parts.push("H:true");

  return `WIFI:${parts.join(";")};;`;
}

export function encodeEmail(fields: EmailFields): string {
  const to = fields.to.trim();
  if (to === "") return "";

  // encodeURIComponent (not URLSearchParams) so spaces become %20; some mail apps show "+" literally.
  const query = [
    ["subject", fields.subject],
    ["body", fields.body]
  ]
    .filter(([, value]) => value.trim() !== "")
    .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
    .join("&");

  return query === "" ? `mailto:${to}` : `mailto:${to}?${query}`;
}

/** Keeps a leading + and the digits; drops spaces, dashes and brackets. */
export function cleanPhoneNumber(input: string): string {
  const trimmed = input.trim();
  const digits = trimmed.replace(/\D/g, "");
  return trimmed.startsWith("+") ? `+${digits}` : digits;
}

export function encodeSms(fields: SmsFields): string {
  const number = cleanPhoneNumber(fields.number);
  if (number === "") return "";

  return `SMSTO:${number}:${fields.message}`;
}

export function encodePhone(fields: PhoneFields): string {
  const number = cleanPhoneNumber(fields.number);
  return number === "" ? "" : `tel:${number}`;
}

/** vCard reserves \ , ; and line breaks. */
function escapeVcard(value: string): string {
  return value
    .trim()
    .replace(/([\\,;])/g, "\\$1")
    .replace(/\r?\n/g, "\\n");
}

export function encodeContact(fields: ContactFields): string {
  const firstName = escapeVcard(fields.firstName);
  const lastName = escapeVcard(fields.lastName);
  const phone = cleanPhoneNumber(fields.phone);
  const email = fields.email.trim();

  const hasSomethingToSave = firstName || lastName || fields.organization.trim() || phone || email;
  if (!hasSomethingToSave) return "";

  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const optionalLines: [string, string][] = [
    ["ORG", escapeVcard(fields.organization)],
    ["TITLE", escapeVcard(fields.jobTitle)],
    ["TEL;TYPE=CELL", phone],
    ["EMAIL", email],
    ["URL", normalizeUrl(fields.website)]
  ];

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${lastName};${firstName};;;`,
    `FN:${fullName}`,
    ...optionalLines.filter(([, value]) => value !== "").map(([name, value]) => `${name}:${value}`),
    "END:VCARD"
  ];

  // The vCard spec asks for CRLF line endings.
  return lines.join("\r\n");
}

export function encodeContent(content: Content): string {
  const { fields } = content;

  switch (content.kind) {
    case "url":
      return encodeUrl(fields.url);
    case "text":
      return fields.text.body;
    case "wifi":
      return encodeWifi(fields.wifi);
    case "email":
      return encodeEmail(fields.email);
    case "sms":
      return encodeSms(fields.sms);
    case "phone":
      return encodePhone(fields.phone);
    case "contact":
      return encodeContact(fields.contact);
  }
}
