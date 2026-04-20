"""Excel 2016-safe formula templates."""


def exercise_type_formula(row: int) -> str:
    return (
        f'=IFERROR(INDEX(EJERCICIOS!$D$3:$D$85,'
        f'MATCH(A{row}&"|"&B{row},EJERCICIOS!$G$3:$G$85,0)),"--")'
    )
