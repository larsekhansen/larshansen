// Small form controls shared by the content form and the design panel.
// Each one renders its own <label>, so callers only pass an id and the text.

import type { ReactNode } from "react";

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: ReactNode;
  multiline?: boolean;
  type?: "text" | "email" | "tel";
  inputMode?: "text" | "url" | "email" | "tel";
  autoComplete?: string;
}

export function TextField({ id, label, value, onChange, hint, multiline, ...inputProps }: TextFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          className="field__input field__input--multiline"
          value={value}
          rows={4}
          aria-describedby={hintId}
          placeholder={inputProps.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          id={id}
          className="field__input"
          value={value}
          aria-describedby={hintId}
          spellCheck={false}
          {...inputProps}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {hint && (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      )}
    </div>
  );
}

interface CheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Checkbox({ id, label, checked, onChange }: CheckboxProps) {
  return (
    <label className="checkbox" htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  );
}

interface ColorFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ColorField({ id, label, value, onChange, disabled }: ColorFieldProps) {
  return (
    <label className="color-field" htmlFor={id} data-disabled={disabled || undefined}>
      <input
        id={id}
        type="color"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
      <span className="color-field__text">
        <span className="color-field__label">{label}</span>
        <span className="color-field__value">{value.toUpperCase()}</span>
      </span>
    </label>
  );
}

export interface Choice<T extends string> {
  value: T;
  label: string;
  /** Optional second line, e.g. "15 %" under an error correction level. */
  detail?: string;
}

interface ChoiceGroupProps<T extends string> {
  name: string;
  legend: string;
  choices: Choice<T>[];
  value: T;
  onChange: (value: T) => void;
  /** "tabs" for switching between sections, "segments" for picking a setting. */
  variant?: "tabs" | "segments";
  hideLegend?: boolean;
}

/** A row of radio buttons that looks like buttons. Arrow keys move between them for free. */
export function ChoiceGroup<T extends string>({
  name,
  legend,
  choices,
  value,
  onChange,
  variant = "segments",
  hideLegend
}: ChoiceGroupProps<T>) {
  return (
    <fieldset className={`choices choices--${variant}`}>
      <legend className={hideLegend ? "visually-hidden" : "field__label"}>{legend}</legend>
      <div className="choices__row">
        {choices.map((choice) => (
          <label key={choice.value} className="choice">
            <input
              type="radio"
              name={name}
              value={choice.value}
              checked={choice.value === value}
              onChange={() => onChange(choice.value)}
            />
            <span className="choice__face">
              {choice.label}
              {choice.detail && <small className="choice__detail">{choice.detail}</small>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
