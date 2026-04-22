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

La navegación se ha dividido para evitar columnas largas y pantallas demasiado saturadas:

- `Resumen`
  - bloque actual
  - siguiente día
  - mayor progreso
  - ejercicio favorito
  - mensajes cortos de qué vigilar ahora
- `Sesion`
  - registro completo del día siguiendo la estructura del Excel
  - bloque visual bajo cada ejercicio con silueta anatómica orientativa
  - mapa anatómico interactivo en `Extras` para marcar músculos objetivo y reordenar opciones
  - bodymap 2D propio con frente y espalda separados, más hueco reservado para una demo futura de movimiento
- `Cuerpo`
  - formulario compacto de medidas
  - calculadora Harris-Benedict
  - leyenda interpretativa separada de los resultados
  - historial corporal
- `Progreso`
  - evolución del peso corporal
  - volumen por sesión
  - sesiones por mes
  - e1RM del ejercicio con más progreso
  - volumen semanal por grupo
  - estado muscular por grupo
  - récords
  - ranking de ejercicios con mejor evolución
- `Informes`
  - estado de la muestra
  - exportes
  - recomendaciones automáticas
  - resumen de contenido del PDF y Excel

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
- marca visible en el pie de cada página (`Hecho por ...`)
- resumen general del bloque
- fiabilidad actual de la muestra
- gráficas de peso, volumen, RIR/frecuencia según datos
- distribución muscular visual
- ranking de ejercicios por mejora
- conclusiones automáticas
- recomendaciones para el siguiente bloque o rutina
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
- `Semanas`
- `Ejercicios`
- `Ejercicio_semana`
- `Distribucion`
- `Recomendaciones`
- `Conclusiones`
- `Tendencias`
- `Datos_graficas`
- `Firma`

Además:

- el Excel base también se descarga ya personalizado
- tanto el Excel base como el informe Excel llevan marca de autor y fecha

## Limitación actual

El archivo Excel ya sale muy completo a nivel de datos y análisis, pero todavía no incrusta gráficas nativas de Excel dentro del `.xlsx`.

Para eso habrá que mover la exportación a una vía que soporte creación real de charts dentro del workbook.

En la sesión ya existe hueco preparado para media del ejercicio, pero la implementación actual usa un anatomy map SVG propio. No se ha integrado media real de MuscleWiki porque sus términos restringen fuerte bodymaps, thumbnails y vídeo; para tener imagen, vídeo o animación 3D real hará falta integrar una fuente licenciada o producir assets propios.
