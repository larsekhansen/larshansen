import { useMemo } from "react";
import type { Design } from "../design/design";
import { QrCode } from "../qr/QrCode";
import type { QrInfo } from "../qr/qrInfo";
import { buildQrOptions } from "../qr/qrOptions";
import { assessScannability } from "../qr/scannability";
import { useScanTest } from "../qr/scanTest";
import { DownloadControls } from "./DownloadControls";
import { ScanMeter } from "./ScanMeter";

// The preview is an SVG, so this only sets its internal coordinates; CSS decides the size on screen.
const PREVIEW_SIZE = 600;

interface PreviewPanelProps {
  text: string;
  design: Design;
  info: QrInfo;
}

/** The code itself, how well it scans, and the download buttons. */
export function PreviewPanel({ text, design, info }: PreviewPanelProps) {
  const hasCode = text !== "" && info.fits;
  const options = useMemo(() => buildQrOptions(text, design, PREVIEW_SIZE), [text, design]);
  const testResult = useScanTest(text, design, hasCode);

  return (
    <div className="stack">
      <figure className="label">
        <div
          className="label__code"
          data-dot-style={design.dotStyle}
          data-transparent={design.transparentBackground || undefined}
        >
          {hasCode ? (
            <QrCode options={options} label={`QR-kode som inneholder: ${text}`} className="label__svg" />
          ) : (
            <p className="label__empty">{emptyMessage(info, design)}</p>
          )}
        </div>
        <figcaption className="label__meta">
          {info.fits && hasCode ? (
            <>
              <span>Versjon {info.version}</span>
              <span>
                {info.moduleCount} × {info.moduleCount} moduler
              </span>
              <span>Feilretting {design.errorCorrection}</span>
              <span>{info.byteCount} byte</span>
            </>
          ) : (
            <span>Ingen kode ennå</span>
          )}
        </figcaption>
      </figure>

      {info.fits && hasCode && (
        <ScanMeter assessment={assessScannability(design, info.moduleCount, testResult)} testResult={testResult} />
      )}

      <DownloadControls text={text} design={design} disabled={!hasCode} />
    </div>
  );
}

function emptyMessage(info: QrInfo, design: Design): string {
  if (info.fits) return "Fyll inn innholdet i steg 1, så dukker koden opp her.";

  return (
    `Innholdet er for langt for én QR-kode: ${info.byteCount} byte, mens grensen er ${info.maxBytes} byte ` +
    `med feilretting ${design.errorCorrection}. Kort ned teksten, eller velg lavere feilretting under Stil.`
  );
}
