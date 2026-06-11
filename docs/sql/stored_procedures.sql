-- =============================================================================
-- Stored Procedures / Funciones almacenadas — SIC-UNNE
--
-- Ambas usan CREATE OR REPLACE, por lo que el script es IDEMPOTENTE:
-- se puede ejecutar múltiples veces sin error (checklist 3.2).
-- Ejecutar en el SQL Editor de Supabase (o psql).
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- (A) ACTUALIZACIÓN — Suspender un usuario.
-- Invocada desde UsuarioRepositorio.suspender() vía supabase.rpc(...).
-- Usada en C-01 al resolver una denuncia con acción de suspensión.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function sp_suspender_usuario(
  p_id_usuario  integer,
  p_fecha_hasta date default null
) returns void
language plpgsql
as $$
begin
  update usuario
     set estado = 'Suspendido',
         fecha_suspension_hasta = p_fecha_hasta
   where id_usuario = p_id_usuario;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- (B) CONSULTA — Cantidad de denuncias por estado.
-- Invocada desde DenunciaRepositorio.contarPorEstado() vía supabase.rpc(...).
-- Alimenta las tarjetas (Total / Pendientes / Resueltas) del panel de Denuncias.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function fn_contar_denuncias_por_estado()
returns table (estado varchar, cantidad bigint)
language sql
as $$
  select estado, count(*)::bigint as cantidad
    from denuncia
   group by estado;
$$;
