"use client";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import type { BodyMeasurement, WorkoutSession } from "@/lib/api";
import { buildPerformanceSnapshot, formatReportDate, getAverageSessionRir, getSessionVolume } from "@/lib/performance-report";

function buildFileDateSuffix() {
  return new Date().toISOString().slice(0, 10);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function drawLineChart(
  doc: jsPDF,
  title: string,
  points: Array<{ label: string; value: number }>,
  startX: number,
  startY: number,
  width: number,
  height: number,
  color: [number, number, number]
) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(title, startX, startY);

  if (points.length < 2) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Datos insuficientes para dibujar la gráfica.", startX, startY + 8);
    return startY + 18;
  }

  const chartTop = startY + 8;
  const chartBottom = chartTop + height;
  const chartRight = startX + width;
  const minValue = Math.min(...points.map((item) => item.value));
  const maxValue = Math.max(...points.map((item) => item.value));
  const range = maxValue - minValue || 1;

  doc.setDrawColor(214, 201, 181);
  doc.roundedRect(startX, chartTop, width, height, 4, 4);
  doc.setDrawColor(...color);
  doc.setLineWidth(0.8);

  points.forEach((point, index) => {
    if (index === 0) {
      return;
    }

    const prev = points[index - 1];
    const x1 = startX + ((index - 1) / (points.length - 1)) * width;
    const x2 = startX + (index / (points.length - 1)) * width;
    const y1 = chartBottom - ((prev.value - minValue) / range) * (height - 10) - 5;
    const y2 = chartBottom - ((point.value - minValue) / range) * (height - 10) - 5;
    doc.line(x1, y1, x2, y2);
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(87, 80, 68);
  doc.text(String(minValue.toFixed(1)), chartRight + 4, chartBottom);
  doc.text(String(maxValue.toFixed(1)), chartRight + 4, chartTop + 4);

  const first = points[0];
  const last = points[points.length - 1];
  doc.text(first.label, startX, chartBottom + 6);
  doc.text(last.label, chartRight - doc.getTextWidth(last.label), chartBottom + 6);

  return chartBottom + 12;
}

function buildReportConclusions(snapshot: ReturnType<typeof buildPerformanceSnapshot>) {
  const conclusions = [
    `Has registrado ${snapshot.totalSessions} sesiones y ${snapshot.totalSets} series en total.`,
    `Tu volumen acumulado es de ${snapshot.totalVolumeKg.toFixed(1)} kg, con un RIR medio de ${snapshot.averageSessionRir.toFixed(2)}.`,
  ];

  if (snapshot.bestImprovement) {
    conclusions.push(
      `Tu mayor progreso está en ${snapshot.bestImprovement.exerciseName}, con una mejora estimada del ${snapshot.bestImprovement.deltaPercent.toFixed(1)}%.`
    );
  }

  if (snapshot.favoriteExercise) {
    conclusions.push(snapshot.favoriteExercise.reason);
  }

  if (snapshot.starMuscle) {
    conclusions.push(snapshot.starMuscle.reason);
  }

  if (snapshot.laggingMuscle && snapshot.laggingMuscle.muscleGroup !== snapshot.starMuscle?.muscleGroup) {
    conclusions.push(snapshot.laggingMuscle.reason);
  }

  if (snapshot.adherenceStreakWeeks > 0) {
    conclusions.push(`Llevas una racha de ${snapshot.adherenceStreakWeeks} semanas consecutivas con entrenamiento registrado.`);
  }

  return conclusions;
}

export function downloadBaseExcel() {
  const anchor = document.createElement("a");
  anchor.href = "/downloads/Gym_Tracker.xlsx";
  anchor.download = "Gym_Tracker_base.xlsx";
  anchor.click();
}

export function downloadPerformanceWorkbook(
  sessions: WorkoutSession[],
  measurements: BodyMeasurement[],
  userName?: string
) {
  const snapshot = buildPerformanceSnapshot(sessions, measurements);
  const workbook = XLSX.utils.book_new();
  const athleteName = userName?.trim() || "Usuario Gym Tracker";

  const summaryRows = [
    { indicador: "Atleta", valor: athleteName },
    { indicador: "Fecha del informe", valor: buildFileDateSuffix() },
    { indicador: "Total de sesiones", valor: snapshot.totalSessions },
    { indicador: "Total de series", valor: snapshot.totalSets },
    { indicador: "Volumen total (kg)", valor: Number(snapshot.totalVolumeKg.toFixed(1)) },
    { indicador: "Volumen medio por sesión (kg)", valor: Number(snapshot.averageSessionVolumeKg.toFixed(1)) },
    { indicador: "RIR medio", valor: Number(snapshot.averageSessionRir.toFixed(2)) },
    { indicador: "Peso actual (kg)", valor: snapshot.latestWeightKg ?? "--" },
    { indicador: "Cambio de peso (kg)", valor: snapshot.weightDeltaKg === null ? "--" : Number(snapshot.weightDeltaKg.toFixed(1)) },
    {
      indicador: "Ejercicio con mayor progreso",
      valor: snapshot.bestImprovement
        ? `${snapshot.bestImprovement.exerciseName} (${snapshot.bestImprovement.deltaPercent.toFixed(1)}%)`
        : "Sin datos suficientes",
    },
    {
      indicador: "Ejercicio favorito",
      valor: snapshot.favoriteExercise
        ? `${snapshot.favoriteExercise.exerciseName} (${snapshot.favoriteExercise.timesPerformed} veces)`
        : "Sin datos suficientes",
    },
    {
      indicador: "Motivo del favorito",
      valor: snapshot.favoriteExercise?.reason ?? "Todavía no hay suficientes registros para detectarlo.",
    },
    {
      indicador: "Grupo estrella",
      valor: snapshot.starMuscle?.muscleGroup ?? "Sin datos suficientes",
    },
    {
      indicador: "Grupo rezagado",
      valor: snapshot.laggingMuscle?.muscleGroup ?? "Sin datos suficientes",
    },
    {
      indicador: "Racha de semanas",
      valor: snapshot.adherenceStreakWeeks,
    },
  ];

  const sessionRows = sessions.map((session) => ({
    fecha: formatReportDate(session.created_at),
    sesion: session.title,
    dia: session.training_day,
    semana: session.week_number,
    series: session.sets.length,
    volumen_kg: Number(getSessionVolume(session).toFixed(1)),
    rir_medio: Number(getAverageSessionRir(session).toFixed(2)),
    notas: session.notes ?? "",
  }));

  const setRows = sessions.flatMap((session) =>
    session.sets.map((setItem, index) => ({
      fecha: formatReportDate(session.created_at),
      sesion: session.title,
      posicion: index + 1,
      ejercicio: setItem.exercise_name,
      grupo: setItem.muscle_group,
      reps: setItem.reps,
      rir: setItem.rir,
      peso_kg: Number(setItem.weight_kg.toFixed(1)),
      volumen_set: Number((setItem.reps * setItem.weight_kg).toFixed(1)),
    }))
  );

  const measurementRows = measurements.map((item) => ({
    fecha: formatReportDate(item.measured_at),
    peso_kg: item.weight_kg ?? "",
    grasa_pct: item.body_fat_percent ?? "",
    pecho_cm: item.chest_cm ?? "",
    cintura_cm: item.waist_cm ?? "",
    cadera_cm: item.hip_cm ?? "",
    brazo_cm: item.arm_cm ?? "",
    muslo_cm: item.thigh_cm ?? "",
    notas: item.notes ?? "",
  }));

  const progressionRows = snapshot.topImprovements.map((item, index) => ({
    ranking: index + 1,
    ejercicio: item.exerciseName,
    grupo: item.muscleGroup,
    e1rm_inicial: Number(item.startEstimatedRm.toFixed(1)),
    e1rm_actual: Number(item.latestEstimatedRm.toFixed(1)),
    mejora_kg: Number(item.deltaKg.toFixed(1)),
    mejora_pct: Number(item.deltaPercent.toFixed(1)),
    ultima_fecha: formatReportDate(item.lastDate),
  }));

  const favoriteRows = snapshot.favoriteExercise
    ? [
        {
          atleta: athleteName,
          ejercicio: snapshot.favoriteExercise.exerciseName,
          grupo: snapshot.favoriteExercise.muscleGroup,
          veces_registrado: snapshot.favoriteExercise.timesPerformed,
          series_totales: snapshot.favoriteExercise.totalSets,
          progreso_kg_e1rm: Number(snapshot.favoriteExercise.progressKg.toFixed(1)),
          progreso_pct_e1rm: Number(snapshot.favoriteExercise.progressPercent.toFixed(1)),
          razon: snapshot.favoriteExercise.reason,
        },
      ]
    : [
        {
          atleta: athleteName,
          ejercicio: "Sin datos suficientes",
          grupo: "-",
          veces_registrado: 0,
          series_totales: 0,
          progreso_kg_e1rm: 0,
          progreso_pct_e1rm: 0,
          razon: "Necesitas más sesiones repetidas del mismo ejercicio para detectarlo.",
        },
      ];

  const recordsRows = [
    {
      record: "Serie más pesada",
      ejercicio: snapshot.personalRecords.heaviestSet?.exerciseName ?? "Sin datos",
      valor: snapshot.personalRecords.heaviestSet ? `${snapshot.personalRecords.heaviestSet.value.toFixed(1)} ${snapshot.personalRecords.heaviestSet.unit}` : "-",
      fecha: snapshot.personalRecords.heaviestSet ? formatReportDate(snapshot.personalRecords.heaviestSet.date) : "-",
    },
    {
      record: "Mejor e1RM",
      ejercicio: snapshot.personalRecords.bestEstimatedRm?.exerciseName ?? "Sin datos",
      valor: snapshot.personalRecords.bestEstimatedRm ? `${snapshot.personalRecords.bestEstimatedRm.value.toFixed(1)} ${snapshot.personalRecords.bestEstimatedRm.unit}` : "-",
      fecha: snapshot.personalRecords.bestEstimatedRm ? formatReportDate(snapshot.personalRecords.bestEstimatedRm.date) : "-",
    },
    {
      record: "Sesión con más volumen",
      ejercicio: snapshot.personalRecords.highestVolumeSession?.sessionTitle ?? "Sin datos",
      valor: snapshot.personalRecords.highestVolumeSession
        ? `${snapshot.personalRecords.highestVolumeSession.volumeKg.toFixed(1)} kg`
        : "-",
      fecha: snapshot.personalRecords.highestVolumeSession
        ? formatReportDate(snapshot.personalRecords.highestVolumeSession.date)
        : "-",
    },
  ];

  const muscleRows = [
    {
      tipo: "Grupo estrella",
      grupo: snapshot.starMuscle?.muscleGroup ?? "Sin datos",
      series: snapshot.starMuscle?.totalSets ?? 0,
      volumen_kg: snapshot.starMuscle ? Number(snapshot.starMuscle.totalVolumeKg.toFixed(1)) : 0,
      comentario: snapshot.starMuscle?.reason ?? "",
    },
    {
      tipo: "Grupo rezagado",
      grupo: snapshot.laggingMuscle?.muscleGroup ?? "Sin datos",
      series: snapshot.laggingMuscle?.totalSets ?? 0,
      volumen_kg: snapshot.laggingMuscle ? Number(snapshot.laggingMuscle.totalVolumeKg.toFixed(1)) : 0,
      comentario: snapshot.laggingMuscle?.reason ?? "",
    },
  ];

  const conclusionRows = buildReportConclusions(snapshot).map((texto, index) => ({
    orden: index + 1,
    conclusion: texto,
  }));

  const trendRows = [
    ...snapshot.weightTrend.map((item) => ({ serie: "Peso corporal", fecha: item.label, valor: item.value })),
    ...snapshot.sessionVolumeTrend.map((item) => ({ serie: "Volumen por sesión", fecha: item.label, valor: item.value })),
    ...snapshot.sessionRirTrend.map((item) => ({ serie: "RIR medio", fecha: item.label, valor: item.value })),
    ...snapshot.sessionFrequencyTrend.map((item) => ({ serie: "Sesiones por mes", fecha: item.label, valor: item.value })),
    ...snapshot.topExerciseTrend.map((item) => ({ serie: "e1RM mejor ejercicio", fecha: item.label, valor: item.value })),
  ];

  const chartReadyRows = [
    ...snapshot.weightTrend.map((item) => ({
      fecha: item.label,
      peso_corporal: item.value,
      volumen_sesion: "",
      rir_medio: "",
      sesiones_mes: "",
      e1rm_mejor_ejercicio: "",
    })),
    ...snapshot.sessionVolumeTrend.map((item) => ({
      fecha: item.label,
      peso_corporal: "",
      volumen_sesion: item.value,
      rir_medio: "",
      sesiones_mes: "",
      e1rm_mejor_ejercicio: "",
    })),
    ...snapshot.sessionRirTrend.map((item) => ({
      fecha: item.label,
      peso_corporal: "",
      volumen_sesion: "",
      rir_medio: item.value,
      sesiones_mes: "",
      e1rm_mejor_ejercicio: "",
    })),
    ...snapshot.sessionFrequencyTrend.map((item) => ({
      fecha: item.label,
      peso_corporal: "",
      volumen_sesion: "",
      rir_medio: "",
      sesiones_mes: item.value,
      e1rm_mejor_ejercicio: "",
    })),
    ...snapshot.topExerciseTrend.map((item) => ({
      fecha: item.label,
      peso_corporal: "",
      volumen_sesion: "",
      rir_medio: "",
      sesiones_mes: "",
      e1rm_mejor_ejercicio: item.value,
    })),
  ];

  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(summaryRows), "Resumen");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(sessionRows), "Sesiones");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(setRows), "Series");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(measurementRows), "Medidas");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(progressionRows), "Progresion");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(favoriteRows), "Favorito");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(recordsRows), "Records");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(muscleRows), "Musculos");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(conclusionRows), "Conclusiones");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(trendRows), "Tendencias");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(chartReadyRows), "Datos_graficas");

  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  downloadBlob(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `informe-rendimiento-${buildFileDateSuffix()}.xlsx`
  );
}

export function downloadPerformancePdf(
  sessions: WorkoutSession[],
  measurements: BodyMeasurement[],
  userName?: string
) {
  const snapshot = buildPerformanceSnapshot(sessions, measurements);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const athleteName = userName?.trim() || "Usuario Gym Tracker";

  doc.setFillColor(15, 118, 110);
  doc.rect(0, 0, 210, 34, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Informe de rendimiento", 14, 18);
  doc.setFontSize(11);
  doc.text(`Gym Tracker · ${buildFileDateSuffix()} · ${athleteName}`, 14, 26);

  doc.setTextColor(30, 26, 20);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Resumen científico del rendimiento: marcas, evolución de carga, adherencia y cambios corporales.",
    14,
    46,
    { maxWidth: 180 }
  );

  doc.setFontSize(11);
  doc.text(`Atleta: ${athleteName}`, 14, 52);

  autoTable(doc, {
    startY: 58,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 2.6, textColor: [40, 35, 28] },
    headStyles: { fillColor: [15, 118, 110] },
    body: [
      ["Sesiones totales", String(snapshot.totalSessions)],
      ["Series totales", String(snapshot.totalSets)],
      ["Volumen total", `${snapshot.totalVolumeKg.toFixed(1)} kg`],
      ["RIR medio", snapshot.averageSessionRir.toFixed(2)],
      ["Peso actual", snapshot.latestWeightKg === null ? "--" : `${snapshot.latestWeightKg.toFixed(1)} kg`],
      [
        "Mayor progreso",
        snapshot.bestImprovement
          ? `${snapshot.bestImprovement.exerciseName} (${snapshot.bestImprovement.deltaPercent.toFixed(1)}%)`
          : "Sin datos suficientes",
      ],
      [
        "Ejercicio favorito",
        snapshot.favoriteExercise
          ? `${snapshot.favoriteExercise.exerciseName} · ${snapshot.favoriteExercise.reason}`
          : "Sin datos suficientes",
      ],
      ["Racha activa", `${snapshot.adherenceStreakWeeks} semanas`],
      ["Grupo estrella", snapshot.starMuscle?.reason ?? "Sin datos suficientes"],
      ["Grupo rezagado", snapshot.laggingMuscle?.reason ?? "Sin datos suficientes"],
    ],
  });

  let currentY = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 92;
  currentY += 6;
  currentY = drawLineChart(doc, "Peso corporal", snapshot.weightTrend, 14, currentY, 82, 34, [15, 118, 110]);
  currentY = drawLineChart(doc, "Volumen por sesión", snapshot.sessionVolumeTrend, 110, currentY - 52, 82, 34, [201, 106, 61]);
  currentY += 4;
  currentY = drawLineChart(doc, "RIR medio", snapshot.sessionRirTrend, 14, currentY, 82, 34, [124, 58, 237]);
  currentY = drawLineChart(
    doc,
    "e1RM del ejercicio con más progreso",
    snapshot.topExerciseTrend,
    110,
    currentY - 52,
    82,
    34,
    [44, 84, 122]
  );

  autoTable(doc, {
    startY: Math.max(currentY + 4, 170),
    theme: "striped",
    styles: { fontSize: 9, cellPadding: 2.2 },
    headStyles: { fillColor: [32, 86, 91] },
    head: [["Top", "Ejercicio", "Grupo", "e1RM inicial", "e1RM actual", "Mejora %"]],
    body: snapshot.topImprovements.length
      ? snapshot.topImprovements.map((item, index) => [
          String(index + 1),
          item.exerciseName,
          item.muscleGroup,
          item.startEstimatedRm.toFixed(1),
          item.latestEstimatedRm.toFixed(1),
          `${item.deltaPercent.toFixed(1)}%`,
        ])
      : [["-", "Sin datos suficientes", "-", "-", "-", "-"]],
  });

  doc.addPage();
  autoTable(doc, {
    startY: 18,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 2.2 },
    headStyles: { fillColor: [15, 118, 110] },
    head: [["Conclusiones automáticas"]],
    body: buildReportConclusions(snapshot).map((item) => [item]),
  });

  autoTable(doc, {
    startY: ((doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 18) + 8,
    theme: "striped",
    styles: { fontSize: 8.8, cellPadding: 2 },
    headStyles: { fillColor: [32, 86, 91] },
    head: [["Récord", "Ejercicio/Sesión", "Valor", "Fecha"]],
    body: [
      [
        "Serie más pesada",
        snapshot.personalRecords.heaviestSet?.exerciseName ?? "-",
        snapshot.personalRecords.heaviestSet
          ? `${snapshot.personalRecords.heaviestSet.value.toFixed(1)} ${snapshot.personalRecords.heaviestSet.unit}`
          : "-",
        snapshot.personalRecords.heaviestSet ? formatReportDate(snapshot.personalRecords.heaviestSet.date) : "-",
      ],
      [
        "Mejor e1RM",
        snapshot.personalRecords.bestEstimatedRm?.exerciseName ?? "-",
        snapshot.personalRecords.bestEstimatedRm
          ? `${snapshot.personalRecords.bestEstimatedRm.value.toFixed(1)} ${snapshot.personalRecords.bestEstimatedRm.unit}`
          : "-",
        snapshot.personalRecords.bestEstimatedRm ? formatReportDate(snapshot.personalRecords.bestEstimatedRm.date) : "-",
      ],
      [
        "Sesión con más volumen",
        snapshot.personalRecords.highestVolumeSession?.sessionTitle ?? "-",
        snapshot.personalRecords.highestVolumeSession
          ? `${snapshot.personalRecords.highestVolumeSession.volumeKg.toFixed(1)} kg`
          : "-",
        snapshot.personalRecords.highestVolumeSession
          ? formatReportDate(snapshot.personalRecords.highestVolumeSession.date)
          : "-",
      ],
    ],
  });

  doc.addPage();
  autoTable(doc, {
    startY: 18,
    theme: "grid",
    styles: { fontSize: 8.4, cellPadding: 2 },
    headStyles: { fillColor: [15, 118, 110] },
    head: [["Fecha", "Sesión", "Día", "Semana", "Series", "Volumen", "RIR medio"]],
    body: sessions.length
      ? sessions.map((session) => [
          formatReportDate(session.created_at),
          session.title,
          session.training_day,
          String(session.week_number),
          String(session.sets.length),
          `${getSessionVolume(session).toFixed(1)} kg`,
          getAverageSessionRir(session).toFixed(2),
        ])
      : [["-", "Sin sesiones todavía", "-", "-", "-", "-", "-"]],
  });

  autoTable(doc, {
    startY: (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY
      ? ((doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 18) + 8
      : 150,
    theme: "striped",
    styles: { fontSize: 8.4, cellPadding: 2 },
    headStyles: { fillColor: [201, 106, 61] },
    head: [["Fecha", "Peso", "Grasa %", "Pecho", "Cintura", "Brazo", "Muslo"]],
    body: measurements.length
      ? measurements.map((item) => [
          formatReportDate(item.measured_at),
          item.weight_kg === null ? "--" : `${item.weight_kg} kg`,
          item.body_fat_percent === null ? "--" : String(item.body_fat_percent),
          item.chest_cm === null ? "--" : String(item.chest_cm),
          item.waist_cm === null ? "--" : String(item.waist_cm),
          item.arm_cm === null ? "--" : String(item.arm_cm),
          item.thigh_cm === null ? "--" : String(item.thigh_cm),
        ])
      : [["-", "Sin medidas todavía", "-", "-", "-", "-", "-"]],
  });

  doc.save(`informe-rendimiento-${buildFileDateSuffix()}.pdf`);
}
