import { useMemo, useState } from "react";
import { ContentForm } from "./content/ContentForm";
import { DEFAULT_CONTENT } from "./content/content";
import { encodeContent } from "./content/encode";
import { DesignPanel } from "./design/DesignPanel";
import { DEFAULT_DESIGN } from "./design/design";
import { usePersistentState } from "./hooks/usePersistentState";
import { PreviewPanel } from "./preview/PreviewPanel";
import { describeQr } from "./qr/qrInfo";

const SOURCE_URL = "https://github.com/larsekhansen/larshansen/tree/main/apps/qr";

export default function App() {
  // The whole state of the page: what the code says and how it looks.
  const [content, setContent] = usePersistentState("qr:content:v1", DEFAULT_CONTENT);
  const [design, setDesign] = usePersistentState("qr:design:v1", DEFAULT_DESIGN);

  // Everything else is derived from it.
  const text = encodeContent(content);
  const info = useMemo(() => describeQr(text, design.errorCorrection), [text, design.errorCorrection]);

  function startOver() {
    setContent(DEFAULT_CONTENT);
    setDesign(DEFAULT_DESIGN);
  }

  return (
    <div className="page">
      <header className="masthead">
        <nav className="masthead__crumbs" aria-label="Brødsmuler">
          <a href="/">larshansen.dev</a>
          <span aria-hidden="true">/</span>
          <span aria-current="page">qr</span>
        </nav>
        <h1 className="masthead__title">QR-verkstedet</h1>
        <p className="masthead__lede">
          Lag QR-koder for lenker, Wi-Fi, kontaktkort og mer. Velg farger og logo, se at koden faktisk lar seg
          skanne, og last den ned. Alt skjer i nettleseren din. Ingenting sendes til en server.
        </p>
      </header>

      <main className="workbench">
        <section className="panel panel--content" aria-labelledby="content-heading">
          <StepHeading id="content-heading" step={1} title="Innhold" />
          <ContentForm content={content} onChange={setContent} />
        </section>

        <section className="panel panel--preview" aria-labelledby="preview-heading">
          <h2 id="preview-heading" className="step-heading">
            Forhåndsvisning
          </h2>
          <PreviewPanel text={text} design={design} info={info} />
        </section>

        <section className="panel panel--design" aria-labelledby="design-heading">
          <StepHeading id="design-heading" step={2} title="Utseende" />
          <DesignPanel design={design} onChange={setDesign} moduleCount={info.fits ? info.moduleCount : null} />
        </section>
      </main>

      <footer className="colophon">
        <StartOver onConfirm={startOver} />
        <p>
          Bygget med åpen kildekode: <a href="https://github.com/kozakdenys/qr-code-styling">qr-code-styling</a>{" "}
          (MIT) tegner kodene og <a href="https://github.com/cozmo/jsQR">jsQR</a> (Apache 2.0) tester at de kan leses.{" "}
          <a href={SOURCE_URL}>Se kildekoden til denne siden</a>.
        </p>
        <p className="colophon__fine">QR Code er et registrert varemerke for DENSO WAVE INCORPORATED.</p>
      </footer>
    </div>
  );
}

function StepHeading({ id, step, title }: { id: string; step: number; title: string }) {
  return (
    <h2 id={id} className="step-heading">
      <span className="step-heading__number" aria-hidden="true">
        {step}
      </span>
      {title}
    </h2>
  );
}

/** Two clicks, so a stray tap does not throw away someone's logo and colors. */
function StartOver({ onConfirm }: { onConfirm: () => void }) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isConfirming) {
    return (
      <p>
        Utkastet ditt lagres i denne nettleseren.{" "}
        <button type="button" className="link-button" onClick={() => setIsConfirming(true)}>
          Start på nytt
        </button>
      </p>
    );
  }

  return (
    <p>
      Fjerne innhold, farger og logo?{" "}
      <button
        type="button"
        className="link-button"
        onClick={() => {
          onConfirm();
          setIsConfirming(false);
        }}
      >
        Ja, start på nytt
      </button>{" "}
      <button type="button" className="link-button" onClick={() => setIsConfirming(false)}>
        Avbryt
      </button>
    </p>
  );
}
