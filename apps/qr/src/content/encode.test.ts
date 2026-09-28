import { describe, expect, test } from "bun:test";
import {
  cleanPhoneNumber,
  encodeContact,
  encodeEmail,
  encodePhone,
  encodeSms,
  encodeUrl,
  encodeWifi,
  normalizeUrl
} from "./encode";

const noUtm = { utmSource: "", utmMedium: "", utmCampaign: "" };

describe("links", () => {
  test("adds https:// to bare addresses", () => {
    expect(normalizeUrl("ki.norge.no/ki-tiltak")).toBe("https://ki.norge.no/ki-tiltak");
    expect(normalizeUrl("  http://example.com ")).toBe("http://example.com");
    expect(normalizeUrl("")).toBe("");
  });

  test("appends UTM parameters that are filled in", () => {
    const url = encodeUrl({ address: "larshansen.dev/qr/?a=1", ...noUtm, utmSource: "plakat", utmCampaign: "høst" });
    expect(url).toBe("https://larshansen.dev/qr/?a=1&utm_source=plakat&utm_campaign=h%C3%B8st");
  });

  test("leaves the address alone without UTM parameters", () => {
    expect(encodeUrl({ address: "larshansen.dev", ...noUtm })).toBe("https://larshansen.dev");
  });
});

describe("Wi-Fi", () => {
  test("escapes the characters the format reserves", () => {
    const text = encodeWifi({ networkName: 'Kafé;"Nord"', password: "a:b,c\\d", security: "WPA", hidden: false });
    expect(text).toBe('WIFI:T:WPA;S:Kafé\\;\\"Nord\\";P:a\\:b\\,c\\\\d;;');
  });

  test("leaves out the password for open networks and marks hidden ones", () => {
    const text = encodeWifi({ networkName: "Gjest", password: "ignored", security: "nopass", hidden: true });
    expect(text).toBe("WIFI:T:nopass;S:Gjest;H:true;;");
  });

  test("needs a network name", () => {
    expect(encodeWifi({ networkName: " ", password: "x", security: "WPA", hidden: false })).toBe("");
  });
});

describe("e-mail, SMS and phone", () => {
  test("encodes subject and body with %20 for spaces", () => {
    expect(encodeEmail({ to: "lars@example.com", subject: "Hei der", body: "" })).toBe(
      "mailto:lars@example.com?subject=Hei%20der"
    );
  });

  test("cleans phone numbers", () => {
    expect(cleanPhoneNumber("+47 900 12 345")).toBe("+4790012345");
    expect(cleanPhoneNumber("(22) 33-44-55")).toBe("22334455");
  });

  test("builds SMS and tel: links", () => {
    expect(encodeSms({ number: "+47 900 12 345", message: "Hei!" })).toBe("SMSTO:+4790012345:Hei!");
    expect(encodePhone({ number: "900 12 345" })).toBe("tel:90012345");
  });
});

describe("contact card", () => {
  test("writes a vCard 3.0 with only the filled-in lines", () => {
    const card = encodeContact({
      firstName: "Lars",
      lastName: "Hansen",
      organization: "Hansen, Hansen & co",
      jobTitle: "",
      phone: "+47 900 12 345",
      email: "",
      website: "larshansen.dev"
    });

    expect(card.split("\r\n")).toEqual([
      "BEGIN:VCARD",
      "VERSION:3.0",
      "N:Hansen;Lars;;;",
      "FN:Lars Hansen",
      "ORG:Hansen\\, Hansen & co",
      "TEL;TYPE=CELL:+4790012345",
      "URL:https://larshansen.dev",
      "END:VCARD"
    ]);
  });

  test("is empty until there is something to save", () => {
    const empty = { firstName: "", lastName: "", organization: "", jobTitle: "", phone: "", email: "", website: "" };
    expect(encodeContact(empty)).toBe("");
  });
});
