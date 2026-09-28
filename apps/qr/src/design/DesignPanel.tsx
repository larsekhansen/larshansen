import { useState } from "react";
import { ChoiceGroup } from "../ui/fields";
import type { Design } from "./design";
import { LogoControls } from "./LogoControls";
import { StyleControls } from "./StyleControls";
import { TemplatePicker } from "./TemplatePicker";

type DesignTab = "templates" | "style" | "logo";

const TABS: { value: DesignTab; label: string }[] = [
  { value: "templates", label: "Maler" },
  { value: "style", label: "Stil" },
  { value: "logo", label: "Logo" }
];

interface DesignPanelProps {
  design: Design;
  onChange: (design: Design) => void;
  moduleCount: number | null;
}

/** Step 2: how the code looks. */
export function DesignPanel({ design, onChange, moduleCount }: DesignPanelProps) {
  const [tab, setTab] = useState<DesignTab>("templates");

  return (
    <div className="stack">
      <ChoiceGroup
        name="design-tab"
        legend="Hva vil du endre?"
        hideLegend
        variant="tabs"
        choices={TABS}
        value={tab}
        onChange={setTab}
      />
      {tab === "templates" && <TemplatePicker design={design} onChange={onChange} />}
      {tab === "style" && <StyleControls design={design} onChange={onChange} moduleCount={moduleCount} />}
      {tab === "logo" && <LogoControls design={design} onChange={onChange} />}
    </div>
  );
}
