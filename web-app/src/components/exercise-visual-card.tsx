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

type ZoneShellProps = {
  active: boolean;
  interactive: boolean;
  label: string;
  onClick?: () => void;
  children: ReactNode;
};

type FigureProps = {
  side: "front" | "back";
  activeZones: AnatomyZoneId[];
  interactive: boolean;
  onToggleZone?: (zone: AnatomyZoneId) => void;
};

function ZoneShell({ active, interactive, label, onClick, children }: ZoneShellProps) {
  return (
    <g
      aria-label={label}
      className={`anatomy-zone ${active ? "active" : ""} ${interactive ? "interactive" : ""}`}
      onClick={interactive ? onClick : undefined}
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
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {children}
    </g>
  );
}

function FigureBase({ side }: { side: "front" | "back" }) {
  return (
    <g className={`anatomy-base anatomy-base-${side}`}>
      <ellipse cx="90" cy="20" rx="17" ry="19" />
      <path d="M90 40 C80 40 72 48 71 58 L70 72 C76 78 83 82 90 82 C97 82 104 78 110 72 L109 58 C108 48 100 40 90 40 Z" />
      <path d="M55 66 C46 72 40 82 38 94 C41 102 48 106 56 104 L63 80 C63 74 60 69 55 66 Z" />
      <path d="M125 66 C134 72 140 82 142 94 C139 102 132 106 124 104 L117 80 C117 74 120 69 125 66 Z" />
      <path d="M66 80 C60 98 58 116 60 134 C68 144 78 150 90 150 C102 150 112 144 120 134 C122 116 120 98 114 80 C106 74 98 71 90 71 C82 71 74 74 66 80 Z" />
      <path d="M52 102 C45 114 44 128 48 140 C53 143 58 140 60 133 L63 112 C63 107 59 104 52 102 Z" />
      <path d="M128 102 C135 114 136 128 132 140 C127 143 122 140 120 133 L117 112 C117 107 121 104 128 102 Z" />
      <path d="M73 150 L66 204 C65 214 70 223 78 223 C85 223 89 217 89 208 L89 166" />
      <path d="M107 150 L114 204 C115 214 110 223 102 223 C95 223 91 217 91 208 L91 166" />
      <path d="M76 223 L73 247 C72 253 76 258 81 258 C87 258 90 252 90 246 L90 223" />
      <path d="M104 223 L107 247 C108 253 104 258 99 258 C93 258 90 252 90 246 L90 223" />
      {side === "front" ? (
        <>
          <path className="anatomy-detail" d="M72 56 C78 60 84 62 90 62 C96 62 102 60 108 56" />
          <path className="anatomy-detail" d="M70 88 C76 93 83 96 90 96 C97 96 104 93 110 88" />
          <path className="anatomy-detail" d="M76 103 L90 145 L104 103" />
          <path className="anatomy-detail" d="M79 110 L101 110" />
          <path className="anatomy-detail" d="M78 124 L102 124" />
        </>
      ) : (
        <>
          <path className="anatomy-detail" d="M72 56 C77 61 83 63 90 63 C97 63 103 61 108 56" />
          <path className="anatomy-detail" d="M72 80 L90 110 L108 80" />
          <path className="anatomy-detail" d="M90 82 L90 146" />
          <path className="anatomy-detail" d="M70 116 C77 121 83 124 90 124 C97 124 103 121 110 116" />
          <path className="anatomy-detail" d="M72 146 C78 152 83 155 90 155 C97 155 102 152 108 146" />
        </>
      )}
    </g>
  );
}

function renderZoneShape(zoneId: AnatomyZoneId, side: "front" | "back") {
  const front: Partial<Record<AnatomyZoneId, ReactNode>> = {
    chest: (
      <>
        <path d="M63 82 C71 71 82 67 90 74 C98 67 109 71 117 82 L112 108 C104 114 97 118 90 119 C83 118 76 114 68 108 Z" />
      </>
    ),
    "front-delts": (
      <>
        <path d="M55 69 C48 73 44 80 45 90 C52 95 60 93 65 86 C66 79 63 72 55 69 Z" />
        <path d="M125 69 C132 73 136 80 135 90 C128 95 120 93 115 86 C114 79 117 72 125 69 Z" />
      </>
    ),
    biceps: (
      <>
        <path d="M46 98 C40 104 38 115 42 124 C49 128 56 123 57 114 C57 107 53 100 46 98 Z" />
        <path d="M134 98 C140 104 142 115 138 124 C131 128 124 123 123 114 C123 107 127 100 134 98 Z" />
      </>
    ),
    forearms: (
      <>
        <path d="M47 123 C42 132 42 142 45 151 C51 154 56 149 57 141 C57 134 54 127 47 123 Z" />
        <path d="M133 123 C138 132 138 142 135 151 C129 154 124 149 123 141 C123 134 126 127 133 123 Z" />
      </>
    ),
    core: (
      <>
        <path d="M76 110 C80 103 85 100 90 100 C95 100 100 103 104 110 L100 146 C96 153 93 161 90 170 C87 161 84 153 80 146 Z" />
      </>
    ),
    quads: (
      <>
        <path d="M73 152 C66 165 65 182 69 200 C75 204 81 200 82 191 L84 153 Z" />
        <path d="M107 152 C114 165 115 182 111 200 C105 204 99 200 98 191 L96 153 Z" />
      </>
    ),
  };

  const back: Partial<Record<AnatomyZoneId, ReactNode>> = {
    "rear-delts": (
      <>
        <path d="M55 69 C48 73 44 80 45 90 C52 94 60 92 64 85 C64 79 61 72 55 69 Z" />
        <path d="M125 69 C132 73 136 80 135 90 C128 94 120 92 116 85 C116 79 119 72 125 69 Z" />
      </>
    ),
    traps: <path d="M68 58 C74 50 82 46 90 46 C98 46 106 50 112 58 L108 76 C101 72 95 70 90 70 C85 70 79 72 72 76 Z" />,
    lats: <path d="M66 83 C72 76 80 72 90 72 C100 72 108 76 114 83 L108 136 C102 141 96 145 90 146 C84 145 78 141 72 136 Z" />,
    triceps: (
      <>
        <path d="M46 95 C40 101 38 112 42 121 C48 125 55 121 57 112 C57 105 53 98 46 95 Z" />
        <path d="M134 95 C140 101 142 112 138 121 C132 125 125 121 123 112 C123 105 127 98 134 95 Z" />
      </>
    ),
    "lower-back": <path d="M78 118 C82 113 86 111 90 111 C94 111 98 113 102 118 L99 147 C96 151 93 157 90 165 C87 157 84 151 81 147 Z" />,
    glutes: <path d="M71 148 C78 142 84 139 90 139 C96 139 102 142 109 148 L103 171 C99 175 95 178 90 178 C85 178 81 175 77 171 Z" />,
    hamstrings: (
      <>
        <path d="M74 174 C68 187 68 205 73 221 C79 225 84 220 85 211 L86 176 Z" />
        <path d="M106 174 C112 187 112 205 107 221 C101 225 96 220 95 211 L94 176 Z" />
      </>
    ),
    calves: (
      <>
        <path d="M75 220 C70 228 70 239 74 249 C79 252 84 248 84 240 C84 233 81 224 75 220 Z" />
        <path d="M105 220 C110 228 110 239 106 249 C101 252 96 248 96 240 C96 233 99 224 105 220 Z" />
      </>
    ),
  };

  const bank = side === "front" ? front : back;
  return bank[zoneId] ?? null;
}

function Figure({ side, activeZones, interactive, onToggleZone }: FigureProps) {
  const zones = anatomyZones.filter((item) => item.side === side);

  return (
    <div className="exercise-figure-card">
      <div className="exercise-figure-label">{side === "front" ? "FRENTE" : "ESPALDA"}</div>
      <svg aria-hidden="true" className="exercise-figure-svg" viewBox="0 0 180 262">
        <FigureBase side={side} />
        {zones.map((zone) => {
          const shape = renderZoneShape(zone.id, side);
          if (!shape) {
            return null;
          }

          return (
            <ZoneShell
              active={activeZones.includes(zone.id)}
              interactive={interactive}
              key={zone.id}
              label={zone.label}
              onClick={() => onToggleZone?.(zone.id)}
            >
              {shape}
            </ZoneShell>
          );
        })}
      </svg>
    </div>
  );
}

function getSelectionSummary(selectedZones: AnatomyZoneId[]) {
  if (selectedZones.length === 0) {
    return "Sin filtro manual";
  }

  return anatomyZones
    .filter((zone) => selectedZones.includes(zone.id))
    .map((zone) => zone.label)
    .join(" · ");
}

export function ExerciseVisualCard({
  exercise,
  caption,
  interactive = false,
  selectedZones = [],
  onToggleZone,
}: ExerciseVisualCardProps) {
  const profile = getExerciseVisualProfile(exercise);
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

        <div className="exercise-visual-map-grid">
          <Figure activeZones={interactive ? selectedZones.filter((zone) => anatomyZones.find((item) => item.id === zone)?.side === "front") : profile.frontZones} interactive={interactive} onToggleZone={onToggleZone} side="front" />
          <Figure activeZones={interactive ? selectedZones.filter((zone) => anatomyZones.find((item) => item.id === zone)?.side === "back") : profile.backZones} interactive={interactive} onToggleZone={onToggleZone} side="back" />
        </div>

        {interactive ? (
          <div className="exercise-visual-targets">
            {selectedGroups.length > 0 ? (
              selectedGroups.map((group) => (
                <span className="exercise-visual-target-chip" key={group}>
                  {group}
                </span>
              ))
            ) : (
              <small>Toca frente o espalda para filtrar el extra por músculo objetivo.</small>
            )}
          </div>
        ) : (
          <div className="exercise-visual-caption">
            <strong>{profile.title}</strong>
            <span>{profile.subtitle}</span>
          </div>
        )}

        <div className="exercise-motion-placeholder">
          <div>
            <strong>Movimiento</strong>
            <small>Hueco reservado para una demo corta en MP4/WebM. No uso GIF como formato principal porque pierde calidad y pesa mucho.</small>
          </div>
          <span className="exercise-motion-pill">Próximo</span>
        </div>
      </div>

      <small className="exercise-visual-note">
        {interactive
          ? "El filtro muscular reordena las recomendaciones, pero mantiene la valoración del día (++ + - --)."
          : "Bodymap 2D propio. Si luego se licencia media real, esta tarjeta puede combinar mapa + vídeo corto del ejercicio."}
      </small>
    </div>
  );
}
