"use client";

import type { ReactNode } from "react";

import {
  anatomyZones,
  getExerciseVisualProfile,
  getSelectedMuscleGroups,
  type AnatomyZoneId,
} from "@/lib/exercise-media";

type ExerciseVisualCardProps = {
  exercise: {
    base: string;
    variant: string;
    muscle_group: string;
    equipment: string;
  } | null;
  caption?: string;
  interactive?: boolean;
  selectedZones?: AnatomyZoneId[];
  onToggleZone?: (zone: AnatomyZoneId) => void;
};

type ShapeProps = {
  active: boolean;
  interactive: boolean;
  label: string;
  onClick?: () => void;
};

function AnatomyShape({
  children,
  active,
  interactive,
  label,
  onClick,
}: ShapeProps & { children: ReactNode }) {
  return (
    <g
      aria-label={label}
      className={`anatomy-zone ${active ? "active" : ""} ${interactive ? "interactive" : ""}`}
      onClick={interactive ? onClick : undefined}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      {children}
    </g>
  );
}

function HumanFigure({
  side,
  activeZones,
  interactive,
  onToggleZone,
}: {
  side: "front" | "back";
  activeZones: AnatomyZoneId[];
  interactive: boolean;
  onToggleZone?: (zone: AnatomyZoneId) => void;
}) {
  const x = side === "front" ? 0 : 170;
  const zones = anatomyZones.filter((item) => item.side === side);
  const isActive = (zone: AnatomyZoneId) => activeZones.includes(zone);

  return (
    <g transform={`translate(${x}, 0)`}>
      <g className="anatomy-base">
        <circle cx="86" cy="26" r="16" />
        <path d="M86 44 C58 44 45 62 45 88 L45 112 C45 126 58 136 72 136 L100 136 C114 136 127 126 127 112 L127 88 C127 62 114 44 86 44 Z" />
        <path d="M45 76 C28 84 22 106 28 125 L34 146 C36 154 42 158 48 156 C55 154 57 148 56 140 L54 121 C53 111 58 104 66 100" />
        <path d="M127 76 C144 84 150 106 144 125 L138 146 C136 154 130 158 124 156 C117 154 115 148 116 140 L118 121 C119 111 114 104 106 100" />
        <path d="M74 136 L66 204 C65 214 70 222 78 222 C86 222 90 214 90 206 L90 162" />
        <path d="M98 136 L106 204 C107 214 102 222 94 222 C86 222 82 214 82 206 L82 162" />
      </g>

      {zones.map((zone) => {
        const shared = {
          active: isActive(zone.id),
          interactive,
          label: zone.label,
          onClick: () => onToggleZone?.(zone.id),
        };

        switch (zone.id) {
          case "chest":
            return (
              <AnatomyShape key={zone.id} {...shared}>
                <path d="M58 64 C66 54 80 52 86 62 C92 52 106 54 114 64 L112 94 C104 101 94 104 86 106 C78 104 68 101 60 94 Z" />
              </AnatomyShape>
            );
          case "front-delts":
            return (
              <AnatomyShape key={zone.id} {...shared}>
                <path d="M49 62 C39 66 35 76 36 88 C47 92 57 86 60 76 C60 68 56 63 49 62 Z" />
                <path d="M123 62 C133 66 137 76 136 88 C125 92 115 86 112 76 C112 68 116 63 123 62 Z" />
              </AnatomyShape>
            );
          case "biceps":
            return (
              <AnatomyShape key={zone.id} {...shared}>
                <path d="M34 102 C28 108 27 120 32 128 C38 132 44 126 44 118 C44 109 40 103 34 102 Z" />
                <path d="M138 102 C144 108 145 120 140 128 C134 132 128 126 128 118 C128 109 132 103 138 102 Z" />
              </AnatomyShape>
            );
          case "forearms":
            return (
              <AnatomyShape key={zone.id} {...shared}>
                <path d="M38 130 C32 138 31 148 34 156 C40 158 45 154 46 146 C46 139 44 133 38 130 Z" />
                <path d="M134 130 C140 138 141 148 138 156 C132 158 127 154 126 146 C126 139 128 133 134 130 Z" />
              </AnatomyShape>
            );
          case "core":
            return (
              <AnatomyShape key={zone.id} {...shared}>
                <path d="M66 96 C72 92 79 90 86 90 C93 90 100 92 106 96 L100 136 C94 144 90 152 86 160 C82 152 78 144 72 136 Z" />
              </AnatomyShape>
            );
          case "quads":
            return (
              <AnatomyShape key={zone.id} {...shared}>
                <path d="M66 140 C60 152 58 170 62 188 C67 194 74 190 76 182 L80 144 Z" />
                <path d="M106 140 C112 152 114 170 110 188 C105 194 98 190 96 182 L92 144 Z" />
              </AnatomyShape>
            );
          case "rear-delts":
            return (
              <AnatomyShape key={zone.id} {...shared}>
                <path d="M49 64 C39 68 34 78 36 90 C47 94 57 89 60 78 C59 69 55 65 49 64 Z" />
                <path d="M123 64 C133 68 138 78 136 90 C125 94 115 89 112 78 C113 69 117 65 123 64 Z" />
              </AnatomyShape>
            );
          case "traps":
            return (
              <AnatomyShape key={zone.id} {...shared}>
                <path d="M61 58 C70 50 80 46 86 46 C92 46 102 50 111 58 L108 74 C100 72 93 70 86 70 C79 70 72 72 64 74 Z" />
              </AnatomyShape>
            );
          case "lats":
            return (
              <AnatomyShape key={zone.id} {...shared}>
                <path d="M58 76 C64 70 74 68 86 68 C98 68 108 70 114 76 L108 124 C100 130 93 134 86 136 C79 134 72 130 64 124 Z" />
              </AnatomyShape>
            );
          case "triceps":
            return (
              <AnatomyShape key={zone.id} {...shared}>
                <path d="M34 100 C28 106 27 118 32 126 C39 130 44 124 44 116 C44 108 40 102 34 100 Z" />
                <path d="M138 100 C144 106 145 118 140 126 C133 130 128 124 128 116 C128 108 132 102 138 100 Z" />
              </AnatomyShape>
            );
          case "lower-back":
            return (
              <AnatomyShape key={zone.id} {...shared}>
                <path d="M72 122 C76 118 81 116 86 116 C91 116 96 118 100 122 L96 146 C92 150 89 154 86 160 C83 154 80 150 76 146 Z" />
              </AnatomyShape>
            );
          case "glutes":
            return (
              <AnatomyShape key={zone.id} {...shared}>
                <path d="M66 140 C74 134 80 132 86 132 C92 132 98 134 106 140 L100 162 C95 168 90 170 86 170 C82 170 77 168 72 162 Z" />
              </AnatomyShape>
            );
          case "hamstrings":
            return (
              <AnatomyShape key={zone.id} {...shared}>
                <path d="M68 164 C62 174 61 192 66 208 C71 212 76 208 78 198 L80 166 Z" />
                <path d="M104 164 C110 174 111 192 106 208 C101 212 96 208 94 198 L92 166 Z" />
              </AnatomyShape>
            );
          case "calves":
            return (
              <AnatomyShape key={zone.id} {...shared}>
                <path d="M69 206 C64 214 64 224 69 232 C75 236 80 232 80 224 C80 216 76 208 69 206 Z" />
                <path d="M103 206 C108 214 108 224 103 232 C97 236 92 232 92 224 C92 216 96 208 103 206 Z" />
              </AnatomyShape>
            );
          default:
            return null;
        }
      })}
    </g>
  );
}

function getSelectionSummary(selectedZones: AnatomyZoneId[]) {
  if (selectedZones.length === 0) {
    return "Sin filtro manual";
  }

  const labels = anatomyZones
    .filter((zone) => selectedZones.includes(zone.id))
    .map((zone) => zone.label);

  return labels.join(" · ");
}

export function ExerciseVisualCard({
  exercise,
  caption,
  interactive = false,
  selectedZones = [],
  onToggleZone,
}: ExerciseVisualCardProps) {
  const profile = getExerciseVisualProfile(exercise);
  const activeFront = interactive ? selectedZones.filter((zone) => anatomyZones.find((item) => item.id === zone)?.side === "front") : profile.frontZones;
  const activeBack = interactive ? selectedZones.filter((zone) => anatomyZones.find((item) => item.id === zone)?.side === "back") : profile.backZones;
  const selectedGroups = getSelectedMuscleGroups(selectedZones);

  return (
    <div className={`exercise-visual-card ${interactive ? "interactive" : "static"}`}>
      <div className="exercise-visual-meta">
        <span className="exercise-visual-badge">{interactive ? "Mapa interactivo" : profile.muscleGroup}</span>
        <small>{caption ?? "Vista anatómica orientativa"}</small>
      </div>

      <div className="exercise-visual-frame">
        <div className="exercise-visual-map-header">
          <strong>{interactive ? "Selecciona músculos objetivo" : profile.title}</strong>
          <span>{interactive ? getSelectionSummary(selectedZones) : profile.subtitle}</span>
        </div>

        <svg aria-hidden="true" className="exercise-visual-svg" viewBox="0 0 340 240">
          <HumanFigure activeZones={activeFront} interactive={interactive} onToggleZone={onToggleZone} side="front" />
          <HumanFigure activeZones={activeBack} interactive={interactive} onToggleZone={onToggleZone} side="back" />
        </svg>

        {interactive ? (
          <div className="exercise-visual-targets">
            {selectedGroups.length > 0 ? (
              selectedGroups.map((group) => (
                <span className="exercise-visual-target-chip" key={group}>
                  {group}
                </span>
              ))
            ) : (
              <small>Toca una o varias zonas para priorizar extras por músculo.</small>
            )}
          </div>
        ) : (
          <div className="exercise-visual-caption">
            <strong>{profile.title}</strong>
            <span>{profile.subtitle}</span>
          </div>
        )}
      </div>

      <small className="exercise-visual-note">
        {interactive
          ? "El filtro muscular reordena las recomendaciones, pero mantiene la valoración del día (++ + - --)."
          : "Vista anatómica propia. Si luego se licencia media real, esta tarjeta puede sustituirse por imagen, vídeo o 3D."}
      </small>
    </div>
  );
}
