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

export function downloadBaseExcel() {
  const anchor = document.createElement("a");
  anchor.href = "/downloads/Gym_Tracker.xlsx";
  anchor.download = "Gym_Tracker_base.xlsx";
  anchor.click();
}

export function downloadPerformanceWorkbook(sessions: WorkoutSession[], measurements: BodyMeasurement[]) {
  const snapshot = buildPerformanceSnapshot(sessions, measurements);
  const workbook = XLSX.utils.book_new();

  const summaryRows = [
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

  const trendRows = [
    ...snapshot.weightTrend.map((item) => ({ serie: "Peso corporal", fecha: item.label, valor: item.value })),
    ...snapshot.sessionVolumeTrend.map((item) => ({ serie: "Volumen por sesión", fecha: item.label, valor: item.value })),
    ...snapshot.sessionRirTrend.map((item) => ({ serie: "RIR medio", fecha: item.label, valor: item.value })),
    ...snapshot.topExerciseTrend.map((item) => ({ serie: "e1RM mejor ejercicio", fecha: item.label, valor: item.value })),
  ];

  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(summaryRows), "Resumen");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(sessionRows), "Sesiones");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(setRows), "Series");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(measurementRows), "Medidas");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(progressionRows), "Progresion");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(trendRows), "Tendencias");

  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  downloadBlob(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `informe-rendimiento-${buildFileDateSuffix()}.xlsx`
  );
}

export function downloadPerformancePdf(sessions: WorkoutSession[], measurements: BodyMeasurement[]) {
  const snapshot = buildPerformanceSnapshot(sessions, measurements);
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  doc.setFillColor(15, 118, 110);
  doc.rect(0, 0, 210, 34, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Informe de rendimiento", 14, 18);
  doc.setFontSize(11);
  doc.text(`Gym Tracker · ${buildFileDateSuffix()}`, 14, 26);

  doc.setTextColor(30, 26, 20);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Resumen científico del rendimiento: marcas, evolución de carga, adherencia y cambios corporales.",
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
