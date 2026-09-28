import type { FileExtension } from "qr-code-styling";
import { useState } from "react";
import type { Design } from "../design/design";
import { copyQrImage, downloadQr } from "../qr/renderQr";
import { ChoiceGroup, type Choice } from "../ui/fields";

const FORMATS: (Choice<FileExtension> & { hint: string })[] = [
  { value: "png", label: "PNG", hint: "Passer til det meste: dokumenter, presentasjoner og nett." },
  { value: "svg", label: "SVG", hint: "Vektor som er skarp i alle størrelser. Best til trykk." },
  { value: "jpeg", label: "JPG", hint: "Uten gjennomsiktighet. For systemer som bare tar JPG." },
  { value: "webp", label: "WEBP", hint: "Minst fil. Fint på nettsider." }
];

const SIZES = [512, 1024, 2048];

interface DownloadControlsProps {
  text: string;
  design: Design;
  disabled: boolean;
}

export function DownloadControls({ text, design, disabled }: DownloadControlsProps) {
  const [format, setFormat] = useState<FileExtension>("png");
  const [size, setSize] = useState(1024);
  const [status, setStatus] = useState("");

  const selectedFormat = FORMATS.find((option) => option.value === format)!;
  const isVector = format === "svg";

  async function handleCopy() {
    try {
      await copyQrImage(text, design, size);
      setStatus("Bildet er kopiert. Lim det inn der du vil ha det.");
    } catch {
      setStatus("Nettleseren tillot ikke kopiering. Last ned bildet i stedet.");
    }
  }

  return (
    <div className="stack">
      <div className="download-options">
        <ChoiceGroup name="format" legend="Format" choices={FORMATS} value={format} onChange={setFormat} />
        <div className="field">
          <label className="field__label" htmlFor="download-size">
            Størrelse
          </label>
          <select
            id="download-size"
            className="field__input"
            value={size}
            disabled={isVector}
            onChange={(event) => setSize(Number(event.target.value))}
          >
            {SIZES.map((pixels) => (
              <option key={pixels} value={pixels}>
                {pixels} × {pixels} px
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="field__hint">{selectedFormat.hint}</p>

      <div className="button-row">
        <button
          type="button"
          className="button button--primary"
          disabled={disabled}
          onClick={() => downloadQr(text, design, format, size)}
        >
          Last ned {selectedFormat.label}
        </button>
        <button type="button" className="button" disabled={disabled} onClick={handleCopy}>
          Kopier bilde
        </button>
      </div>
      <p className="field__hint" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
