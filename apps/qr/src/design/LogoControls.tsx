import { useState, type DragEvent } from "react";
import { Checkbox } from "../ui/fields";
import type { Design } from "./design";
import { readLogoFile } from "./logo";

interface LogoControlsProps {
  design: Design;
  onChange: (design: Design) => void;
}

export function LogoControls({ design, onChange }: LogoControlsProps) {
  const [error, setError] = useState<string | null>(null);
  const { logo } = design;

  async function loadLogo(file: File | undefined) {
    if (!file) return;
    setError(null);
    try {
      const dataUrl = await readLogoFile(file);
      onChange({
        ...design,
        logo: { dataUrl, size: logo?.size ?? 0.4, hideDotsBehind: logo?.hideDotsBehind ?? true },
        // The logo covers part of the code. Level H lets up to 30 % go missing and still scan.
        errorCorrection: "H"
      });
    } catch {
      setError("Kunne ikke lese bildet. Bruk en PNG, JPG, WEBP eller SVG.");
    }
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    loadLogo(event.dataTransfer.files[0]);
  }

  return (
    <div className="stack">
      <label
        className="dropzone"
        htmlFor="logo-file"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        {logo ? (
          <img className="dropzone__preview" src={logo.dataUrl} alt="Logoen din" />
        ) : (
          <span className="dropzone__icon" aria-hidden="true">
            +
          </span>
        )}
        <span className="dropzone__text">
          <strong>{logo ? "Bytt logo" : "Velg en logo"}</strong> eller slipp en bildefil her
          <small>PNG, JPG, WEBP eller SVG. Kvadratiske logoer med luft rundt blir finest.</small>
        </span>
        <input
          id="logo-file"
          className="visually-hidden"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={(event) => {
            loadLogo(event.target.files?.[0]);
            event.target.value = ""; // lets the same file be picked again after removing it
          }}
        />
      </label>

      {error && (
        <p className="notice" role="alert">
          {error}
        </p>
      )}

      {logo && (
        <>
          <div className="field">
            <label className="field__label" htmlFor="logo-size">
              Størrelse
            </label>
            <input
              id="logo-size"
              type="range"
              min={0.2}
              max={0.6}
              step={0.05}
              value={logo.size}
              onChange={(event) => onChange({ ...design, logo: { ...logo, size: Number(event.target.value) } })}
            />
          </div>
          <Checkbox
            id="logo-hide-dots"
            label="Fjern prikkene bak logoen"
            checked={logo.hideDotsBehind}
            onChange={(hideDotsBehind) => onChange({ ...design, logo: { ...logo, hideDotsBehind } })}
          />
          <div>
            <button type="button" className="button" onClick={() => onChange({ ...design, logo: null })}>
              Fjern logo
            </button>
          </div>
        </>
      )}
    </div>
  );
}
