insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Aperturas Inclinado', 'Mancuernas Inclinado', 'mancuerna', 'Aperturas_Inclinado', 'Pecho', 'Mancuernas')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Aperturas Medio', 'Pec Deck Maquina', 'polea', 'Aperturas_Medio', 'Pecho', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Aperturas Medio', 'Mancuernas Plano', 'mancuerna', 'Aperturas_Medio', 'Pecho', 'Mancuernas')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Aperturas Bajo', 'Polea Baja Crossover', 'polea', 'Aperturas_Bajo', 'Pecho', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Band Pull-Apart', 'Elastico', 'peso_corporal', 'Band_Pull_Apart', 'Hombros', 'Peso corporal')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Crunch', 'Polea', 'polea', 'Crunch', 'Core', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Crunch', 'Maquina', 'polea', 'Crunch', 'Core', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Curl Biceps', 'Barra Recta Polea', 'polea', 'Curl_Biceps', 'Biceps', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Curl Biceps', 'Bayesian Polea Individual', 'polea', 'Curl_Biceps', 'Biceps', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Curl Biceps', 'Concentrado Maquina', 'polea', 'Curl_Biceps', 'Biceps', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Curl Biceps', 'Inclinado Banco Mancuernas', 'mancuerna', 'Curl_Biceps', 'Biceps', 'Mancuernas')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Curl Biceps', 'Polea Baja Supino', 'polea', 'Curl_Biceps', 'Biceps', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Curl Biceps', 'Mancuerna', 'mancuerna', 'Curl_Biceps', 'Biceps', 'Mancuernas')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Curl Femoral', 'Sentado Maquina', 'polea', 'Curl_Femoral', 'Femoral', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Curl Femoral', 'Tumbado Maquina', 'polea', 'Curl_Femoral', 'Femoral', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Curl Martillo', 'Polea Individual', 'polea', 'Curl_Martillo', 'Biceps', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Curl Muneca', 'Pronado', 'mancuerna', 'Curl_Muneca', 'Antebrazo', 'Mancuernas')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Curl Muneca', 'Supinado', 'mancuerna', 'Curl_Muneca', 'Antebrazo', 'Mancuernas')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Curl Muneca', 'Sulek Polea', 'polea', 'Curl_Muneca', 'Antebrazo', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Curl Rumano', 'Mancuernas', 'mancuerna', 'Curl_Rumano', 'Femoral', 'Mancuernas')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Dominadas', 'Polea Alta Prono Ancho', 'peso_corporal', 'Dominadas', 'Espalda', 'Peso corporal')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Elevacion Gemelo', 'De Pie', 'disco', 'Elevacion_Gemelo', 'Pantorrillas', 'Disco')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Elevacion Gemelo', 'Sentado', 'disco', 'Elevacion_Gemelo', 'Pantorrillas', 'Disco')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Elevacion Piernas', 'Colgado', 'peso_corporal', 'Elevacion_Piernas', 'Core', 'Peso corporal')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Elevacion Talones', 'De Pie Maquina', 'polea', 'Elevacion_Talones', 'Pantorrillas', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Elevaciones Laterales', 'Cable Polea Individual', 'polea', 'Elevaciones_Laterales', 'Hombros', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Elevaciones Laterales', 'Mancuerna', 'mancuerna', 'Elevaciones_Laterales', 'Hombros', 'Mancuernas')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Elevaciones Laterales', 'Maquina', 'disco', 'Elevaciones_Laterales', 'Hombros', 'Disco')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Elevaciones Posteriores', 'Polea Individual', 'polea', 'Elevaciones_Posteriores', 'Hombros', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Encogimientos', 'Mancuernas Trapecio', 'mancuerna', 'Encogimientos', 'Trapecios', 'Mancuernas')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Estiramiento', 'Piriforme Tumbado', 'peso_corporal', 'Estiramiento', 'Movilidad', 'Peso corporal')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Extension Cuadriceps', 'Maquina', 'polea', 'Extension_Cuadriceps', 'Cuadriceps', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Extension Cuadriceps', 'Maquina Individual', 'polea', 'Extension_Cuadriceps', 'Cuadriceps', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Extension Triceps', 'Katana', 'polea', 'Extension_Triceps', 'Triceps', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Extension Triceps', 'Press Barra Recta', 'polea', 'Extension_Triceps', 'Triceps', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Extension Triceps', 'Press Barra V', 'polea', 'Extension_Triceps', 'Triceps', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Extension Triceps', 'Extension Polea Individual', 'polea', 'Extension_Triceps', 'Triceps', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Face Pull', 'Elastico (calent.)', 'peso_corporal', 'Face_Pull', 'Hombros', 'Peso corporal')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Face Pull', 'Polea Alta Cuerda', 'polea', 'Face_Pull', 'Hombros', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Farmer Carry', 'Libre', 'mancuerna', 'Farmer_Carry', 'Trapecios', 'Mancuernas')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Fondos', 'Paralelas', 'peso_corporal', 'Fondos', 'Pecho', 'Peso corporal')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Hip Circle', 'En Suelo', 'peso_corporal', 'Hip_Circle', 'Gluteos', 'Peso corporal')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Hiperextension', 'Banco Romano', 'peso_corporal', 'Hiperextension', 'Femoral', 'Peso corporal')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('JM Press', 'Multipower', 'disco', 'JM_Press', 'Triceps', 'Disco')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Jalon', 'Elastico (calentamiento)', 'polea', 'Jalon', 'Espalda', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Jalon', 'Polea Alta Prono Ancho', 'polea', 'Jalon', 'Espalda', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Jalon', 'Polea Alta Supino Estrecho', 'polea', 'Jalon', 'Espalda', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Lagartija', 'Calentamiento', 'peso_corporal', 'Lagartija', 'Pecho', 'Peso corporal')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Pajaro', 'Elevacion Posterior', 'mancuerna', 'Pajaro', 'Hombros', 'Mancuernas')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Peck Deck Invertida', 'Maquina', 'polea', 'Peck_Deck_Invertida', 'Hombros', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Perro', 'Postura Yoga', 'peso_corporal', 'Perro', 'Core', 'Peso corporal')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Peso Muerto Parcial', 'Barra', 'disco', 'Peso_Muerto_Parcial', 'Espalda', 'Disco')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Prensa Pierna', 'Ambos Pies', 'polea', 'Prensa_Pierna', 'Cuadriceps', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Prensa Pierna', 'Individual', 'polea', 'Prensa_Pierna', 'Cuadriceps', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Press Plano', 'Barra', 'disco', 'Press_Plano', 'Pecho', 'Disco')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Press Plano', 'Mancuernas', 'mancuerna', 'Press_Plano', 'Pecho', 'Mancuernas')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Press Plano', 'Multipower', 'disco', 'Press_Plano', 'Pecho', 'Disco')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Press Plano', 'Maquina', 'polea', 'Press_Plano', 'Pecho', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Press Inclinado', 'Multipower', 'disco', 'Press_Inclinado', 'Pecho', 'Disco')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Press Inclinado', 'Barra', 'disco', 'Press_Inclinado', 'Pecho', 'Disco')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Press Inclinado', 'Mancuernas', 'mancuerna', 'Press_Inclinado', 'Pecho', 'Mancuernas')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Press Inclinado', 'Maquina', 'polea', 'Press_Inclinado', 'Pecho', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Press Militar', 'Mancuernas Sentado', 'mancuerna', 'Press_Militar', 'Hombros', 'Mancuernas')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Press Polea', 'Barra Recta Diagonal Arriba', 'polea', 'Press_Polea', 'Pecho', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Pulldown', 'Polea Alta Brazos Rectos Prono', 'polea', 'Pulldown', 'Espalda', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Remo', 'Maquina Hammer Neutro Unilateral', 'polea', 'Remo', 'Espalda', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Remo', 'Maquina Neutro Ancho', 'polea', 'Remo', 'Espalda', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Remo', 'Maquina Neutro Estrecho', 'polea', 'Remo', 'Espalda', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Remo', 'Maquina Prono', 'polea', 'Remo', 'Espalda', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Remo', 'Multipower Barra', 'disco', 'Remo', 'Espalda', 'Disco')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Remo', 'Polea Baja Ancho Supino Trapecio', 'polea', 'Remo', 'Espalda', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Remo', 'Polea Individual', 'polea', 'Remo', 'Espalda', 'Polea')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Rotacion', 'Hombros Circulos', 'peso_corporal', 'Rotacion', 'Core', 'Peso corporal')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Rotacion', 'Manguito Rotador', 'peso_corporal', 'Rotacion', 'Core', 'Peso corporal')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Plancha', 'Tumbado', 'peso_corporal', 'Plancha', 'Core', 'Peso corporal')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Rueda Abdominal', 'Ab Wheel', 'peso_corporal', 'Rueda_Abdominal', 'Core', 'Peso corporal')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Sentadilla', 'Multipower Cuna Talones', 'disco', 'Sentadilla', 'Cuadriceps', 'Disco')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;

insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('Skullcrusher', 'Mancuerna Tumbado', 'mancuerna', 'Skullcrusher', 'Triceps', 'Mancuernas')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;
