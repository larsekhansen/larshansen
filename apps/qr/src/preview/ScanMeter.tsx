import type { ScanAssessment, ScanLevel, ScanTestResult } from "../qr/scannability";

const LEVEL_LABELS: Record<ScanLevel, string> = {
  high: "Høy",
  medium: "Middels",
  low: "Lav"
};

const TEST_LABELS: Record<ScanTestResult, string> = {
  pending: "Tester …",
  passed: "Lest av QR-leser",
  failed: "Kunne ikke leses"
};

interface ScanMeterProps {
  assessment: ScanAssessment;
  testResult: ScanTestResult;
}

export function ScanMeter({ assessment, testResult }: ScanMeterProps) {
  const { score, level, tips } = assessment;

  return (
    <div className="meter" data-level={level}>
      <div className="meter__head">
        <span id="meter-label" className="meter__title">
          Skannbarhet <strong>{LEVEL_LABELS[level]}</strong>
        </span>
        <span className="chip" data-result={testResult} aria-live="polite">
          {TEST_LABELS[testResult]}
        </span>
      </div>
      <div
        className="meter__track"
        role="meter"
        aria-labelledby="meter-label"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={score}
      >
        <div className="meter__fill" style={{ width: `${score}%` }} />
      </div>
      {tips.length > 0 && (
        <ul className="meter__tips">
          {tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
