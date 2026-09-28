import { quietZoneModules } from "../qr/qrInfo";
import { ChoiceGroup, Checkbox, ColorField } from "../ui/fields";
import {
  CORNER_DOT_STYLES,
  CORNER_SQUARE_STYLES,
  DOT_STYLES,
  ERROR_CORRECTION_LEVELS,
  GRADIENTS,
  type Design
} from "./design";

interface StyleControlsProps {
  design: Design;
  onChange: (design: Design) => void;
  /** Size of the current code, used to show the margin in modules. Null when there is no code. */
  moduleCount: number | null;
}

const formatModules = new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 1 }).format;

export function StyleControls({ design, onChange, moduleCount }: StyleControlsProps) {
  const update = (patch: Partial<Design>) => onChange({ ...design, ...patch });

  return (
    <div className="stack stack--loose">
      <section className="stack" aria-labelledby="shapes-heading">
        <h3 id="shapes-heading" className="subheading">
          Former
        </h3>
        <ChoiceGroup
          name="dot-style"
          legend="Prikker"
          choices={DOT_STYLES}
          value={design.dotStyle}
          onChange={(dotStyle) => update({ dotStyle })}
        />
        <div className="grid-2">
          <ChoiceGroup
            name="corner-square-style"
            legend="Hjørnerammer"
            choices={CORNER_SQUARE_STYLES}
            value={design.cornerSquareStyle}
            onChange={(cornerSquareStyle) => update({ cornerSquareStyle })}
          />
          <ChoiceGroup
            name="corner-dot-style"
            legend="Hjørneprikker"
            choices={CORNER_DOT_STYLES}
            value={design.cornerDotStyle}
            onChange={(cornerDotStyle) => update({ cornerDotStyle })}
          />
        </div>
      </section>

      <section className="stack" aria-labelledby="colors-heading">
        <h3 id="colors-heading" className="subheading">
          Farger
        </h3>
        <div className="color-grid">
          <ColorField
            id="dot-color"
            label="Prikker"
            value={design.dotColor}
            onChange={(dotColor) => update({ dotColor })}
          />
          <ColorField
            id="corner-color"
            label="Hjørner"
            value={design.cornerColor}
            onChange={(cornerColor) => update({ cornerColor })}
          />
          <ColorField
            id="background-color"
            label="Bakgrunn"
            value={design.backgroundColor}
            disabled={design.transparentBackground}
            onChange={(backgroundColor) => update({ backgroundColor })}
          />
        </div>
        <Checkbox
          id="transparent-background"
          label="Gjennomsiktig bakgrunn (PNG, SVG og WEBP)"
          checked={design.transparentBackground}
          onChange={(transparentBackground) => update({ transparentBackground })}
        />
        <ChoiceGroup
          name="gradient"
          legend="Fargeovergang på prikkene"
          choices={GRADIENTS}
          value={design.gradient}
          onChange={(gradient) => update({ gradient })}
        />
        {design.gradient !== "none" && (
          <div className="color-grid">
            <ColorField
              id="gradient-color"
              label="Til farge"
              value={design.gradientColor}
              onChange={(gradientColor) => update({ gradientColor })}
            />
          </div>
        )}
      </section>

      <section className="stack" aria-labelledby="advanced-heading">
        <h3 id="advanced-heading" className="subheading">
          Avansert
        </h3>
        <ChoiceGroup
          name="error-correction"
          legend="Feilretting"
          choices={ERROR_CORRECTION_LEVELS.map(({ value, label, recovers }) => ({ value, label, detail: recovers }))}
          value={design.errorCorrection}
          onChange={(errorCorrection) => update({ errorCorrection })}
        />
        <p className="field__hint">
          Hvor stor del av koden som kan være skitten, skadet eller dekket av en logo og fortsatt leses. Høyere nivå
          gir flere og mindre moduler.
        </p>
        <div className="field">
          <label className="field__label" htmlFor="margin">
            Luft rundt koden
          </label>
          <input
            id="margin"
            type="range"
            min={0}
            max={0.2}
            step={0.01}
            value={design.margin}
            onChange={(event) => update({ margin: Number(event.target.value) })}
          />
          {moduleCount !== null && (
            <p className="field__hint">
              Tilsvarer {formatModules(quietZoneModules(design.margin, moduleCount))} moduler. Standarden anbefaler 4.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
