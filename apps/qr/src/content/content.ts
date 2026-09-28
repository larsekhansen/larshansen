// What the QR code says. Every content type keeps its own fields, so switching tabs
// never throws away what the user already typed.

export interface UrlFields {
  address: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
}

export interface TextFields {
  body: string;
}

export type WifiSecurity = "WPA" | "WEP" | "nopass";

export interface WifiFields {
  networkName: string;
  password: string;
  security: WifiSecurity;
  hidden: boolean;
}

export interface EmailFields {
  to: string;
  subject: string;
  body: string;
}

export interface SmsFields {
  number: string;
  message: string;
}

export interface PhoneFields {
  number: string;
}

export interface ContactFields {
  firstName: string;
  lastName: string;
  organization: string;
  jobTitle: string;
  phone: string;
  email: string;
  website: string;
}

export interface ContentFields {
  url: UrlFields;
  text: TextFields;
  wifi: WifiFields;
  email: EmailFields;
  sms: SmsFields;
  phone: PhoneFields;
  contact: ContactFields;
}

export type ContentKind = keyof ContentFields;

export interface Content {
  kind: ContentKind;
  fields: ContentFields;
}

/** Tab order and labels. */
export const CONTENT_KINDS: { kind: ContentKind; label: string }[] = [
  { kind: "url", label: "Lenke" },
  { kind: "text", label: "Tekst" },
  { kind: "wifi", label: "Wi-Fi" },
  { kind: "email", label: "E-post" },
  { kind: "sms", label: "SMS" },
  { kind: "phone", label: "Telefon" },
  { kind: "contact", label: "Kontaktkort" }
];

export const DEFAULT_CONTENT: Content = {
  kind: "url",
  fields: {
    url: { address: "https://larshansen.dev/qr/", utmSource: "", utmMedium: "", utmCampaign: "" },
    text: { body: "" },
    wifi: { networkName: "", password: "", security: "WPA", hidden: false },
    email: { to: "", subject: "", body: "" },
    sms: { number: "", message: "" },
    phone: { number: "" },
    contact: {
      firstName: "",
      lastName: "",
      organization: "",
      jobTitle: "",
      phone: "",
      email: "",
      website: ""
    }
  }
};
