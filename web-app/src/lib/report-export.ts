"use client";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import type { BodyMeasurement, WorkoutSession } from "@/lib/api";
import {
  buildPerformanceSnapshot,
  formatReportDate,
  getAverageSessionRir,
  getSessionVolume,
  type ExerciseReportRow,
  type MuscleDistribution,
  type TrendPoint,
} from "@/lib/performance-report";

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

function appendSheet(workbook: XLSX.WorkBook, name: string, rows: Array<Record<string, unknown>>) {
  const sheet = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ info: "Sin datos suficientes" }]);
  XLSX.utils.book_append_sheet(workbook, sheet, name);
}

function appendSignatureSheet(workbook: XLSX.WorkBook, athleteName: string, label: string) {
  appendSheet(workbook, "Firma", [
    { campo: "Documento", valor: label },
    { campo: "Hecho por", valor: athleteName },
    { campo: "App", valor: "Gym Tracker" },
    { campo: "Fecha", valor: buildFileDateSuffix() },
    { campo: "Marca", valor: `Preparado para ${athleteName}` },
  ]);
}

function getTrendArrow(row: ExerciseReportRow) {
  if (row.trend === "up") {
    return "↑";
  }
  if (row.trend === "down") {
    return "↓";
  }
  return "→";
}

function buildReportConclusions(snapshot: ReturnType<typeof buildPerformanceSnapshot>) {
  const conclusions = [
    `Has registrado ${snapshot.totalSessions} sesiones, ${snapshot.totalSets} series y ${snapshot.totalWeeksTracked} semanas útiles.`,
    `Tu volumen acumulado es de ${snapshot.totalVolumeKg.toFixed(1)} kg, con un RIR medio de ${snapshot.averageSessionRir.toFixed(2)}.`,
    `La calidad actual de la muestra es ${snapshot.dataReadiness.replace("_", " ")} para sacar conclusiones.`,
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

function createCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }
  return { canvas, context };
}

function buildDonutChartDataUrl(items: MuscleDistribution[]) {
  if (typeof document === "undefined" || items.length === 0) {
    return null;
  }

  const canvasBundle = createCanvas(560, 320);
  if (!canvasBundle) {
    return null;
  }

  const { canvas, context } = canvasBundle;
  const palette = ["#0f766e", "#1d4ed8", "#c96a3d", "#8b5cf6", "#0f766e", "#7c3aed", "#b45309"];

  context.fillStyle = "#fffdfa";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const centerX = 150;
  const centerY = 160;
  const radius = 90;
  const innerRadius = 48;

  let startAngle = -Math.PI / 2;
  items.slice(0, 6).forEach((item, index) => {
    const slice = (item.sharePercent / 100) * Math.PI * 2;
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.arc(centerX, centerY, radius, startAngle, startAngle + slice);
    context.closePath();
    context.fillStyle = palette[index % palette.length];
    context.fill();
    startAngle += slice;
  });

  context.beginPath();
  context.fillStyle = "#fffdfa";
  context.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#182026";
  context.font = "700 18px Georgia";
  context.fillText("Volumen", 115, 152);
  context.fillText("muscular", 110, 176);

  context.font = "600 16px Georgia";
  items.slice(0, 6).forEach((item, index) => {
    const y = 52 + index * 38;
    context.fillStyle = palette[index % palette.length];
    context.fillRect(286, y - 12, 16, 16);
    context.fillStyle = "#182026";
    context.fillText(`${item.muscleGroup} · ${item.sharePercent.toFixed(1)}%`, 314, y);
  });

  return canvas.toDataURL("image/png");
}

function buildBarChartDataUrl(title: string, items: ExerciseReportRow[]) {
  if (typeof document === "undefined" || items.length === 0) {
    return null;
  }

  const canvasBundle = createCanvas(720, 360);
  if (!canvasBundle) {
    return null;
  }

  const { canvas, context } = canvasBundle;
  const visible = items.slice(0, 6);
  const maxValue = Math.max(...visible.map((item) => item.deltaPercent ?? 0), 1);

  context.fillStyle = "#fffdfa";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#182026";
  context.font = "700 22px Georgia";
  context.fillText(title, 32, 34);

  visible.forEach((item, index) => {
    const value = Math.max(item.deltaPercent ?? 0, 0);
    const barWidth = (value / maxValue) * 420;
    const y = 74 + index * 42;

    context.fillStyle = "#f0e7d8";
    context.fillRect(220, y, 440, 20);
    context.fillStyle = "#0f766e";
    context.fillRect(220, y, barWidth, 20);

    context.fillStyle = "#182026";
    context.font = "600 16px Georgia";
    context.fillText(item.exerciseName.slice(0, 24), 32, y + 15);
    context.fillText(`${value.toFixed(1)}%`, 670, y + 15);
  });

  return canvas.toDataURL("image/png");
}

export async function downloadBaseExcel(userName?: string) {
  const athleteName = userName?.trim() || "Usuario Gym Tracker";
  const response = await fetch("/downloads/Gym_Tracker.xlsx");

  if (!response.ok) {
    throw new Error("No se ha encontrado el Excel base para descargar.");
  }

  const buffer = await response.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  workbook.Props = {
    ...(workbook.Props ?? {}),
    Author: athleteName,
    Company: "Gym Tracker",
    Title: "Plantilla base Gym Tracker",
    Subject: "Plantilla base personalizada",
    Comments: `Plantilla base preparada para ${athleteName}`,
  };
  appendSignatureSheet(workbook, athleteName, "Excel base");

  const output = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  downloadBlob(
    new Blob([output], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `Gym_Tracker_base_${athleteName.replace(/\s+/g, "_")}.xlsx`
  );
}

export function downloadPerformanceWorkbook(
  sessions: WorkoutSession[],
  measurements: BodyMeasurement[],
  userName?: string
) {
  const snapshot = buildPerformanceSnapshot(sessions, measurements);
  const workbook = XLSX.utils.book_new();
  const athleteName = userName?.trim() || "Usuario Gym Tracker";
  workbook.Props = {
    Author: athleteName,
    Company: "Gym Tracker",
    Title: "Informe científico de rendimiento",
    Subject: "Informe de progreso",
    Comments: `Informe generado para ${athleteName}`,
  };

  const summaryRows = [
    { indicador: "Atleta", valor: athleteName },
    { indicador: "Fecha del informe", valor: buildFileDateSuffix() },
    { indicador: "Sesiones totales", valor: snapshot.totalSessions },
    { indicador: "Semanas con datos", valor: snapshot.totalWeeksTracked },
    { indicador: "Nivel de fiabilidad", valor: snapshot.dataReadiness },
    { indicador: "Series totales", valor: snapshot.totalSets },
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
      semana: session.week_number,
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

  const weeklyRows = snapshot.weeklyOverview.map((item) => ({
    semana: item.weekNumber,
    sesiones: item.totalSessions,
    series: item.totalSets,
    volumen_kg: Number(item.totalVolumeKg.toFixed(1)),
    rir_medio: Number(item.averageRir.toFixed(2)),
  }));

  const exerciseDetailRows = snapshot.exerciseReportRows.map((item) => ({
    ejercicio: item.exerciseName,
    grupo: item.muscleGroup,
    veces: item.timesPerformed,
    series: item.totalSets,
    volumen_kg: Number(item.totalVolumeKg.toFixed(1)),
    e1rm_inicial: item.firstEstimatedRm === null ? "" : Number(item.firstEstimatedRm.toFixed(1)),
    e1rm_actual: item.latestEstimatedRm === null ? "" : Number(item.latestEstimatedRm.toFixed(1)),
    e1rm_mejor: item.bestEstimatedRm === null ? "" : Number(item.bestEstimatedRm.toFixed(1)),
    mejora_kg: item.deltaKg === null ? "" : Number(item.deltaKg.toFixed(1)),
    mejora_pct: item.deltaPercent === null ? "" : Number(item.deltaPercent.toFixed(1)),
    tendencia: getTrendArrow(item),
    ultima_fecha: item.lastDate ? formatReportDate(item.lastDate) : "",
  }));

  const exerciseWeekRows = snapshot.exerciseWeeklyProgress.map((item) => ({
    semana: item.weekNumber,
    ejercicio: item.exerciseName,
    grupo: item.muscleGroup,
    exposiciones: item.exposures,
    series: item.totalSets,
    volumen_kg: Number(item.totalVolumeKg.toFixed(1)),
    mejor_e1rm: item.bestEstimatedRm === null ? "" : Number(item.bestEstimatedRm.toFixed(1)),
    rir_medio: item.averageRir === null ? "" : Number(item.averageRir.toFixed(2)),
  }));

  const distributionRows = snapshot.muscleDistribution.map((item) => ({
    grupo: item.muscleGroup,
    series: item.totalSets,
    volumen_kg: Number(item.totalVolumeKg.toFixed(1)),
    reparto_pct: Number(item.sharePercent.toFixed(1)),
  }));

  const recommendationRows = snapshot.recommendations.map((item, index) => ({
    orden: index + 1,
    tono: item.tone,
    titulo: item.title,
    mensaje: item.message,
  }));

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

  appendSheet(workbook, "Resumen", summaryRows);
  appendSheet(workbook, "Sesiones", sessionRows);
  appendSheet(workbook, "Series", setRows);
  appendSheet(workbook, "Medidas", measurementRows);
  appendSheet(workbook, "Progresion", progressionRows);
  appendSheet(workbook, "Favorito", favoriteRows);
  appendSheet(workbook, "Records", recordsRows);
  appendSheet(workbook, "Musculos", muscleRows);
  appendSheet(workbook, "Semanas", weeklyRows);
  appendSheet(workbook, "Ejercicios", exerciseDetailRows);
  appendSheet(workbook, "Ejercicio_semana", exerciseWeekRows);
  appendSheet(workbook, "Distribucion", distributionRows);
  appendSheet(workbook, "Recomendaciones", recommendationRows);
  appendSheet(workbook, "Conclusiones", conclusionRows);
  appendSheet(workbook, "Tendencias", trendRows);
  appendSheet(workbook, "Datos_graficas", chartReadyRows);
  appendSignatureSheet(workbook, athleteName, "Informe Excel");

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
    "Resumen científico del rendimiento: marcas, evolución de carga, adherencia, distribución muscular y cambios corporales.",
    14,
    46,
    { maxWidth: 180 }
  );

  autoTable(doc, {
    startY: 54,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 2.6, textColor: [40, 35, 28] },
    headStyles: { fillColor: [15, 118, 110] },
    body: [
      ["Atleta", athleteName],
      ["Sesiones totales", String(snapshot.totalSessions)],
      ["Semanas con datos", String(snapshot.totalWeeksTracked)],
      ["Fiabilidad de la muestra", snapshot.dataReadiness],
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
    ],
  });

  let currentY = ((doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 90) + 6;
  currentY = drawLineChart(doc, "Peso corporal", snapshot.weightTrend, 14, currentY, 82, 34, [15, 118, 110]);
  currentY = drawLineChart(doc, "Volumen por sesión", snapshot.sessionVolumeTrend, 110, currentY - 52, 82, 34, [201, 106, 61]);
  currentY += 4;
  currentY = drawLineChart(doc, "RIR medio", snapshot.sessionRirTrend, 14, currentY, 82, 34, [124, 58, 237]);
  currentY = drawLineChart(doc, "Sesiones por mes", snapshot.sessionFrequencyTrend, 110, currentY - 52, 82, 34, [37, 99, 235]);

  doc.addPage();
  const donutData = buildDonutChartDataUrl(snapshot.muscleDistribution);
  if (donutData) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Distribución del trabajo por grupo muscular", 14, 18);
    doc.addImage(donutData, "PNG", 14, 24, 180, 84);
  }

  const barData = buildBarChartDataUrl("Top ejercicios por mejora porcentual", snapshot.exerciseReportRows);
  if (barData) {
    doc.addImage(barData, "PNG", 14, 116, 180, 90);
  }

  doc.addPage();
  autoTable(doc, {
    startY: 18,
    theme: "striped",
    styles: { fontSize: 8.7, cellPadding: 2.2 },
    headStyles: { fillColor: [32, 86, 91] },
    head: [["Top", "Ejercicio", "Grupo", "Tendencia", "e1RM inicial", "e1RM actual", "Mejora %"]],
    body: snapshot.exerciseReportRows.length
      ? snapshot.exerciseReportRows.slice(0, 10).map((item, index) => [
          String(index + 1),
          item.exerciseName,
          item.muscleGroup,
          getTrendArrow(item),
          item.firstEstimatedRm === null ? "--" : item.firstEstimatedRm.toFixed(1),
          item.latestEstimatedRm === null ? "--" : item.latestEstimatedRm.toFixed(1),
          item.deltaPercent === null ? "--" : `${item.deltaPercent.toFixed(1)}%`,
        ])
      : [["-", "Sin datos suficientes", "-", "-", "-", "-", "-"]],
  });

  autoTable(doc, {
    startY: ((doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 18) + 8,
    theme: "grid",
    styles: { fontSize: 8.5, cellPadding: 2.1 },
    headStyles: { fillColor: [201, 106, 61] },
    head: [["Semana", "Sesiones", "Series", "Volumen", "RIR medio"]],
    body: snapshot.weeklyOverview.length
      ? snapshot.weeklyOverview.map((item) => [
          String(item.weekNumber),
          String(item.totalSessions),
          String(item.totalSets),
          `${item.totalVolumeKg.toFixed(1)} kg`,
          item.averageRir.toFixed(2),
        ])
      : [["-", "-", "-", "-", "-"]],
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
    head: [["Sugerencia", "Mensaje"]],
    body: snapshot.recommendations.map((item) => [item.title, item.message]),
  });

  doc.addPage();
  autoTable(doc, {
    startY: 18,
    theme: "striped",
    styles: { fontSize: 8.4, cellPadding: 2 },
    headStyles: { fillColor: [32, 86, 91] },
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
    startY: ((doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 18) + 8,
    theme: "striped",
    styles: { fontSize: 8.2, cellPadding: 1.8 },
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

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(96, 96, 96);
    doc.text(`Hecho por ${athleteName} · Gym Tracker`, 14, 292);
    doc.text(`Página ${page}/${pageCount}`, 176, 292, { align: "right" });
  }

  doc.save(`informe-rendimiento-${buildFileDateSuffix()}.pdf`);
}
