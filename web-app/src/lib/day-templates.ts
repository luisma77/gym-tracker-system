export type TemplateEntry = { family: string; variant: string; subfamily: string | null; defaultSets: number; };
export type TemplateSection = { section: string; entries: TemplateEntry[]; };
export type DayTemplate = { label: string; sheet: string; sections: TemplateSection[]; };

export const dayTemplates: DayTemplate[] = [
  {
    "label": "Dia 1 · Empuje A",
    "sheet": "LUNES",
    "sections": [
      {
        "section": "PECHO",
        "entries": [
          {
            "family": "Press Plano",
            "variant": "Mancuernas",
            "subfamily": "Medio",
            "defaultSets": 3
          },
          {
            "family": "Aperturas Inclinado",
            "variant": "Mancuernas Inclinado",
            "subfamily": "Alto",
            "defaultSets": 3
          },
          {
            "family": "Fondos",
            "variant": "Paralelas",
            "subfamily": "Bajo",
            "defaultSets": 3
          },
          {
            "family": "Aperturas Bajo",
            "variant": "Polea Baja Crossover",
            "subfamily": "Bajo",
            "defaultSets": 3
          },
          {
            "family": "Press Polea",
            "variant": "Barra Recta Diagonal Arriba",
            "subfamily": "Bajo",
            "defaultSets": 3
          }
        ]
      },
      {
        "section": "HOMBRO",
        "entries": [
          {
            "family": "Elevaciones Laterales",
            "variant": "Cable Polea Individual",
            "subfamily": null,
            "defaultSets": 3
          },
          {
            "family": "Press Militar",
            "variant": "Mancuernas Sentado",
            "subfamily": null,
            "defaultSets": 3
          }
        ]
      },
      {
        "section": "TRICEPS",
        "entries": [
          {
            "family": "Extension Triceps",
            "variant": "Katana",
            "subfamily": null,
            "defaultSets": 3
          }
        ]
      },
      {
        "section": "CUADRICEPS",
        "entries": [
          {
            "family": "Sentadilla",
            "variant": "Maquina",
            "subfamily": null,
            "defaultSets": 3
          }
        ]
      },
      {
        "section": "BICEPS",
        "entries": [
          {
            "family": "Curl Biceps",
            "variant": "Barra Recta Polea",
            "subfamily": null,
            "defaultSets": 3
          }
        ]
      },
      {
        "section": "CIERRE",
        "entries": [
          {
            "family": "Crunch",
            "variant": "Polea",
            "subfamily": null,
            "defaultSets": 3
          }
        ]
      }
    ]
  },
  {
    "label": "Dia 2 · Tiron A",
    "sheet": "MARTES",
    "sections": [
      {
        "section": "ESPALDA",
        "entries": [
          {
            "family": "Dominadas",
            "variant": "Polea Alta Prono Ancho",
            "subfamily": "Anchura",
            "defaultSets": 3
          },
          {
            "family": "Pulldown",
            "variant": "Multipower",
            "subfamily": "Anchura",
            "defaultSets": 3
          },
          {
            "family": "Remo",
            "variant": "Maquina Hammer Neutro Unilateral",
            "subfamily": "Densidad",
            "defaultSets": 3
          },
          {
            "family": "Remo",
            "variant": "Maquina Prono",
            "subfamily": "Densidad",
            "defaultSets": 3
          }
        ]
      },
      {
        "section": "BICEPS",
        "entries": [
          {
            "family": "Curl Biceps",
            "variant": "Inclinado Banco Mancuernas",
            "subfamily": null,
            "defaultSets": 3
          },
          {
            "family": "Curl Biceps",
            "variant": "Polea Baja Supino",
            "subfamily": null,
            "defaultSets": 3
          }
        ]
      },
      {
        "section": "ANTEBRAZO",
        "entries": [
          {
            "family": "Curl Muneca",
            "variant": "Supinado",
            "subfamily": null,
            "defaultSets": 3
          },
          {
            "family": "Curl Muneca",
            "variant": "Pronado",
            "subfamily": null,
            "defaultSets": 3
          }
        ]
      },
      {
        "section": "AGARRE",
        "entries": [
          {
            "family": "Farmer Carry",
            "variant": "Libre",
            "subfamily": null,
            "defaultSets": 3
          }
        ]
      },
      {
        "section": "TRICEPS",
        "entries": [
          {
            "family": "Skullcrusher",
            "variant": "Mancuerna Tumbado",
            "subfamily": null,
            "defaultSets": 3
          }
        ]
      },
      {
        "section": "CIERRE",
        "entries": [
          {
            "family": "Crunch",
            "variant": "Polea",
            "subfamily": null,
            "defaultSets": 3
          }
        ]
      }
    ]
  },
  {
    "label": "Dia 3 · Pierna A",
    "sheet": "MIERCOLES",
    "sections": [
      {
        "section": "FEMORAL / ISQUIO",
        "entries": [
          {
            "family": "Curl Femoral",
            "variant": "Tumbado Maquina",
            "subfamily": null,
            "defaultSets": 3
          },
          {
            "family": "Curl Femoral",
            "variant": "Sentado Maquina",
            "subfamily": null,
            "defaultSets": 3
          },
          {
            "family": "Curl Rumano",
            "variant": "Mancuernas",
            "subfamily": null,
            "defaultSets": 3
          }
        ]
      },
      {
        "section": "CUADRICEPS",
        "entries": [
          {
            "family": "Sentadilla",
            "variant": "Multipower Cuna Talones",
            "subfamily": null,
            "defaultSets": 3
          },
          {
            "family": "Prensa Pierna",
            "variant": "Individual Horizontal",
            "subfamily": null,
            "defaultSets": 3
          },
          {
            "family": "Extension Cuadriceps",
            "variant": "Vasto Externo",
            "subfamily": null,
            "defaultSets": 3
          },
          {
            "family": "Extension Cuadriceps",
            "variant": "Vasto Interno",
            "subfamily": null,
            "defaultSets": 3
          }
        ]
      },
      {
        "section": "GEMELO",
        "entries": [
          {
            "family": "Elevacion Gemelo",
            "variant": "Sentado",
            "subfamily": null,
            "defaultSets": 3
          },
          {
            "family": "Elevacion Gemelo",
            "variant": "De Pie",
            "subfamily": null,
            "defaultSets": 3
          }
        ]
      },
      {
        "section": "LUMBAR",
        "entries": [
          {
            "family": "Hiperextension",
            "variant": "Banco Romano",
            "subfamily": null,
            "defaultSets": 3
          },
          {
            "family": "Peso Muerto Parcial",
            "variant": "Barra",
            "subfamily": null,
            "defaultSets": 3
          }
        ]
      },
      {
        "section": "CORE / ABS",
        "entries": [
          {
            "family": "Crunch",
            "variant": "Polea",
            "subfamily": null,
            "defaultSets": 3
          },
          {
            "family": "Plancha",
            "variant": "Tumbado",
            "subfamily": null,
            "defaultSets": 3
          },
          {
            "family": "Rueda Abdominal",
            "variant": "Ab Wheel",
            "subfamily": null,
            "defaultSets": 3
          },
          {
            "family": "Elevacion Piernas",
            "variant": "Colgado",
            "subfamily": null,
            "defaultSets": 3
          }
        ]
      }
    ]
  },
  {
    "label": "Dia 4 · Empuje B",
    "sheet": "JUEVES",
    "sections": [
      {
        "section": "HOMBRO",
        "entries": [
          {
            "family": "Press Militar",
            "variant": "Multipower",
            "subfamily": null,
            "defaultSets": 3
          },
          {
            "family": "Elevaciones Laterales",
            "variant": "Drop Set Maquina",
            "subfamily": null,
            "defaultSets": 3
          },
          {
            "family": "Pajaro",
            "variant": "Elevacion Posterior",
            "subfamily": "Posterior",
            "defaultSets": 3
          },
          {
            "family": "Peck Deck Invertida",
            "variant": "Maquina",
            "subfamily": "Posterior",
            "defaultSets": 3
          },
          {
            "family": "Elevaciones Posteriores",
            "variant": "Polea Individual",
            "subfamily": "Posterior",
            "defaultSets": 3
          }
        ]
      },
      {
        "section": "PECHO",
        "entries": [
          {
            "family": "Press Plano",
            "variant": "Multipower",
            "subfamily": "Medio",
            "defaultSets": 3
          },
          {
            "family": "Press Inclinado",
            "variant": "Multipower",
            "subfamily": "Alto",
            "defaultSets": 3
          },
          {
            "family": "Aperturas",
            "variant": "Polea Baja Crossover",
            "subfamily": "Bajo",
            "defaultSets": 3
          }
        ]
      },
      {
        "section": "TRICEPS",
        "entries": [
          {
            "family": "Extension Triceps",
            "variant": "Polea Alta Cuerda",
            "subfamily": null,
            "defaultSets": 3
          },
          {
            "family": "Extension Triceps",
            "variant": "Press Neutro Polea Individual",
            "subfamily": null,
            "defaultSets": 3
          }
        ]
      },
      {
        "section": "CUADRICEPS",
        "entries": [
          {
            "family": "Extension Cuadriceps",
            "variant": "Vasto Interno",
            "subfamily": null,
            "defaultSets": 3
          }
        ]
      },
      {
        "section": "BICEPS",
        "entries": [
          {
            "family": "Curl Biceps",
            "variant": "Concentrado Maquina",
            "subfamily": null,
            "defaultSets": 3
          }
        ]
      },
      {
        "section": "CIERRE",
        "entries": [
          {
            "family": "Crunch",
            "variant": "Polea",
            "subfamily": null,
            "defaultSets": 3
          }
        ]
      }
    ]
  },
  {
    "label": "Dia 5 · Tiron B",
    "sheet": "SABADO",
    "sections": [
      {
        "section": "ESPALDA",
        "entries": [
          {
            "family": "Pulldown",
            "variant": "Polea Alta Brazos Rectos Prono",
            "subfamily": "Anchura",
            "defaultSets": 3
          },
          {
            "family": "Remo",
            "variant": "Maquina Neutro Estrecho",
            "subfamily": "Densidad",
            "defaultSets": 3
          },
          {
            "family": "Remo",
            "variant": "Maquina Neutro Ancho",
            "subfamily": "Densidad",
            "defaultSets": 3
          },
          {
            "family": "Peck Deck Invertida",
            "variant": "Maquina",
            "subfamily": "Densidad",
            "defaultSets": 3
          }
        ]
      },
      {
        "section": "BICEPS",
        "entries": [
          {
            "family": "Curl Biceps",
            "variant": "Concentrado Maquina",
            "subfamily": null,
            "defaultSets": 3
          },
          {
            "family": "Curl Martillo",
            "variant": "Polea Individual",
            "subfamily": null,
            "defaultSets": 3
          }
        ]
      },
      {
        "section": "ANTEBRAZO",
        "entries": [
          {
            "family": "Curl Muneca",
            "variant": "Supinado",
            "subfamily": null,
            "defaultSets": 3
          },
          {
            "family": "Curl Muneca",
            "variant": "Pronado",
            "subfamily": null,
            "defaultSets": 3
          }
        ]
      },
      {
        "section": "HOMBRO",
        "entries": [
          {
            "family": "Elevaciones Laterales",
            "variant": "Cable Polea Individual",
            "subfamily": null,
            "defaultSets": 3
          }
        ]
      },
      {
        "section": "TRAPECIOS",
        "entries": [
          {
            "family": "Encogimientos",
            "variant": "Mancuernas Trapecio",
            "subfamily": null,
            "defaultSets": 3
          },
          {
            "family": "Face Pull",
            "variant": "Polea Alta Cuerda",
            "subfamily": null,
            "defaultSets": 3
          }
        ]
      },
      {
        "section": "LUMBAR",
        "entries": [
          {
            "family": "Hiperextension",
            "variant": "Banco Romano",
            "subfamily": null,
            "defaultSets": 3
          }
        ]
      },
      {
        "section": "CIERRE",
        "entries": [
          {
            "family": "Crunch",
            "variant": "Polea",
            "subfamily": null,
            "defaultSets": 3
          }
        ]
      }
    ]
  },
  {
    "label": "Dia 6 · Pierna B",
    "sheet": "MIERCOLES",
    "sections": [
      {
        "section": "FEMORAL / ISQUIO",
        "entries": [
          {
            "family": "Curl Femoral",
            "variant": "Tumbado Maquina",
            "subfamily": null,
            "defaultSets": 3
          },
          {
            "family": "Curl Femoral",
            "variant": "Sentado Maquina",
            "subfamily": null,
            "defaultSets": 3
          },
          {
            "family": "Curl Rumano",
            "variant": "Mancuernas",
            "subfamily": null,
            "defaultSets": 3
          }
        ]
      },
      {
        "section": "CUADRICEPS",
        "entries": [
          {
            "family": "Sentadilla",
            "variant": "Multipower Cuna Talones",
            "subfamily": null,
            "defaultSets": 3
          },
          {
            "family": "Prensa Pierna",
            "variant": "Individual Horizontal",
            "subfamily": null,
            "defaultSets": 3
          },
          {
            "family": "Extension Cuadriceps",
            "variant": "Vasto Externo",
            "subfamily": null,
            "defaultSets": 3
          },
          {
            "family": "Extension Cuadriceps",
            "variant": "Vasto Interno",
            "subfamily": null,
            "defaultSets": 3
          }
        ]
      },
      {
        "section": "GEMELO",
        "entries": [
          {
            "family": "Elevacion Gemelo",
            "variant": "Sentado",
            "subfamily": null,
            "defaultSets": 3
          },
          {
            "family": "Elevacion Gemelo",
            "variant": "De Pie",
            "subfamily": null,
            "defaultSets": 3
          }
        ]
      },
      {
        "section": "LUMBAR",
        "entries": [
          {
            "family": "Hiperextension",
            "variant": "Banco Romano",
            "subfamily": null,
            "defaultSets": 3
          },
          {
            "family": "Peso Muerto Parcial",
            "variant": "Barra",
            "subfamily": null,
            "defaultSets": 3
          }
        ]
      },
      {
        "section": "CORE / ABS",
        "entries": [
          {
            "family": "Crunch",
            "variant": "Polea",
            "subfamily": null,
            "defaultSets": 3
          },
          {
            "family": "Plancha",
            "variant": "Tumbado",
            "subfamily": null,
            "defaultSets": 3
          },
          {
            "family": "Rueda Abdominal",
            "variant": "Ab Wheel",
            "subfamily": null,
            "defaultSets": 3
          },
          {
            "family": "Elevacion Piernas",
            "variant": "Colgado",
            "subfamily": null,
            "defaultSets": 3
          }
        ]
      }
    ]
  }
];
