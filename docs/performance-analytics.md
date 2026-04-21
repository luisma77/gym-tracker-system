# Analítica y reportes de rendimiento

## Objetivo

Convertir las sesiones y medidas del usuario en una lectura útil, comparable y exportable, tanto dentro del dashboard como en informes PDF y Excel.

## Fuentes de datos

- `workout_sessions`
- `session_sets`
- `body_measurements`
- `profiles`

## Métricas activas

### Progreso por ejercicio

- se toma la mejor serie de cada sesión para un ejercicio exacto
- se estima un `e1RM` con `peso * (1 + (reps + rir) / 30)`
- se compara el primer dato contra el último para obtener:
  - mejora en kg
  - mejora en %

### Ejercicio favorito

Se calcula con una combinación de:

- número de sesiones en las que aparece
- series acumuladas
- progreso real del ejercicio

No es solo el que más veces sale, sino el que más presencia tiene y además consolida progreso.

### Grupo estrella y grupo rezagado

Se calcula por:

- series totales por grupo muscular
- volumen total acumulado por grupo

Esto permite detectar tanto el grupo más trabajado como el que menos estímulo acumula.

### Récords

Se destacan:

- serie más pesada
- mejor `e1RM`
- sesión con más volumen

### Adherencia

- racha de semanas consecutivas con entrenamiento registrado
- frecuencia de sesiones por mes

## Visualización actual en dashboard

- evolución del peso corporal
- volumen por sesión
- RIR medio
- sesiones por mes
- e1RM del ejercicio con más progreso
- ranking de ejercicios con mejor evolución
- tarjeta de ejercicio favorito
- tarjeta de grupo estrella y grupo rezagado
- tarjeta de récords
- calculadora Harris-Benedict en la pestaña `Medidas`

## Calculadora Harris-Benedict

Se añadió una calculadora integrada para ofrecer al usuario una lectura inmediata de composición y requerimientos energéticos.

Muestra:

- TMB o gasto basal
- GET o gasto energético total
- calorías objetivo según mantenimiento, definición o volumen
- IMC
- rango de peso saludable estimado
- distribución diaria estimada de proteína, grasas y carbohidratos
- proteína personalizada entre 1,3 y 2,0 g/kg según sexo, actividad y objetivo
- grasa corporal estimada por cintura, altura y sexo
- masa magra estimada, masa grasa estimada y ratio cintura-altura

Detalles de implementación:

- el cálculo vive en `src/lib/harris-benedict.ts`
- el dashboard reutiliza el último peso corporal guardado cuando el usuario deja el campo de peso vacío
- el dashboard reutiliza también la última cintura guardada si no se rellena ese campo
- la grasa estimada se presenta con aviso explícito de que es una estimación antropométrica y puede desviarse
- hay test automatizado en `tests/harris-benedict.test.ts`

## Exportes actuales

### PDF

Incluye:

- nombre del atleta
- resumen general
- conclusiones automáticas
- tendencias
- ranking de progreso
- récords
- historial resumido de sesiones y medidas

### Excel

Incluye hojas:

- `Resumen`
- `Sesiones`
- `Series`
- `Medidas`
- `Progresion`
- `Favorito`
- `Records`
- `Musculos`
- `Conclusiones`
- `Tendencias`
- `Datos_graficas`

## Limitación actual

El archivo Excel ya sale muy completo a nivel de datos y análisis, pero todavía no incrusta gráficas nativas de Excel dentro del `.xlsx`.

Para eso habrá que mover la exportación a una vía que soporte creación real de charts dentro del workbook.
