"use client";

import type { ReactNode } from "react";

import { getExerciseVisualProfile } from "@/lib/exercise-media";

type ExerciseVisualCardProps = {
  exercise: {
    base: string;
    variant: string;
    muscle_group: string;
    equipment: string;
  } | null;
  caption?: string;
};

type FigureProps = {
  zones: string[];
  side: "front" | "back";
};

function renderZone(zone: string, side: "front" | "back") {
  const fill = "rgba(180, 35, 24, 0.72)";

  if (zone === "full-body") {
    return (
      <g key={`${side}-${zone}`} fill={fill}>
        <circle cx={side === "front" ? 48 : 120} cy="26" r="9" />
        <rect height="48" rx="16" width="34" x={side === "front" ? 31 : 103} y="38" />
        <rect height="48" rx="10" width="12" x={side === "front" ? 37 : 109} y="88" />
        <rect height="48" rx="10" width="12" x={side === "front" ? 75 : 147} y="88" />
      </g>
    );
  }

  const x = side === "front" ? 0 : 72;
  const shapes: Record<string, ReactNode> = {
    chest: <rect height="18" rx="9" width="38" x={35 + x} y="48" />,
    shoulders: (
      <>
        <circle cx={33 + x} cy="49" r="9" />
        <circle cx={73 + x} cy="49" r="9" />
      </>
    ),
    "rear-shoulders": (
      <>
        <circle cx={105 + x} cy="49" r="9" />
        <circle cx={145 + x} cy="49" r="9" />
      </>
    ),
    biceps: (
      <>
        <rect height="22" rx="7" width="10" x={18 + x} y="56" />
        <rect height="22" rx="7" width="10" x={78 + x} y="56" />
      </>
    ),
    triceps: (
      <>
        <rect height="22" rx="7" width="10" x={90 + x} y="56" />
        <rect height="22" rx="7" width="10" x={150 + x} y="56" />
      </>
    ),
    forearms: (
      <>
        <rect height="22" rx="7" width="10" x={14 + x} y="80" />
        <rect height="22" rx="7" width="10" x={82 + x} y="80" />
      </>
    ),
    core: <rect height="34" rx="10" width="24" x={42 + x} y="66" />,
    back: <rect height="38" rx="12" width="34" x={109 + x} y="46" />,
    traps: <rect height="12" rx="6" width="34" x={109 + x} y="40" />,
    "lower-back": <rect height="14" rx="7" width="24" x={114 + x} y="82" />,
    quads: (
      <>
        <rect height="34" rx="10" width="12" x={40 + x} y="98" />
        <rect height="34" rx="10" width="12" x={56 + x} y="98" />
      </>
    ),
    hamstrings: (
      <>
        <rect height="34" rx="10" width="12" x={114 + x} y="98" />
        <rect height="34" rx="10" width="12" x={130 + x} y="98" />
      </>
    ),
    glutes: <rect height="18" rx="8" width="28" x={112 + x} y="88" />,
    calves: (
      <>
        <rect height="26" rx="9" width="10" x={44 + x} y="132" />
        <rect height="26" rx="9" width="10" x={128 + x} y="132" />
      </>
    ),
  };

  return (
    <g key={`${side}-${zone}`} fill={fill}>
      {shapes[zone] ?? null}
    </g>
  );
}

function Figure({ zones, side }: FigureProps) {
  const headX = side === "front" ? 48 : 120;
  const bodyX = side === "front" ? 31 : 103;
  const armLeftX = side === "front" ? 17 : 89;
  const armRightX = side === "front" ? 69 : 141;
  const legLeftX = side === "front" ? 39 : 111;
  const legRightX = side === "front" ? 57 : 129;

  return (
    <g>
      {zones.map((zone) => renderZone(zone, side))}
      <g fill="none" opacity="0.72" stroke="rgba(24, 32, 38, 0.36)" strokeWidth="4">
        <circle cx={headX} cy="26" r="10" />
        <rect height="50" rx="17" width="34" x={bodyX} y="38" />
        <rect height="34" rx="9" width="10" x={armLeftX} y="58" />
        <rect height="34" rx="9" width="10" x={armRightX} y="58" />
        <rect height="48" rx="10" width="12" x={legLeftX} y="88" />
        <rect height="48" rx="10" width="12" x={legRightX} y="88" />
        <rect height="28" rx="8" width="10" x={legLeftX + 2} y="136" />
        <rect height="28" rx="8" width="10" x={legRightX + 2} y="136" />
      </g>
    </g>
  );
}

export function ExerciseVisualCard({ exercise, caption }: ExerciseVisualCardProps) {
  const profile = getExerciseVisualProfile(exercise);

  return (
    <div className="exercise-visual-card">
      <div className="exercise-visual-meta">
        <span className="exercise-visual-badge">{profile.muscleGroup}</span>
        <small>{caption ?? "Vista anatómica orientativa"}</small>
      </div>
      <div className="exercise-visual-frame">
        <svg aria-hidden="true" className="exercise-visual-svg" viewBox="0 0 170 170">
          <Figure side="front" zones={profile.frontZones} />
          <Figure side="back" zones={profile.backZones} />
        </svg>
        <div className="exercise-visual-caption">
          <strong>{profile.title}</strong>
          <span>{profile.subtitle}</span>
        </div>
      </div>
      <small className="exercise-visual-note">
        Hueco listo para imagen, vídeo o animación 3D si luego se licencia una fuente de media.
      </small>
    </div>
  );
}
