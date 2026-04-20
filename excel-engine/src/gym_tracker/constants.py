"""Core workbook constants derived from the system prompt."""

N_WK = 12
DAYS = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "SABADO"]
DAY_SLOTS = {
    "LUNES": 11,
    "MARTES": 11,
    "MIERCOLES": 15,
    "JUEVES": 13,
    "SABADO": 11,
}
CUM_SLOTS = {
    "LUNES": 0,
    "MARTES": 11,
    "MIERCOLES": 22,
    "JUEVES": 37,
    "SABADO": 50,
}
ROWS_PER_WEEK_PER_DAY = 26
HIST_START = 3
SUG_START = 4
DATA_START = 10
WEEK_TYPES = ["HIP", "HIP", "FUE", "HIP", "HIP", "FUE", "HIP", "HIP", "FUE", "HIP", "FUE", "DEL"]
