-- =============================================================================
-- FUNCIÓN RPC: importar_estructura_academica
-- Descripción : Importa un array JSONB de filas de CSV en una única
--               transacción. Si cualquier fila falla, se hace Rollback total.
-- Parámetro   : payload  JSONB  — Array de objetos con las siguientes claves:
--
--   edificio_nombre     TEXT  (requerido)
--   edificio_direccion  TEXT  (opcional, default 'Sin especificar')
--   facultad_nombre     TEXT  (requerido)
--   facultad_ciudad     TEXT  (opcional, default 'Sin especificar')
--   carrera_nombre      TEXT  (requerido)
--   periodo_nombre      TEXT  (requerido, debe coincidir con el check constraint)
--   periodo_fecha_inicio DATE  (requerido, formato YYYY-MM-DD)
--   periodo_fecha_fin    DATE  (requerido, formato YYYY-MM-DD)
--   asignatura_nombre   TEXT  (requerido)
--   asignatura_anio     TEXT  (opcional, ej. "2do")
--   profesor_nombre     TEXT  (requerido)
--   profesor_apellido   TEXT  (requerido)
--   profesor_documento  INT   (requerido, clave única)
--   profesor_correo     TEXT  (opcional)
--   comision_nombre     TEXT  (requerido)
--   comision_letra_desde CHAR (requerido)
--   comision_letra_hasta CHAR (requerido)
--
-- Retorna     : TEXT  — Mensaje de éxito con el conteo de filas procesadas.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.importar_estructura_academica(payload JSONB)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER  -- se ejecuta con los permisos del dueño de la función
AS $$
DECLARE
    fila            JSONB;                  -- fila actual del loop
    fila_num        INT  := 0;              -- contador para mensajes de error

    -- IDs resueltos en cada iteración
    v_id_edificio   INT;
    v_id_facultad   INT;
    v_id_carrera    INT;
    v_id_periodo    INT;
    v_id_asignatura INT;
    v_id_profesor   INT;
    v_id_comision   INT;
BEGIN
    -- -------------------------------------------------------------------------
    -- Validación básica del payload
    -- -------------------------------------------------------------------------
    IF payload IS NULL OR jsonb_array_length(payload) = 0 THEN
        RAISE EXCEPTION 'El payload está vacío o es NULL.';
    END IF;

    -- -------------------------------------------------------------------------
    -- Loop principal sobre cada fila del CSV (representada como objeto JSON)
    -- -------------------------------------------------------------------------
    FOR fila IN SELECT * FROM jsonb_array_elements(payload)
    LOOP
        fila_num := fila_num + 1;

        -- ── 1. EDIFICIO ───────────────────────────────────────────────────────
        -- Busca por nombre; si no existe, inserta y captura el nuevo ID.
        SELECT id_edificio
          INTO v_id_edificio
          FROM public.edificio
         WHERE nombre = (fila->>'edificio_nombre')
         LIMIT 1;

        IF NOT FOUND THEN
            INSERT INTO public.edificio (nombre, direccion, estado)
            VALUES (
                fila->>'edificio_nombre',
                COALESCE(fila->>'edificio_direccion', 'Sin especificar'),
                true
            )
            RETURNING id_edificio INTO v_id_edificio;
        END IF;

        -- ── 2. FACULTAD ───────────────────────────────────────────────────────
        SELECT id_facultad
          INTO v_id_facultad
          FROM public.facultad
         WHERE nombre = (fila->>'facultad_nombre')
         LIMIT 1;

        IF NOT FOUND THEN
            INSERT INTO public.facultad (nombre, ciudad, id_edificio, estado)
            VALUES (
                fila->>'facultad_nombre',
                COALESCE(fila->>'facultad_ciudad', 'Sin especificar'),
                v_id_edificio,
                true
            )
            RETURNING id_facultad INTO v_id_facultad;
        END IF;

        -- ── 3. CARRERA ────────────────────────────────────────────────────────
        SELECT id_carrera
          INTO v_id_carrera
          FROM public.carrera
         WHERE nombre = (fila->>'carrera_nombre')
           AND id_facultad = v_id_facultad
         LIMIT 1;

        IF NOT FOUND THEN
            INSERT INTO public.carrera (nombre, id_facultad, estado)
            VALUES (fila->>'carrera_nombre', v_id_facultad, true)
            RETURNING id_carrera INTO v_id_carrera;
        END IF;

        -- ── 4. PERIODO ────────────────────────────────────────────────────────
        -- El nombre debe coincidir con el check constraint ck_periodo_nombre.
        SELECT id_periodo
          INTO v_id_periodo
          FROM public.periodo
         WHERE nombre       = (fila->>'periodo_nombre')
           AND fecha_inicio = (fila->>'periodo_fecha_inicio')::DATE
         LIMIT 1;

        IF NOT FOUND THEN
            INSERT INTO public.periodo (nombre, fecha_inicio, fecha_fin, estado)
            VALUES (
                fila->>'periodo_nombre',
                (fila->>'periodo_fecha_inicio')::DATE,
                (fila->>'periodo_fecha_fin')::DATE,
                true
            )
            RETURNING id_periodo INTO v_id_periodo;
        END IF;

        -- ── 5. ASIGNATURA ─────────────────────────────────────────────────────
        SELECT id_asignatura
          INTO v_id_asignatura
          FROM public.asignatura
         WHERE nombre      = (fila->>'asignatura_nombre')
           AND id_carrera  = v_id_carrera
           AND id_periodo  = v_id_periodo
         LIMIT 1;

        IF NOT FOUND THEN
            INSERT INTO public.asignatura (nombre, anio_dictado, id_carrera, id_periodo, estado)
            VALUES (
                fila->>'asignatura_nombre',
                COALESCE(fila->>'asignatura_anio', ''),
                v_id_carrera,
                v_id_periodo,
                true
            )
            RETURNING id_asignatura INTO v_id_asignatura;
        END IF;

        -- ── 6. PROFESOR ───────────────────────────────────────────────────────
        -- El documento es la clave única de negocio para identificar un profesor.
        SELECT id_profesor
          INTO v_id_profesor
          FROM public.profesor
         WHERE documento = (fila->>'profesor_documento')::INT
         LIMIT 1;

        IF NOT FOUND THEN
            INSERT INTO public.profesor (nombre, apellido, documento, correo, estado)
            VALUES (
                fila->>'profesor_nombre',
                fila->>'profesor_apellido',
                (fila->>'profesor_documento')::INT,
                COALESCE(fila->>'profesor_correo', ''),
                true
            )
            RETURNING id_profesor INTO v_id_profesor;
        END IF;

        -- ── 7. COMISION ───────────────────────────────────────────────────────
        -- La comisión se identifica por su nombre + asignatura asociada.
        SELECT id_comision
          INTO v_id_comision
          FROM public.comision
         WHERE nombre        = (fila->>'comision_nombre')
           AND id_asignatura = v_id_asignatura
         LIMIT 1;

        IF NOT FOUND THEN
            INSERT INTO public.comision (nombre, letra_desde, letra_hasta, id_asignatura, estado)
            VALUES (
                fila->>'comision_nombre',
                (fila->>'comision_letra_desde')::CHAR,
                (fila->>'comision_letra_hasta')::CHAR,
                v_id_asignatura,
                true
            )
            RETURNING id_comision INTO v_id_comision;
        END IF;

        -- ── 8. COMISION_PROFESOR (tabla N:M) ──────────────────────────────────
        -- Inserta solo si la relación no existe aún (evita duplicados).
        INSERT INTO public.comision_profesor (id_comision, id_profesor)
        VALUES (v_id_comision, v_id_profesor)
        ON CONFLICT DO NOTHING;

    END LOOP;  -- fin del loop de filas

    -- -------------------------------------------------------------------------
    -- Si llegamos aquí sin excepciones, la transacción se confirma (COMMIT)
    -- automáticamente al retornar.
    -- -------------------------------------------------------------------------
    RETURN format(
        'Importación exitosa: %s fila(s) procesada(s).',
        fila_num
    );

EXCEPTION
    WHEN OTHERS THEN
        -- Cualquier error dentro del loop lanzará aquí y hará Rollback total.
        RAISE EXCEPTION
            'Error en fila % — % (SQLSTATE: %)',
            fila_num,
            SQLERRM,
            SQLSTATE;
END;
$$;

-- =============================================================================
-- PERMISOS: permitir que el rol "anon" y "authenticated" invoquen la función.
-- Ajusta según tu política de seguridad.
-- =============================================================================
GRANT EXECUTE ON FUNCTION public.importar_estructura_academica(JSONB)
    TO authenticated;

-- =============================================================================
-- EJEMPLO DE INVOCACIÓN DESDE SUPABASE JS CLIENT:
--
-- const { data, error } = await supabase.rpc('importar_estructura_academica', {
--   payload: [
--     {
--       edificio_nombre:      'Edificio Central',
--       edificio_direccion:   'Av. Libertad 5470',
--       facultad_nombre:      'Facultad de Ciencias Exactas',
--       facultad_ciudad:      'Corrientes',
--       carrera_nombre:       'Licenciatura en Sistemas',
--       periodo_nombre:       '1er Cuatrimestre',
--       periodo_fecha_inicio: '2025-03-01',
--       periodo_fecha_fin:    '2025-07-31',
--       asignatura_nombre:    'Ingeniería de Software II',
--       asignatura_anio:      '4to',
--       profesor_nombre:      'Juan',
--       profesor_apellido:    'Pérez',
--       profesor_documento:   12345678,
--       profesor_correo:      'jperez@unne.edu.ar',
--       comision_nombre:      'COM-A',
--       comision_letra_desde: 'A',
--       comision_letra_hasta: 'M',
--     }
--   ]
-- });
-- =============================================================================