import React, { useMemo, useState } from "react";

/**
 * Parkinson’s Medication Effects Playground
 * ------------------------------------------------------
 * ⚠️ Educational model only — NOT medical advice.
 * This tool offers an intuitive way to explore how changing
 * levodopa (Syndopa/Stalevo) daytime dose, night-time CR dose,
 * dose frequency, and add‑ons might influence symptoms/risks.
 * The relationships are heuristic (rule-of-thumb), not clinical.
 */

export default function ParkinsonsPlayground() {
  // --- Inputs (you can tweak ranges as you like) ---
  const [age, setAge] = useState(68);
  const [yearsPD, setYearsPD] = useState(13);
  const [dayLevo, setDayLevo] = useState(800); // total daytime immediate‑release levodopa (mg/day)
  const [nightCR, setNightCR] = useState(0); // controlled‑release levodopa at night (mg)
  const [dosesPerDay, setDosesPerDay] = useState(4); // count of daytime doses
  const [hasEntacapone, setHasEntacapone] = useState(true); // Stalevo
  const [amantadine, setAmantadine] = useState(false);
  const [anticholinergic, setAnticholinergic] = useState(false); // trihexyphenidyl/benzhexol
  const [ssri, setSSRI] = useState(false); // sertraline

  // --- Helper math ---
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const lerp = (a, b, t) => a + (b - a) * t;

  // Convert inputs into broad pharmacologic features
  const features = useMemo(() => {
    const totalL = dayLevo + 0.8 * nightCR; // night CR contributes less to daytime effect

    // Normalize to a 0-1 scale roughly across 0–1400 mg
    const L = clamp01(totalL / 1400);

    // Entacapone extends duration mildly (less wearing off), small ↑ peak effects
    const ext = hasEntacapone ? 0.12 : 0.0; // duration extender

    // Dosing frequency smooths fluctuations
    const smooth = clamp01((dosesPerDay - 3) / (6 - 3)); // 3→0, 6→1

    // Disease burden proxy
    const burden = clamp01((yearsPD - 3) / 17); // grows from year 3 to 20

    // Age sensitivity (older age increases side‑effect risk)
    const ageSens = clamp01((age - 55) / 30); // 55→0, 85→1

    // Amantadine tends to reduce dyskinesia (and may help freezing)
    const amantadineFx = amantadine ? 0.18 : 0.0;

    // Anticholinergic improves tremor a bit but harms cognition/constipation
    const antiCholinTremorBoost = anticholinergic ? 0.12 : 0.0;
    const antiCholinCognitiveHit = anticholinergic ? 0.28 : 0.0;

    // SSRI helps mood/energy slightly, mild interaction risk
    const ssriMoodBoost = ssri ? 0.18 : 0.0;

    return { L, ext, smooth, burden, ageSens, amantadineFx, antiCholinTremorBoost, antiCholinCognitiveHit, ssriMoodBoost };
  }, [dayLevo, nightCR, hasEntacapone, dosesPerDay, yearsPD, age, amantadine, anticholinergic, ssri]);

  // --- Heuristic outcome scores (0–100 where higher = better/safer unless noted)
  const outcomes = useMemo(() => {
    const { L, ext, smooth, burden, ageSens, amantadineFx, antiCholinTremorBoost, antiCholinCognitiveHit, ssriMoodBoost } = features;

    // Motor control improves with levodopa and smoothing; heavy burden opposes
    const tremorControl = clamp01(0.25 + 0.65 * L + 0.15 * smooth + 0.10 * ext + antiCholinTremorBoost - 0.25 * burden);
    const rigidityControl = clamp01(0.20 + 0.70 * L + 0.15 * smooth + 0.10 * ext - 0.30 * burden);

    // Morning stiffness improves with night CR and extender
    const morningStiffness = clamp01(0.75 - 0.55 * (nightCR / 300) - 0.20 * ext); // LOWER is better → we'll invert for display

    // Wearing off risk decreases with smoother dosing & extender; increases with high burden
    const wearingOffRisk = clamp01(0.55 - 0.35 * smooth - 0.20 * ext + 0.25 * burden);

    // Dyskinesia risk rises with high L and burden; reduced by amantadine
    const dyskinesiaRisk = clamp01(-0.15 + 1.10 * L + 0.25 * burden - 0.35 * amantadineFx);

    // Hallucination/confusion risk rises with age & high L; entacapone neutral; anticholinergic worsens
    const hallucinationRisk = clamp01(-0.25 + 0.85 * L + 0.55 * ageSens + 0.25 * burden + 0.35 * antiCholinCognitiveHit);

    // Orthostatic hypotension risk rises with high L and age
    const hypotensionRisk = clamp01(0.10 + 0.60 * L + 0.40 * ageSens);

    // Sleep quality: improved by night CR (less nocturnal off), worsened by hallucinations; RBD/insomnia ignored
    const sleepQuality = clamp01(0.45 + 0.40 * (nightCR / 300) - 0.35 * hallucinationRisk);

    // Mood/energy: helped by adequate L (to a point) and SSRI
    const moodEnergy = clamp01(0.35 + 0.45 * L + ssriMoodBoost - 0.15 * burden);

    return {
      tremorControl: Math.round(tremorControl * 100),
      rigidityControl: Math.round(rigidityControl * 100),
      morningStiffness: Math.round((1 - morningStiffness) * 100), // invert so higher is better
      wearingOffRisk: Math.round(wearingOffRisk * 100),
      dyskinesiaRisk: Math.round(dyskinesiaRisk * 100),
      hallucinationRisk: Math.round(hallucinationRisk * 100),
      hypotensionRisk: Math.round(hypotensionRisk * 100),
      sleepQuality: Math.round(sleepQuality * 100),
      moodEnergy: Math.round(moodEnergy * 100),
    };
  }, [features, nightCR]);

  // Helper UI components
  const Slider = ({ label, value, min, max, step, onChange, unit }) => (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1"><span className="font-medium">{label}</span><span className="opacity-70">{value}{unit || ""}</span></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e)=>onChange(Number(e.target.value))} className="w-full" />
      <div className="flex justify-between text-xs text-gray-500"><span>{min}{unit||""}</span><span>{max}{unit||""}</span></div>
    </div>
  );

  const Toggle = ({ label, value, onChange, hint }) => (
    <label className="flex items-center gap-2 text-sm mb-2">
      <input type="checkbox" checked={value} onChange={(e)=>onChange(e.target.checked)} />
      <span className="font-medium">{label}</span>
      {hint && <span className="text-gray-500">— {hint}</span>}
    </label>
  );

  const Bar = ({ label, value, good=true }) => {
    // color scale: red→amber→green (or inverse if good=false)
    const pct = Math.max(0, Math.min(100, value));
    const hue = good ? Math.round((pct/100)*120) : Math.round((1-pct/100)*120); // 0=red,120=green
    return (
      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="font-medium">{label}</span>
          <span className="opacity-70">{pct}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full" style={{ width: `${pct}%`, backgroundColor: `hsl(${hue} 80% 45%)` }} />
        </div>
      </div>
    );
  };

  // Presets
  const applyPreset = (name) => {
    if (name === "stalevo800") {
      setDayLevo(800); setNightCR(0); setDosesPerDay(4); setHasEntacapone(true); setAmantadine(false); setAnticholinergic(false); setSSRI(false);
    } else if (name === "syndopa1100cr") {
      setDayLevo(1100 - 250); // ~850 day + CR 250 ~1100 total-ish
      setNightCR(250); setDosesPerDay(4); setHasEntacapone(false); setAmantadine(true); setAnticholinergic(false); setSSRI(true);
    } else if (name === "step900cr100") {
      setDayLevo(800);
      setNightCR(100);
      setDosesPerDay(4);
      setHasEntacapone(true);
      setAmantadine(false);
      setAnticholinergic(false);
      setSSRI(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto text-gray-900">
      <h1 className="text-2xl font-bold mb-2">Parkinson’s Medication Effects Playground</h1>
      <p className="text-sm text-gray-600 mb-4">Educational simulator to explore how adjustments might influence symptoms and risks. It uses simple rules, not real patient data. Always seek clinician guidance.</p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="rounded-2xl p-4 shadow bg-white">
          <h2 className="font-semibold mb-3">Inputs</h2>

          <Slider label="Age" value={age} min={45} max={85} step={1} onChange={setAge} unit=" yrs" />
          <Slider label="Years since PD diagnosis" value={yearsPD} min={0} max={20} step={1} onChange={setYearsPD} unit=" yrs" />
          <Slider label="Daytime levodopa total" value={dayLevo} min={200} max={1400} step={50} onChange={setDayLevo} unit=" mg/day" />
          <Slider label="Night-time CR levodopa" value={nightCR} min={0} max={300} step={50} onChange={setNightCR} unit=" mg" />
          <Slider label="Doses per day (daytime)" value={dosesPerDay} min={3} max={6} step={1} onChange={setDosesPerDay} unit="×" />

          <div className="mt-3">
            <Toggle label="Entacapone (Stalevo)" value={hasEntacapone} onChange={setHasEntacapone} hint="extends dose duration" />
            <Toggle label="Amantadine" value={amantadine} onChange={setAmantadine} hint="may reduce dyskinesia" />
            <Toggle label="Anticholinergic (trihexyphenidyl)" value={anticholinergic} onChange={setAnticholinergic} hint="helps tremor but hurts cognition" />
            <Toggle label="SSRI (sertraline)" value={ssri} onChange={setSSRI} hint="supports mood/energy" />
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <button onClick={()=>applyPreset("stalevo800")} className="px-3 py-1 rounded-full text-sm bg-gray-800 text-white">Preset: Stalevo 200 ×4</button>
            <button onClick={()=>applyPreset("syndopa1100cr")} className="px-3 py-1 rounded-full text-sm bg-blue-700 text-white">Preset: Syndopa 275 ×4 + CR 250</button>
            <button onClick={()=>applyPreset("step900cr100")} className="px-3 py-1 rounded-full text-sm bg-emerald-700 text-white">Preset: Step to ~900 (CR 100)</button>
          </div>
        </div>

        {/* Outputs */}
        <div className="rounded-2xl p-4 shadow bg-white">
          <h2 className="font-semibold mb-3">Estimated Effects</h2>
          <Bar label="Tremor control" value={outcomes.tremorControl} />
          <Bar label="Rigidity control" value={outcomes.rigidityControl} />
          <Bar label="Morning comfort (less stiffness)" value={outcomes.morningStiffness} />
          <Bar label="Sleep quality" value={outcomes.sleepQuality} />
          <Bar label="Mood / energy" value={outcomes.moodEnergy} />
          <div className="h-px bg-gray-200 my-3" />
          <Bar label="Wearing‑off risk" value={outcomes.wearingOffRisk} good={false} />
          <Bar label="Dyskinesia risk" value={outcomes.dyskinesiaRisk} good={false} />
          <Bar label="Hallucination / confusion risk" value={outcomes.hallucinationRisk} good={false} />
          <Bar label="Low BP (orthostatic) risk" value={outcomes.hypotensionRisk} good={false} />

          <p className="text-xs text-gray-500 mt-3">Higher bars in the top group are desirable. In the risk group, lower bars are better. These are heuristic scores for learning — they do not predict an individual outcome.</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl p-4 shadow bg-white">
        <h2 className="font-semibold mb-2">How to use this tool</h2>
        <ol className="list-decimal ml-5 text-sm space-y-1">
          <li>Load a preset that matches a real regimen, then tweak one control at a time.</li>
          <li>Watch how <span className="font-medium">tremor/rigidity control</span> rises with levodopa, while <span className="font-medium">dyskinesia & hallucination risk</span> also change.</li>
          <li>Turn on <span className="font-medium">Entacapone</span> to see how duration improves (less wearing‑off) without a big spike.</li>
          <li>Add <span className="font-medium">night‑time CR</span> to improve morning comfort and sleep, with minimal impact on daytime peaks.</li>
          <li>Use these insights only to frame questions for your clinician — do not change medication without guidance.</li>
        </ol>
        <p className="text-xs text-gray-500 mt-2">Model v0.1 heuristic assumptions: linearized dose‑response; CR contributes ~80% as much to day effect; age & disease duration amplify risks; amantadine reduces dyskinesia risk; anticholinergic improves tremor but worsens cognition.</p>
      </div>
    </div>
  );
}
