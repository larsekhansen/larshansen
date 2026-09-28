import { ChoiceGroup, Checkbox, TextField } from "../ui/fields";
import {
  CONTENT_KINDS,
  type Content,
  type ContentFields,
  type ContentKind,
  type WifiSecurity
} from "./content";
import { encodeUrl, normalizeUrl } from "./encode";

interface ContentFormProps {
  content: Content;
  onChange: (content: Content) => void;
}

/** Step 1: what the code should contain. One small form per content type. */
export function ContentForm({ content, onChange }: ContentFormProps) {
  function updateFields<K extends ContentKind>(kind: K, patch: Partial<ContentFields[K]>) {
    const fields = { ...content.fields, [kind]: { ...content.fields[kind], ...patch } };
    onChange({ ...content, fields });
  }

  const { fields } = content;

  return (
    <div className="stack">
      <ChoiceGroup
        name="content-kind"
        legend="Hva skal koden inneholde?"
        hideLegend
        variant="tabs"
        choices={CONTENT_KINDS.map(({ kind, label }) => ({ value: kind, label }))}
        value={content.kind}
        onChange={(kind) => onChange({ ...content, kind })}
      />

      {content.kind === "url" && (
        <UrlForm fields={fields.url} onChange={(patch) => updateFields("url", patch)} />
      )}
      {content.kind === "text" && (
        <TextField
          id="text-body"
          label="Tekst"
          multiline
          value={fields.text.body}
          placeholder="Hva som helst: en beskjed, en kode, et dikt …"
          onChange={(body) => updateFields("text", { body })}
        />
      )}
      {content.kind === "wifi" && (
        <WifiForm fields={fields.wifi} onChange={(patch) => updateFields("wifi", patch)} />
      )}
      {content.kind === "email" && (
        <EmailForm fields={fields.email} onChange={(patch) => updateFields("email", patch)} />
      )}
      {content.kind === "sms" && (
        <SmsForm fields={fields.sms} onChange={(patch) => updateFields("sms", patch)} />
      )}
      {content.kind === "phone" && (
        <TextField
          id="phone-number"
          label="Telefonnummer"
          type="tel"
          autoComplete="tel"
          value={fields.phone.number}
          placeholder="+47 900 00 000"
          hint="Skanneren tilbyr å ringe nummeret."
          onChange={(number) => updateFields("phone", { number })}
        />
      )}
      {content.kind === "contact" && (
        <ContactForm fields={fields.contact} onChange={(patch) => updateFields("contact", patch)} />
      )}
    </div>
  );
}

interface FormProps<K extends ContentKind> {
  fields: ContentFields[K];
  onChange: (patch: Partial<ContentFields[K]>) => void;
}

/** "ki" or "https://" are probably typos: a web address needs a dot in its host name. */
function looksIncomplete(address: string): boolean {
  try {
    const { protocol, hostname } = new URL(address);
    return (protocol === "http:" || protocol === "https:") && !hostname.includes(".");
  } catch {
    return true;
  }
}

function UrlForm({ fields, onChange }: FormProps<"url">) {
  const normalized = normalizeUrl(fields.address);
  const finalUrl = encodeUrl(fields);
  const showFinalUrl = finalUrl !== "" && finalUrl !== fields.address.trim();
  const utmCount = [fields.utmSource, fields.utmMedium, fields.utmCampaign].filter((v) => v.trim()).length;

  return (
    <>
      <TextField
        id="url-address"
        label="Nettadresse"
        inputMode="url"
        autoComplete="url"
        value={fields.address}
        placeholder="ki.norge.no/ki-tiltak"
        hint={showFinalUrl ? <>Koden åpner <code>{finalUrl}</code></> : undefined}
        onChange={(address) => onChange({ address })}
      />
      {normalized !== "" && looksIncomplete(normalized) && (
        <p className="notice">Adressen ser ufullstendig ut. Den trenger et domene, for eksempel larshansen.dev.</p>
      )}
      <details className="disclosure">
        <summary>
          UTM-parametere
          {utmCount > 0 && <span className="disclosure__count">{utmCount} i bruk</span>}
        </summary>
        <p className="disclosure__intro">
          Legges til i lenken, så du kan se i analyseverktøyet ditt hvor mange som kom via koden.
        </p>
        <div className="grid-2">
          <TextField
            id="utm-source"
            label="Kilde (utm_source)"
            value={fields.utmSource}
            placeholder="plakat"
            onChange={(utmSource) => onChange({ utmSource })}
          />
          <TextField
            id="utm-medium"
            label="Medium (utm_medium)"
            value={fields.utmMedium}
            placeholder="qr"
            onChange={(utmMedium) => onChange({ utmMedium })}
          />
          <TextField
            id="utm-campaign"
            label="Kampanje (utm_campaign)"
            value={fields.utmCampaign}
            placeholder="host-2026"
            onChange={(utmCampaign) => onChange({ utmCampaign })}
          />
        </div>
      </details>
    </>
  );
}

const WIFI_SECURITY: { value: WifiSecurity; label: string }[] = [
  { value: "WPA", label: "WPA/WPA2/WPA3" },
  { value: "WEP", label: "WEP" },
  { value: "nopass", label: "Uten passord" }
];

function WifiForm({ fields, onChange }: FormProps<"wifi">) {
  return (
    <>
      <div className="grid-2">
        <TextField
          id="wifi-name"
          label="Nettverksnavn (SSID)"
          value={fields.networkName}
          placeholder="Hjemmenett"
          onChange={(networkName) => onChange({ networkName })}
        />
        {fields.security !== "nopass" && (
          <TextField
            id="wifi-password"
            label="Passord"
            autoComplete="off"
            value={fields.password}
            onChange={(password) => onChange({ password })}
          />
        )}
      </div>
      <ChoiceGroup
        name="wifi-security"
        legend="Sikkerhet"
        choices={WIFI_SECURITY}
        value={fields.security}
        onChange={(security) => onChange({ security })}
      />
      <Checkbox
        id="wifi-hidden"
        label="Skjult nettverk (sender ikke ut navnet sitt)"
        checked={fields.hidden}
        onChange={(hidden) => onChange({ hidden })}
      />
    </>
  );
}

function EmailForm({ fields, onChange }: FormProps<"email">) {
  return (
    <>
      <TextField
        id="email-to"
        label="Til"
        type="email"
        autoComplete="email"
        value={fields.to}
        placeholder="navn@eksempel.no"
        onChange={(to) => onChange({ to })}
      />
      <TextField
        id="email-subject"
        label="Emne"
        value={fields.subject}
        onChange={(subject) => onChange({ subject })}
      />
      <TextField
        id="email-body"
        label="Melding"
        multiline
        value={fields.body}
        onChange={(body) => onChange({ body })}
      />
    </>
  );
}

function SmsForm({ fields, onChange }: FormProps<"sms">) {
  return (
    <>
      <TextField
        id="sms-number"
        label="Telefonnummer"
        type="tel"
        autoComplete="tel"
        value={fields.number}
        placeholder="+47 900 00 000"
        onChange={(number) => onChange({ number })}
      />
      <TextField
        id="sms-message"
        label="Melding"
        multiline
        value={fields.message}
        hint="Skanneren åpner meldingsappen med teksten ferdig utfylt."
        onChange={(message) => onChange({ message })}
      />
    </>
  );
}

function ContactForm({ fields, onChange }: FormProps<"contact">) {
  return (
    <div className="grid-2">
      <TextField
        id="contact-first-name"
        label="Fornavn"
        autoComplete="given-name"
        value={fields.firstName}
        onChange={(firstName) => onChange({ firstName })}
      />
      <TextField
        id="contact-last-name"
        label="Etternavn"
        autoComplete="family-name"
        value={fields.lastName}
        onChange={(lastName) => onChange({ lastName })}
      />
      <TextField
        id="contact-organization"
        label="Organisasjon"
        autoComplete="organization"
        value={fields.organization}
        onChange={(organization) => onChange({ organization })}
      />
      <TextField
        id="contact-job-title"
        label="Stilling"
        autoComplete="organization-title"
        value={fields.jobTitle}
        onChange={(jobTitle) => onChange({ jobTitle })}
      />
      <TextField
        id="contact-phone"
        label="Mobil"
        type="tel"
        autoComplete="tel"
        value={fields.phone}
        onChange={(phone) => onChange({ phone })}
      />
      <TextField
        id="contact-email"
        label="E-post"
        type="email"
        autoComplete="email"
        value={fields.email}
        onChange={(email) => onChange({ email })}
      />
      <TextField
        id="contact-website"
        label="Nettside"
        inputMode="url"
        autoComplete="url"
        value={fields.website}
        onChange={(website) => onChange({ website })}
      />
    </div>
  );
}
