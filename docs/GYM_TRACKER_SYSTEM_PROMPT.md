# GYM TRACKER — SYSTEM PROMPT & TECHNICAL REFERENCE
> Formato: prompt de contexto para Claude u otras IAs en sesiones futuras.
> Úsalo tal cual al inicio de una nueva sesión para que la IA entienda el sistema.

---

## IDENTIDAD DEL PROYECTO

Este es un **tracker de entrenamiento de gimnasio de 12 semanas** implementado en Excel (.xlsx),
generado y editado mediante Python + openpyxl. El archivo es funcional en **Excel 2016** —
están prohibidas funciones modernas como `LET`, `FILTER`, `TAKE`, `XLOOKUP`, `AGGREGATE`.

El sistema rastrea la progresión de carga, volumen semanal por grupo muscular y genera
sugerencias automáticas por ejercicio basadas en el historial de series anteriores.

---

## HERRAMIENTAS DE GENERACIÓN Y EDICIÓN

- **Generación**: Python 3 + `openpyxl` (NO xlsxwriter, NO xlrd)
- **Recálculo de fórmulas**: `python /mnt/skills/public/xlsx/scripts/recalc.py archivo.xlsx 120`
- **Verificación post-edición**: leer con `data_only=True` y comprobar valores calculados
- **Compatibilidad**: Excel 2016. Nunca usar: `LET()`, `FILTER()`, `TAKE()`, `XLOOKUP()`, `AGGREGATE()`
- **Herramientas de edición directa**: `openpyxl.load_workbook()` con cuidado de no perder DVs ni fórmulas

---

## ESTRUCTURA DEL ARCHIVO

### 12 Hojas en orden:
```
LUNES | MARTES | MIERCOLES | JUEVES | SABADO
MEDIDAS_Y_PESO | CONFIG | EJERCICIOS | HISTORIAL | SUGERENCIAS | VOLUMEN | DASHBOARD
```

---

## HOJAS DE ENTRENAMIENTO (LUNES/MARTES/MIERCOLES/JUEVES/SABADO)

### Layout por semana (bloque repetido 12 veces por hoja):

```
Row N:   SEMANA X  [TIPO] -- [Descripcion]     ← header semana (sin D)
Row N+1: — SECCION —                            ← separador principal (sin D)
Row N+2:   · Subseccion                         ← sub-separador visual (sin D, opcional)
Row N+3: Ejercicio Base    | Variante | ...     ← fila ejercicio (D=n_series, cols F-T = datos)
...
Row N+M: (blank)                                ← fila vacía entre semanas
```

### Slots por día (sem1, primer bloque):
| Día       | N slots | Secciones |
|-----------|---------|-----------|
| LUNES     | 11      | PECHO (·Medio/·Alto/·Bajo) / HOMBRO / TRICEPS / CUADRICEPS / BICEPS / CIERRE |
| MARTES    | 11      | ESPALDA (·Anchura/·Densidad) / BICEPS / ANTEBRAZO / AGARRE / TRICEPS / CIERRE |
| MIERCOLES | 15      | FEMORAL / CUADRICEPS / GEMELO / LUMBAR / BICEPS / TRICEPS / CORE |
| JUEVES    | 13      | HOMBRO (·Posterior) / PECHO (·Medio/·Alto/·Bajo) / TRICEPS / CUADRICEPS / BICEPS / CIERRE |
| SABADO    | 11      | ESPALDA (·Anchura/·Densidad) / BICEPS / TRICEPS / ANTEBRAZO / HOMBRO / TRAPECIOS / LUMBAR / CIERRE |

**Total slots: 61. Rows per week per day: 26 (incluyendo separadores + blank).**

### Columnas por fila de ejercicio:
```
A  = Base (ejercicio, dropdown ← BASES_{SECCION})
B  = Variante (dropdown ← INDIRECT(VLOOKUP(A,EJERCICIOS!B:E,4,0)))
C  = Tipo (fórmula: INDEX/MATCH del tipo en catálogo EJERCICIOS)
D  = N series (valor fijo: 3 o 4)
E  = Peso corporal usuario (LOOKUP de MEDIDAS_Y_PESO)
F-H   = S1: Kg / Reps / RIR  (input usuario)
I-K   = S2: Kg / Reps / RIR
L-N   = S3: Kg / Reps / RIR
O-Q   = S4: Kg / Reps / RIR
R-T   = S5: Kg / Reps / RIR
U  = eRM calculado (fórmula HIDDEN)
V  = Sugerencia (texto: "^ SUBIR | Kg:X R:Y RIR:Z" etc.)
W  = maxScore Nivel A (fórmula array hidden)
X  = idxWinner Nivel A
Y  = maxScore Nivel B
Z  = idxWinner Nivel B
AA = maxScore Nivel C
AB = idxWinner Nivel C
AC = código winner ("A1"/"B2"/"C3" etc.)
```

**Columnas W-AC están ocultas al usuario.**

### Fórmulas críticas (copiar en filas nuevas):
```excel
C{r}: =IFERROR(INDEX(EJERCICIOS!$D$3:$D$85,MATCH(A{r}&"|"&B{r},EJERCICIOS!$G$3:$G$85,0)),"--")
E{r}: =IFERROR(LOOKUP(2,1/(MEDIDAS_Y_PESO!$B$3:$B$3<>""),MEDIDAS_Y_PESO!$B$3:$B$3),"--")
V{r}: =IF(SUGERENCIAS!N{sr}="SIN","Sin datos anteriores",IF(...)) ← referencia a SUGERENCIAS
W-AB: fórmulas array de scoring (ver sección HISTORIAL/SUGERENCIAS)
AC{r}: =IF(X{r}>0,"A"&X{r},IF(Z{r}>0,"B"&Z{r},IF(AB{r}>0,"C"&AB{r},""))
```

### Fórmula col B DV (variante dropdown):
```
=INDIRECT(IFERROR(VLOOKUP(A{r},EJERCICIOS!$B$3:$E$85,4,0),"BASES_LIST"))
```
**CRÍTICO:** estos DVs desaparecen al editar con openpyxl y deben reconstruirse en cada sesión de edición.

---

## HOJA EJERCICIOS (catálogo)

### Estructura:
```
Col B = Base (nombre ejercicio)
Col C = Variante
Col D = Tipo: "disco" | "mancuerna" | "polea" | "peso_corporal"
Col E = safe_name (ej: "Press_Plano") → usado como nombre de Named Range de variantes
Col G = Clave: ="Base|Variante" (concatenación para MATCH en HISTORIAL/col C)
Col I = Listas de bases por sección muscular (para Named Ranges BASES_*)
```

### Named Ranges de variantes (col C):
Cada safe_name en col E tiene un Named Range `EJERCICIOS!$C$r1:$C$r2`
cubriendo TODAS las filas de esa base. Ej: `Press_Plano: EJERCICIOS!$C$57:$C$60`

### Named Ranges de secciones (col I):
```
BASES_AGARRE       I3:I3
BASES_ANTEBRAZO    I4:I4
BASES_BICEPS       I5:I6
BASES_CIERRE       I7:I10
BASES_CORE         I11:I14
BASES_CUADRICEPS   I15:I17
BASES_ESPALDA      I18:I23
BASES_FEMORAL      I24:I25
BASES_GEMELO       I26:I27
BASES_HOMBRO       I28:I33
BASES_LUMBAR       I34:I35
BASES_PECHO        I36:I42
BASES_TRAPECIOS    I43:I45
BASES_TRICEPS      I46:I48
# Sub-secciones pecho:
BASES_PECHO_PLANO   I47:I48  → [Press Plano, Aperturas Medio]
BASES_PECHO_MEDIO   I49:I50  → [Press Plano, Aperturas Medio]
BASES_PECHO_ALTO    I51:I52  → [Press Inclinado, Aperturas Inclinado]
BASES_PECHO_BAJO    I53:I55  → [Aperturas Bajo, Fondos, Press Polea]
# Sub-secciones espalda:
BASES_ESPALDA_ANCHURA  I56:I58  → [Dominadas, Jalon, Pulldown]
BASES_ESPALDA_DENSIDAD I59:I61  → [Remo, Peck Deck Invertida, Face Pull]
```

---

## HOJA CONFIG

```
Semana Actual: 1     ← usuario actualiza manualmente
Programación 12 semanas:
  S1:HIP  S2:HIP  S3:FUE  S4:HIP  S5:HIP  S6:FUE
  S7:HIP  S8:HIP  S9:FUE  S10:HIP S11:FUE S12:DEL
Parámetros:
  HIP: Reps 6-12, RIR 1-3
  FUE: Reps 3-6,  RIR 0-2
Niveles de polea: 1=5kg, 2=10kg, 3=17.5kg, 4=25kg, 5=32.5kg
```

---

## HOJA HISTORIAL

### Estructura:
- **758 filas de datos** (3 a 758) — una por semana × slot × día
- Fila `hn = 3 + (w-1)*61 + CUM[day] + i` donde:
  - `w` = semana (1-12)
  - `CUM[day]` = slots acumulados antes de ese día: {LUNES:0, MARTES:11, MIERCOLES:22, JUEVES:37, SABADO:50}
  - `i` = índice del slot en ese día (0-based)

### Columnas:
```
A=Semana  B=Dia  C=Base  D=Variante  E=Tipo  F=Kg_ef  G=Reps
H=RIR  I=Score_A  J=idx_A  K=Score_B  L=idx_B  M=Score_C  N=idx_C
O=Clave (Base|Variante normalizada: LOWER/TRIM)
P=Posicion (A1/B2/etc)
```

---

## HOJA SUGERENCIAS

### Estructura:
- **759 filas** (una por semana × slot × día, más header)
- Fila `sr = SUG_START + (w-1)*61 + CUM[day] + i`
- `SUG_START = 4` (fila 4 = semana1, día LUNES, slot 0)

### Columnas clave:
```
D{sr} = ='DIA'!$A${ex_row(day,w,i)}  ← base del ejercicio en esa semana
E{sr} = ='DIA'!$B${ex_row(day,w,i)}  ← variante del ejercicio en esa semana
G{sr} = LOOKUP para último Kg efectivo (usa clave D&"|"&E en HISTORIAL!O)
H{sr} = LOOKUP para últimas Reps
N{sr} = Acción: "SIN"|"SUBIR"|"SUBIR_F"|"MANT"|"BAJAR"
K{sr} = Kg sugerido
```

**CRÍTICO (bug histórico resuelto):** D{sr}/E{sr} DEBEN referenciar `ex_row(day,w,i)` —
la fila de ESA semana, NO siempre sem1. Si se usa sem1 hardcoded, la sugerencia es
por posición en lugar de por identidad del ejercicio.

**Temporal integrity:** cada fila sr busca historial SOLO en `HISTORIAL!$O$3:$O${hn-1}` —
nunca incluye la propia sesión en el lookup.

---

## HOJA VOLUMEN

### Grupos musculares rastreados:
| Músculo    | Min | Max | Sub-porciones |
|------------|-----|-----|---------------|
| Pecho      | 10  | 16  | alto(3-6), medio(4-8), bajo(3-6) |
| Espalda    | 12  | 22  | anchura(5-12), densidad(5-12) |
| Hombro     | 12  | 24  | anterior(2-6), lateral(6-14), posterior(4-10) |
| Triceps    | 10  | 18  | — |
| Biceps     | 10  | 18  | — |
| Cuadriceps | 10  | 18  | — |
| Femoral    | 8   | 16  | — |
| Gemelo     | 8   | 14  | — |
| Antebrazo  | 6   | 12  | — |
| Core       | 6   | 12  | — |
| Trapecios  | 4   | 8   | — |
| Lumbar     | 6   | 12  | — |

### Colores de formato condicional (CF):
- **Bajo mínimo**: fondo ámbar `#F0B27A`, texto negro negrita
- **En rango**: fondo verde `#58D68D`, texto negro negrita
- **Exceso**: fondo rojo-salmón `#EC7063`, texto negro negrita

Los CF usan `dxfId` referenciado en `wb._differential_styles.styles`.
Los CF están definidos celda a celda (no por rango), lo que genera ~480 reglas totales.

---

## FLUJO DE DATOS COMPLETO

```
Usuario input (F-T, Kg/Reps/RIR)
    ↓
Col W-AB (scoring por nivel HIP/FUE/DEL)
    ↓ Score = peso × reps × 1000 + kg (sin MOD, decimal-safe)
    ↓ Winner por scanner IF(score_s5=max,5,IF(score_s4...))
Col AC (código winner)
    ↓
HISTORIAL (fila hn, cols F-P)
    ↓ LOOKUP por clave Base|Variante (col O), rango ≤hn-1
SUGERENCIAS (fila sr, cols G-N)
    ↓ Acción basada en Reps vs objetivo de semana-tipo
Col V (texto sugerencia visible al usuario)
```

---

## REGLAS DE EDICIÓN (LO QUE SE PUEDE Y NO SE PUEDE HACER)

### ✅ SEGURO (edición directa en xlsx):
- Cambiar valores en catálogo EJERCICIOS (cols B/C/D/E/G)
- Añadir/eliminar variantes de ejercicios existentes
- Actualizar Named Ranges de variantes (col E → NR `safe_name`)
- Cambiar valores en col A/B de las hojas de día (ejercicio por defecto)
- Cambiar colores, formatos, separadores visuales
- Cambiar valores en CONFIG (semana actual, parámetros)
- Cambiar datos en MEDIDAS_Y_PESO

### ⚠️ REQUIERE RECONSTRUCCIÓN DE DVs:
- Cualquier edición que guarde con openpyxl borra los DVs col B (INDIRECT/VLOOKUP)
- Tras editar, reconstruir todos los DVs col B en todos los días:
  ```python
  formula = f'INDIRECT(IFERROR(VLOOKUP(A{r},EJERCICIOS!$B$3:$E$85,4,0),"BASES_LIST"))'
  dv = DataValidation(type='list', formula1=formula, allow_blank=True, showErrorMessage=False)
  ws.add_data_validation(dv); dv.add(f'B{r}')
  ```

### ❌ PELIGROSO (puede romper HISTORIAL/SUGERENCIAS/VOLUMEN):
- **Insertar o eliminar filas en hojas de día** → desplaza todas las referencias cross-sheet
- **Cambiar número de slots en un día** → requiere recalcular todas las fórmulas de HISTORIAL/SUGERENCIAS
- Si se hace DEBE hacerse para LAS 12 SEMANAS A LA VEZ y actualizar:
  - Todas las fórmulas C/E/U/V/W-AC de las filas nuevas
  - Todos los DVs col A (sección) y col B (variante) de filas nuevas
  - HISTORIAL: todas las fórmulas A-P para ese día
  - SUGERENCIAS: todas las fórmulas D/E/G-N para ese día
  - VOLUMEN: todas las referencias a ese día
- **Cambiar nombre de un ejercicio sin actualizar col I** → genera blancos en dropdown
- **Named ranges de secciones (BASES_*)** que apuntan a nombres obsoletos → dropdown muestra blancos

---

## BUGS HISTÓRICOS RESUELTOS (no volver a reproducir)

1. **Decimal Kg (MOD encoding)**: score con índice embebido causaba error con Kg .5  
   → Solución: `score = w×r×1000 + kg` sin MOD + scanner IF para winner

2. **SUGERENCIAS D/E hardcoded a sem1**: sugerencia usaba identidad de sem1 aunque cam biara ejercicio  
   → Solución: `D{sr}='DIA'!$A${ex_row(day,w,i)}` con w=semana actual

3. **COUNTIFS con rangos invertidos**: `end < start` hace que Excel rechace la fórmula entera aunque esté en IF guard  
   → Solución: `if hn <= HIST_START: return static_value`

4. **Paréntesis desbalanceados**: openpyxl no detecta el error pero Excel elimina silenciosamente toda la hoja  
   → Verificar siempre con `count('(') == count(')')` en cada fórmula generada

5. **Named ranges desfasados post-inserción**: al añadir filas con openpyxl, los NRs del catálogo quedan apuntando a filas equivocadas  
   → Reconstruir SIEMPRE todos los NRs desde col E después de cualquier inserción

6. **BASES_ESPALDA/PECHO global + sub-DVs duplicados**: Excel usa el primer DV que coincide, dando lista incorrecta  
   → Eliminar el DV global de filas que tengan sub-DV específico

7. **Col B DVs perdidos tras guardar**: openpyxl no preserva DVs correctamente en archivos complejos  
   → Reconstruir todos los 771 DVs col B tras cada sesión de edición

---

## PARÁMETROS CLAVE

```python
N_WK        = 12   # semanas
DAYS        = ['LUNES','MARTES','MIERCOLES','JUEVES','SABADO']
DAY_SLOTS   = {'LUNES':11,'MARTES':11,'MIERCOLES':15,'JUEVES':13,'SABADO':11}  # 61 total
CUM_SLOTS   = {'LUNES':0,'MARTES':11,'MIERCOLES':22,'JUEVES':37,'SABADO':50}
ROWS_PER_WEEK_PER_DAY = 26  # incluyendo separadores + blank
HIST_START  = 3    # primera fila de datos en HISTORIAL
HIST_END    = 758  # = 3 + 12*61 - 1
SUG_START   = 4    # primera fila de datos en SUGERENCIAS
SUG_END     = 759  # = 4 + 12*61 - 1
DATA_START  = 10   # primera fila de datos en hojas de día (semana 1 header)

WEEK_TYPES  = ['HIP','HIP','FUE','HIP','HIP','FUE','HIP','HIP','FUE','HIP','FUE','DEL']

# Semana tipo → parámetros sugerencia
HIP: reps_min=6, reps_max=12, rir_min=1, rir_max=3
FUE: reps_min=3, reps_max=6,  rir_min=0, rir_max=2
DEL: reducción 40-50% volumen

# Posición de fila de ejercicio en hoja de día:
# ex_row(day, week, slot_i) = DATA_START + (week-1)*26 + 1 + slot_i + seps_before(day, slot_i)
# seps_before = número de separadores (main+sub) en ese día con pos <= slot_i
```

---

## CATÁLOGO DE EJERCICIOS (resumen)

El catálogo está en EJERCICIOS!B3:G~85. Ejercicios clave con sus variantes:

| Base | Variantes | Tipo |
|------|-----------|------|
| Press Plano | Barra / Mancuernas / Multipower / Maquina | disco/mancuerna |
| Press Inclinado | Multipower / Barra / Mancuernas / Maquina | disco/mancuerna |
| Aperturas Inclinado | Mancuernas Inclinado | mancuerna |
| Aperturas Medio | Pec Deck Maquina / Mancuernas Plano | polea/mancuerna |
| Aperturas Bajo | Polea Baja Crossover | polea |
| Curl Biceps | Barra Recta Polea / Bayesian / Concentrado Maq / Inclinado / Polea Baja / Mancuerna | polea/mancuerna |
| Extension Triceps | Katana / Press Barra Recta / Press Barra V / Extension Polea Individual | polea |
| JM Press | Multipower | disco |
| Skullcrusher | Mancuerna Tumbado | mancuerna |
| Remo | Maquina Hammer / Maquina Neutro Ancho / Estrecho / Prono / Multipower / Polea / Polea Individual | polea/disco |
| Elevaciones Laterales | Cable Polea Individual / Mancuerna / Maquina | polea/mancuerna |
| Press Militar | Mancuernas Sentado | mancuerna |
| Prensa Pierna | Ambos Pies / Individual | polea |
| Sentadilla | Multipower Cuna Talones | disco |
| Plancha | Tumbado | **peso_corporal** |
| Hiperextension | Banco Romano | peso_corporal |

---

## NOTAS DE USUARIO

- Luis entrena con alta frecuencia y buena recuperación en espalda, bíceps y tríceps
- Volumen de pecho más conservador
- Prioridad: "Primero que funcione SIEMPRE. Luego optimizamos."
- Prefiere correcciones incrementales al archivo existente sobre regeneración completa cuando sea posible
- Verifica SIEMPRE antes de entregar: 0 errores de fórmula, DVs intactos, 5 hojas de día correctas

---

## CHECKLIST PRE-ENTREGA

```
[ ] 0 errores #REF! / #VALUE! / #NAME? / #DIV/0! en todas las hojas
[ ] Col B DVs (variante) presentes en todas las filas ejercicio de los 5 días
[ ] Col A DVs (base) con BASES_{SECCION} correcto por sección
[ ] Named Ranges de variantes apuntan a filas correctas post-edición
[ ] BASES_* col I no contienen nombres obsoletos (genera blancos en dropdown)
[ ] SUGERENCIAS D/E referencian ex_row(day,w,i) no hardcoded a sem1
[ ] HISTORIAL clave col O = LOWER(TRIM(base))&"|"&LOWER(TRIM(variante))
[ ] Paréntesis balanceados en todas las fórmulas generadas
[ ] Compatible Excel 2016 (sin LET/FILTER/TAKE/XLOOKUP/AGGREGATE)
```
