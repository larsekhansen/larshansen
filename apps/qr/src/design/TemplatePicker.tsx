import { QrCode } from "../qr/QrCode";
import { buildQrOptions } from "../qr/qrOptions";
import { DEFAULT_DESIGN, type Design } from "./design";
import { TEMPLATES, applyTemplate, surpriseLook, usesTemplate } from "./templates";

// Thumbnails show a fixed sample so they never need redrawing while the user types.
const SAMPLE_TEXT = "https://larshansen.dev/qr/";
const THUMBNAIL_SIZE = 160;

const thumbnailOptions = new Map(
  TEMPLATES.map((template) => [
    template.id,
    buildQrOptions(SAMPLE_TEXT, applyTemplate(DEFAULT_DESIGN, template), THUMBNAIL_SIZE)
  ])
);

interface TemplatePickerProps {
  design: Design;
  onChange: (design: Design) => void;
}

export function TemplatePicker({ design, onChange }: TemplatePickerProps) {
  return (
    <div className="stack">
      <div className="template-grid">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            className="template"
            data-dot-style={template.look.dotStyle}
            aria-pressed={usesTemplate(design, template)}
            onClick={() => onChange(applyTemplate(design, template))}
          >
            <QrCode options={thumbnailOptions.get(template.id)!} className="template__code" />
            <span className="template__name">{template.name}</span>
          </button>
        ))}
      </div>
      <div>
        <button type="button" className="button" onClick={() => onChange({ ...design, ...surpriseLook() })}>
          Overrask meg
        </button>
      </div>
    </div>
  );
}
