import React, { useState } from "react";

export default function ParkinsonsPlayground() {
  // --- Preset 1 (baseline) ---
  const preset = {
    age: 68,
    yearsSinceDx: 13,
    daytimeLevodopa: 800,
    nighttimeCR: 0,
    dosesPerDay: 4,
    meds: {
      stalevo: true,
      perkirol: true,
      losar: true,
      cilacar: true,
      clare: true,
      neuryl: true,
      zycel: true,
      deek: true,
      wellwoman: true,
    },
  };

  const [age, setAge] = useState(preset.age);
  const [years, setYears] = useState(preset.yearsSinceDx);
  const [dayLD, setDayLD] = useState(preset.daytimeLevodopa);
  const [nightLD, setNightLD] = useState(preset.nighttimeCR);
  const [doses, setDoses] = useState(preset.dosesPerDay);
  const [meds, setMeds] = useState(preset.meds);

  const toggleMed = (key) => setMeds((prev) => ({ ...prev, [key]: !prev[key] }));

  const loadPreset = () => {
    setAge(preset.age);
    setYears(preset.yearsSinceDx);
    setDayLD(preset.daytimeLevodopa);
    setNightLD(preset.nighttimeCR);
    setDoses(preset.dosesPerDay);
    setMeds(preset.meds);
  };

  // --- effect model ---
  const totalLD = dayLD + nightLD;

  // Base values
  let tremorControl = (totalLD / 900) * 80;
  let mobility = (tremorControl * 0.9);
  let sleepQuality = 60;
  let energy = 60;
  let dyskinesia = (totalLD / 1000) * 50;
  let confusion = (age - 65) * 2;

  // Medication-based modifiers
  if (meds.stalevo) { tremorControl += 15; mobility += 10; dyskinesia += 10; }
  if (meds.perkirol) { tremorControl += 5; confusion += 10; }
  if (meds.losar) { energy -= 5; dyskinesia -= 5; }
  if (meds.cilacar) { mobility += 5; sleepQuality += 3; }
  if (meds.clare) { energy += 2; }
  if (meds.neuryl) { sleepQuality += 15; mobility -= 5; }
  if (meds.zycel) { sleepQuality += 10; energy -= 5; }
  if (meds.deek) { energy += 5; mobility += 3; }
  if (meds.wellwoman) { energy += 10; sleepQuality += 2; }

  // Clamp all values 0–100
  const clamp = (v) => Math.max(0, Math.min(100, v));
  tremorControl = clamp(tremorControl);
  mobility = clamp(mobility);
  sleepQuality = clamp(sleepQuality);
  energy = clamp(energy);
  dyskinesia = clamp(dyskinesia);
  confusion = clamp(confusion);

  const bar = (label, value, color) => (
    <div key={label} className="mb-3">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>{Math.round(value)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );

  const medList = [
    { key: "stalevo", name: "Stalevo 200 mg", desc: "Levodopa + Carbidopa + Entacapone — main dopamine therapy." },
    { key: "perkirol", name: "Perkirol 2 mg", desc: "Trihexyphenidyl — tremor helper; may cause confusion." },
    { key: "losar", name: "Losar 50 mg", desc: "Losartan — BP and kidney protection." },
    { key: "cilacar", name: "Cilacar 5 mg", desc: "Cilnidipine — BP control, improves leg circulation." },
    { key: "clare", name: "Clare 5", desc: "Clopidogrel 75 mg — antiplatelet to prevent clots." },
    { key: "neuryl", name: "Neuryl 2 mg (¼ tab night)", desc: "Clonazepam — improves sleep, may reduce alertness." },
    { key: "zycel", name: "Zycel 100 mg", desc: "Pregabalin — leg pain & sleep support." },
    { key: "deek", name: "Deek 1000 IU", desc: "Vitamin D3 — bone/muscle health." },
    { key: "wellwoman", name: "Wellwoman NST", desc: "Multivitamin — boosts energy & vitality." },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 font-sans">
      <h1 className="text-2xl font-bold mb-4 text-center">Parkinson’s Medication Simulator — Preset 1</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: controls */}
        <div>
          {/* Sliders */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="font-medium">Age: {age} yrs</label>
              <input type="range" min="50" max="90" value={age}
                onChange={(e) => setAge(+e.target.value)} className="w-full" />
            </div>
            <div>
              <label className="font-medium">Years since diagnosis: {years}</label>
              <input type="range" min="0" max="20" value={years}
                onChange={(e) => setYears(+e.target.value)} className="w-full" />
            </div>
            <div>
              <label className="font-medium">Daytime Levodopa total: {dayLD} mg</label>
              <input type="range" min="400" max="1200" step="50" value={dayLD}
                onChange={(e) => setDayLD(+e.target.value)} className="w-full" />
            </div>
            <div>
              <label className="font-medium">Night-time CR dose: {nightLD} mg</label>
              <input type="range" min="0" max="300" step="50" value={nightLD}
                onChange={(e) => setNightLD(+e.target.value)} className="w-full" />
            </div>
            <div>
              <label className="font-medium">Doses per day: {doses}</label>
              <input type="range" min="3" max="6" value={doses}
                onChange={(e) => setDoses(+e.target.value)} className="w-full" />
            </div>
          </div>

          {/* Preset button */}
          <button
            onClick={loadPreset}
            className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Load Preset 1
          </button>

          {/* Medication toggles */}
          <h2 className="text-xl font-semibold mb-2">Current Medications</h2>
          <div className="space-y-2">
            {medList.map((m) => (
              <div key={m.key}
                className="flex items-start justify-between bg-gray-50 p-2 rounded border">
                <div>
                  <p className="font-medium">{m.name}</p>
                  <p className="text-sm text-gray-600">{m.desc}</p>
                </div>
                <label className="inline-flex items-center cursor-pointer ml-2">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={meds[m.key]}
                    onChange={() => toggleMed(m.key)}
                  />
                  <div className="relative w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors">
                    <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform peer-checked:translate-x-5" />
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: effects */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Estimated Effects</h2>
          {bar("Tremor / Rigidity Control", tremorControl, "bg-green-500")}
          {bar("Mobility / Energy", mobility, "bg-blue-500")}
          {bar("Sleep Quality", sleepQuality, "bg-purple-500")}
          {bar("Dyskinesia Risk", dyskinesia, "bg-yellow-500")}
          {bar("Confusion / Hallucination Risk", confusion, "bg-red-500")}
          {bar("Overall Energy Level", energy, "bg-cyan-500")}
          <p className="text-xs text-gray-500 mt-4">
            *Educational simulation only — not a medical decision tool.
          </p>
        </div>
      </div>
    </div>
  );
}
