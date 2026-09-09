const SUPABASE_URL = 'https://itlskvloqoexxpiqwpyh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_BxXoHG0HBW42X-RVZddFZg_4aOeGUxH';
const TZ = 'America/Argentina/Buenos_Aires';

function clean(v) {
  return String(v == null ? '' : v)
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}
function hm(v) {
  const m = String(v || '').trim().match(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/);
  return m ? String(m[1]).padStart(2, '0') + m[2] + '00' : '';
}
function ymd(v) {
  return String(v || '').slice(0, 10).replace(/-/g, '');
}
function nextDay(date) {
  const [y, m, d] = String(date).slice(0, 10).split('-').map(Number);
  const z = new Date(Date.UTC(y, m - 1, d + 1));
  return z.toISOString().slice(0, 10).replace(/-/g, '');
}
function locationText(e) {
  return [e.venue, e.address, e.city, e.province].filter(Boolean).join(', ');
}
function description(e) {
  const start = hm(e.time || e.start_time);
  const end = hm(e.end_time);
  return [
    Array.isArray(e.categories) && e.categories.length
      ? 'HHV · ' + e.categories.join(' · ')
      : 'Agenda CultuRap · Hip Hop en Vivo',
    start && !end ? 'Finalización: A CONFIRMAR' : '',
    e.source_url ? 'Fuente: ' + e.source_url : ''
  ].filter(Boolean).join('\n');
}
function eventLines(e, stamp) {
  const date = String(e.date || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
  const start = hm(e.time || e.start_time);
  const end = hm(e.end_time);
  const uid = 'hhv-' + String(e.id || `${date}-${e.name || 'evento'}`).replace(/[^a-zA-Z0-9_-]/g, '') + '@hiphopenvivo';
  const out = [
    'BEGIN:VEVENT',
    'UID:' + uid,
    'DTSTAMP:' + stamp,
    start ? `DTSTART;TZID=${TZ}:${ymd(date)}T${start}` : `DTSTART;VALUE=DATE:${ymd(date)}`
  ];
  if (start && end) out.push(`DTEND;TZID=${TZ}:${ymd(date)}T${end}`);
  if (!start) out.push(`DTEND;VALUE=DATE:${nextDay(date)}`);
  out.push(
    'SUMMARY:' + clean(e.name || 'Evento HHV'),
    'LOCATION:' + clean(locationText(e)),
    'DESCRIPTION:' + clean(description(e))
  );
  if (e.source_url) out.push('URL:' + clean(e.source_url));
  out.push('END:VEVENT');
  return out;
}
function buildCalendar(events) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HHV//Agenda CultuRap//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:HHV · Agenda CultuRap',
    `X-WR-TIMEZONE:${TZ}`,
    'REFRESH-INTERVAL;VALUE=DURATION:PT1H',
    'X-PUBLISHED-TTL:PT1H'
  ];
  for (const e of events) lines.push(...eventLines(e, stamp));
  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}

module.exports = async function handler(req, res) {
  try {
    const url = new URL('/rest/v1/events', SUPABASE_URL);
    url.searchParams.set('select', '*');
    url.searchParams.set('active', 'eq.true');
    url.searchParams.set('status', 'neq.DESCARTADO');
    url.searchParams.set('order', 'date.asc');
    const r = await fetch(url, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
    if (!r.ok) throw new Error(`Supabase ${r.status}`);
    const events = await r.json();
    const calendar = buildCalendar(Array.isArray(events) ? events : []);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'inline; filename="HHV-Agenda-CultuRap.ics"');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=3600');
    res.setHeader('X-Robots-Tag', 'noindex');
    res.setHeader('X-HHV-Calendar', 'Agenda-CultuRap-v2.9.4');
    return res.end(calendar);
  } catch (error) {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end('HHV Agenda temporalmente no disponible');
  }
};
