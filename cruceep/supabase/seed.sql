-- ============================================================================
-- CruceEP — seed data (sample/illustrative; verify before treating as official)
--
-- Run after 0001_init.sql. Idempotent: uses stable slugs / on conflict.
-- These records mirror the in-app mock providers so a Supabase-backed
-- deployment shows the same starter content the offline demo does.
-- ============================================================================

-- --- Bridges ---------------------------------------------------------------
insert into public.bridges (slug, name, alternate_names, city, country_pair, latitude, longitude, active)
values
  ('pdn-santa-fe', 'Paso del Norte (Santa Fe)', array['Santa Fe Street Bridge','PDN','El Paso Downtown'], 'El Paso', 'US-MX', 31.7522, -106.4869, true),
  ('stanton', 'Stanton Street', array['Lerdo','Stanton/Lerdo'], 'El Paso', 'US-MX', 31.7585, -106.4797, true),
  ('ysleta-zaragoza', 'Ysleta–Zaragoza', array['Zaragoza','Ysleta'], 'El Paso', 'US-MX', 31.6707, -106.3266, true),
  ('bota', 'Bridge of the Americas', array['BOTA','Cordova','Free Bridge'], 'El Paso', 'US-MX', 31.7681, -106.4451, true),
  ('tornillo-guadalupe', 'Tornillo–Guadalupe', array['Marcelino Serna','Tornillo'], 'Tornillo', 'US-MX', 31.4406, -106.0859, true),
  ('santa-teresa', 'Santa Teresa', array['San Jeronimo','Jeronimo–Santa Teresa'], 'Santa Teresa (NM)', 'US-MX', 31.7847, -106.6936, true)
on conflict (slug) do nothing;

-- --- Sample bridge wait snapshots (clearly labeled as sample) ---------------
insert into public.bridge_wait_snapshots (bridge_id, direction, mode, lane_type, wait_minutes, status, source, source_url, confidence, observed_at)
select b.id, 'northbound', 'vehicle', 'General', 25, 'open',
       'CBP Border Wait Times (sample)', 'https://bwt.cbp.gov/', 'mock', now()
from public.bridges b where b.slug = 'ysleta-zaragoza';

insert into public.bridge_wait_snapshots (bridge_id, direction, mode, lane_type, wait_minutes, status, source, source_url, confidence, observed_at)
select b.id, 'northbound', 'pedestrian', 'Pedestrian', 12, 'open',
       'CBP Border Wait Times (sample)', 'https://bwt.cbp.gov/', 'mock', now()
from public.bridges b where b.slug = 'pdn-santa-fe';

-- --- Alerts ----------------------------------------------------------------
insert into public.alerts (title_en, title_es, body_en, body_es, category, severity, affected_area, source, source_url, starts_at, ends_at, active)
values
  ('Route 8 detour near Downtown',
   'Desvío de la Ruta 8 cerca del Centro',
   'Sun Metro Route 8 is detouring around Santa Fe St due to roadwork. Expect 5–10 minute delays.',
   'La Ruta 8 de Sun Metro tiene un desvío alrededor de la calle Santa Fe por obras. Espere demoras de 5 a 10 minutos.',
   'sun_metro', 'minor', 'Downtown El Paso',
   'Sun Metro (sample)', 'https://www.sunmetro.net/', now() - interval '2 hours', now() + interval '10 hours', true),
  ('ETA Mission Valley schedule change',
   'Cambio de horario de ETA en Mission Valley',
   'County ETA service to Mission Valley shifts to summer hours starting Monday. Check the schedule before traveling.',
   'El servicio ETA del condado a Mission Valley cambia a horario de verano a partir del lunes. Revise el horario antes de viajar.',
   'eta', 'info', 'Mission Valley / Rural El Paso County',
   'El Paso County ETA (sample)', 'https://www.epcounty.com/eta/', now() - interval '1 hour', null, true),
  ('Heavy southbound delays at Ysleta–Zaragoza',
   'Demoras fuertes hacia el sur en Ysleta–Zaragoza',
   'Southbound vehicle lanes at Ysleta–Zaragoza are experiencing heavier-than-usual delays this afternoon.',
   'Los carriles vehiculares hacia el sur en Ysleta–Zaragoza tienen demoras más fuertes de lo normal esta tarde.',
   'bridge', 'major', 'Ysleta–Zaragoza International Bridge',
   'CBP Border Wait Times (sample)', 'https://bwt.cbp.gov/', now() - interval '45 minutes', now() + interval '3 hours', true),
  ('Excessive Heat Warning',
   'Advertencia de Calor Excesivo',
   'An Excessive Heat Warning is in effect through this evening. Highs near 105°F. Limit time outdoors and hydrate.',
   'Hay una Advertencia de Calor Excesivo vigente hasta esta noche. Máximas cerca de 40°C. Limite el tiempo al aire libre e hidrátese.',
   'weather', 'severe', 'El Paso County',
   'National Weather Service (sample)', 'https://www.weather.gov/elp/', now() - interval '30 minutes', now() + interval '6 hours', true),
  ('City cooling centers open extended hours',
   'Centros de enfriamiento de la ciudad con horario extendido',
   'City of El Paso libraries and recreation centers are open as cooling centers with extended hours during the heat warning.',
   'Las bibliotecas y centros recreativos de la Ciudad de El Paso están abiertos como centros de enfriamiento con horario extendido durante la advertencia de calor.',
   'cooling_center', 'info', 'Citywide',
   'City of El Paso (sample)', 'https://www.elpasotexas.gov/', now() - interval '30 minutes', now() + interval '12 hours', true);

-- --- Cooling centers -------------------------------------------------------
insert into public.cooling_centers (name, type, address, phone, website, hours_en, hours_es, latitude, longitude, source, source_url, active)
values
  ('El Paso Main Library', 'library', '501 N Oregon St, El Paso, TX 79901', '(915) 212-3000', 'https://epltx.org/',
   'Mon–Sat 10:00 AM – 6:00 PM', 'Lun–Sáb 10:00 AM – 6:00 PM', 31.759, -106.4869,
   'City of El Paso (sample)', 'https://www.elpasotexas.gov/', true),
  ('Nations Tobin Recreation Center', 'recreation_center', '8831 Railroad Dr, El Paso, TX 79904', '(915) 212-0092', 'https://www.elpasotexas.gov/parks-and-recreation/',
   'Mon–Fri 8:00 AM – 8:00 PM', 'Lun–Vie 8:00 AM – 8:00 PM', 31.8662, -106.4309,
   'City of El Paso (sample)', 'https://www.elpasotexas.gov/', true),
  ('Memorial Park Senior Center', 'public_facility', '1800 Byron St, El Paso, TX 79902', '(915) 212-0149', 'https://www.elpasotexas.gov/',
   'Mon–Fri 8:00 AM – 5:00 PM', 'Lun–Vie 8:00 AM – 5:00 PM', 31.7905, -106.4799,
   'City of El Paso (sample)', 'https://www.elpasotexas.gov/', true),
  ('Socorro Branch Library', 'library', '10171 Alameda Ave, Socorro, TX 79927', '(915) 858-2890', 'https://epltx.org/',
   'Tue–Sat 11:00 AM – 7:00 PM', 'Mar–Sáb 11:00 AM – 7:00 PM', 31.6549, -106.2877,
   'City of El Paso (sample)', 'https://epltx.org/', true),
  ('Clint Community Cooling Site', 'cooling_center', '200 N San Elizario Rd, Clint, TX 79836', '(915) 851-3146', null,
   'During heat advisories, 10:00 AM – 7:00 PM', 'Durante advertencias de calor, 10:00 AM – 7:00 PM', 31.5949, -106.2197,
   'El Paso County (sample)', 'https://www.epcounty.com/', true);

-- --- Data source health (baseline rows) ------------------------------------
insert into public.data_source_health (source_name, status, last_success_at, metadata)
values
  ('Border Wait Times', 'mock', now(), '{"note":"Using MockBorderWaitProvider. Replace with CBP adapter."}'::jsonb),
  ('Transit (Sun Metro / ETA)', 'mock', now(), '{"note":"Using MockTransitProvider. Replace with GTFS adapters."}'::jsonb),
  ('Weather (NWS)', 'mock', now(), '{"note":"Using MockWeatherProvider. Replace with NWS adapter."}'::jsonb),
  ('Alerts', 'mock', now(), '{"note":"Seeded sample alerts."}'::jsonb),
  ('Cooling Centers', 'mock', now(), '{"note":"Seeded sample cooling centers."}'::jsonb)
on conflict (source_name) do nothing;

-- ---------------------------------------------------------------------------
-- Promote an admin (run manually after the user signs up):
--
--   update public.profiles set role = 'admin' where email = 'you@example.com';
--
-- ---------------------------------------------------------------------------
