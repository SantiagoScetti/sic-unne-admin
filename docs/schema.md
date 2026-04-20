-- 1. Habilitar RLS en todas las tablas de la estructura
ALTER TABLE public.edificio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facultad ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carrera ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.periodo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asignatura ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profesor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comision ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asignatura_profesor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comision_profesor ENABLE ROW LEVEL SECURITY;

-- 2. Crear políticas de acceso total para Administradores en cada tabla
CREATE POLICY "Admin_Access_edificio" ON public.edificio FOR ALL TO authenticated USING (public.es_admin()) WITH CHECK (public.es_admin());
CREATE POLICY "Admin_Access_facultad" ON public.facultad FOR ALL TO authenticated USING (public.es_admin()) WITH CHECK (public.es_admin());
CREATE POLICY "Admin_Access_carrera" ON public.carrera FOR ALL TO authenticated USING (public.es_admin()) WITH CHECK (public.es_admin());
CREATE POLICY "Admin_Access_periodo" ON public.periodo FOR ALL TO authenticated USING (public.es_admin()) WITH CHECK (public.es_admin());
CREATE POLICY "Admin_Access_asignatura" ON public.asignatura FOR ALL TO authenticated USING (public.es_admin()) WITH CHECK (public.es_admin());
CREATE POLICY "Admin_Access_profesor" ON public.profesor FOR ALL TO authenticated USING (public.es_admin()) WITH CHECK (public.es_admin());
CREATE POLICY "Admin_Access_comision" ON public.comision FOR ALL TO authenticated USING (public.es_admin()) WITH CHECK (public.es_admin());
CREATE POLICY "Admin_Access_asignatura_profesor" ON public.asignatura_profesor FOR ALL TO authenticated USING (public.es_admin()) WITH CHECK (public.es_admin());
CREATE POLICY "Admin_Access_comision_profesor" ON public.comision_profesor FOR ALL TO authenticated USING (public.es_admin()) WITH CHECK (public.es_admin());