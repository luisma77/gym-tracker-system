from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models.exercise import Exercise

DEFAULT_EXERCISES = [
    {"name": "Sentadilla", "muscle_group": "Pierna", "equipment": "Barra"},
    {"name": "Sentadilla frontal", "muscle_group": "Pierna", "equipment": "Barra"},
    {"name": "Prensa", "muscle_group": "Pierna", "equipment": "Maquina"},
    {"name": "Zancadas", "muscle_group": "Pierna", "equipment": "Mancuernas"},
    {"name": "Hip thrust", "muscle_group": "Gluteo", "equipment": "Barra"},
    {"name": "Extension de cuadriceps", "muscle_group": "Cuadriceps", "equipment": "Maquina"},
    {"name": "Curl femoral tumbado", "muscle_group": "Femoral", "equipment": "Maquina"},
    {"name": "Elevacion de gemelos", "muscle_group": "Gemelo", "equipment": "Maquina"},
    {"name": "Press banca", "muscle_group": "Pecho", "equipment": "Barra"},
    {"name": "Press inclinado con mancuernas", "muscle_group": "Pecho", "equipment": "Mancuernas"},
    {"name": "Aperturas en polea", "muscle_group": "Pecho", "equipment": "Polea"},
    {"name": "Peso muerto rumano", "muscle_group": "Femoral", "equipment": "Barra"},
    {"name": "Dominadas", "muscle_group": "Espalda", "equipment": "Peso corporal"},
    {"name": "Jalon al pecho", "muscle_group": "Espalda", "equipment": "Polea"},
    {"name": "Remo con barra", "muscle_group": "Espalda", "equipment": "Barra"},
    {"name": "Remo en maquina", "muscle_group": "Espalda", "equipment": "Maquina"},
    {"name": "Press militar", "muscle_group": "Hombro", "equipment": "Barra"},
    {"name": "Elevaciones laterales", "muscle_group": "Hombro", "equipment": "Mancuernas"},
    {"name": "Pajaro en peck deck", "muscle_group": "Hombro", "equipment": "Maquina"},
    {"name": "Curl biceps", "muscle_group": "Biceps", "equipment": "Mancuernas"},
    {"name": "Curl martillo", "muscle_group": "Biceps", "equipment": "Mancuernas"},
    {"name": "Fondos en paralelas", "muscle_group": "Triceps", "equipment": "Peso corporal"},
    {"name": "Extension de triceps en polea", "muscle_group": "Triceps", "equipment": "Polea"},
    {"name": "Face pull", "muscle_group": "Espalda alta", "equipment": "Polea"},
    {"name": "Ab wheel", "muscle_group": "Core", "equipment": "Peso corporal"},
    {"name": "Crunch en polea", "muscle_group": "Core", "equipment": "Polea"}
]


def seed_exercises(db: Session) -> None:
    existing_names = set(db.scalars(select(Exercise.name)).all())

    for item in DEFAULT_EXERCISES:
        if item["name"] not in existing_names:
            db.add(Exercise(**item))

    db.commit()
