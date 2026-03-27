// Sterling Opulence Carpet Care - Backend API
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let path = url.pathname;
    // Strip /api prefix if present
    if (path.startsWith('/api')) path = path.substring(4);
    if (path === '') path = '/';
    const method = request.method;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
      'Content-Type': 'application/json'
    };

    // Handle preflight
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      // Root
      if (path === '/') {
        return json({ status: 'Sterling Opulence API running' }, corsHeaders);
      }

      // SETTINGS
      if (path === '/settings' && method === 'GET') {
        const row = await env.DB.prepare('SELECT biz_name, zelle, deposit, max_bookings FROM settings WHERE id = 1').first();
        return json(row || {}, corsHeaders);
      }
      if (path === '/settings' && method === 'PUT') {
        const body = await request.json();
        const s = await env.DB.prepare('SELECT * FROM settings WHERE id = 1').first();
        await env.DB.prepare('UPDATE settings SET biz_name=?, zelle=?, deposit=?, max_bookings=? WHERE id=1')
          .bind(body.biz_name || s.biz_name, body.zelle || s.zelle, body.deposit ?? s.deposit, body.max_bookings ?? s.max_bookings).run();
        return json({ success: true }, corsHeaders);
      }
      if (path === '/settings/full' && method === 'PUT') {
        const body = await request.json();
        if (body.admin_pass) await env.DB.prepare('UPDATE settings SET admin_pass=? WHERE id=1').bind(body.admin_pass).run();
        return json({ success: true }, corsHeaders);
      }

      // AUTH
      if (path === '/auth/admin' && method === 'POST') {
        const body = await request.json();
        const s = await env.DB.prepare('SELECT admin_pass FROM settings WHERE id = 1').first();
        return json({ success: body.password === s.admin_pass }, corsHeaders);
      }
      if (path === '/auth/login' && method === 'POST') {
        const body = await request.json();
        const w = await env.DB.prepare('SELECT * FROM workers WHERE LOWER(name) = LOWER(?) AND password = ?').bind(body.name, body.password).first();
        if (w) return json({ success: true, worker: { id: w.id, name: w.name, flat_rate: w.flat_rate } }, corsHeaders);
        return json({ success: false }, corsHeaders);
      }

      // SERVICES
      if (path === '/services' && method === 'GET') {
        const { results } = await env.DB.prepare('SELECT * FROM services ORDER BY id').all();
        return json(results, corsHeaders);
      }
      if (path === '/services' && method === 'POST') {
        const body = await request.json();
        const r = await env.DB.prepare('INSERT INTO services (emoji, name, price, description, duration, visible) VALUES (?,?,?,?,?,?)')
          .bind(body.emoji || '🧹', body.name, body.price, body.description || '', body.duration || 60, 1).run();
        return json({ success: true, id: r.meta.last_row_id }, corsHeaders);
      }
      if (path.match(/^\/services\/\d+$/) && method === 'PUT') {
        const id = path.split('/')[2];
        const body = await request.json();
        await env.DB.prepare('UPDATE services SET emoji=?, name=?, price=?, description=?, duration=?, visible=? WHERE id=?')
          .bind(body.emoji, body.name, body.price, body.description || '', body.duration || 60, body.visible ?? 1, id).run();
        return json({ success: true }, corsHeaders);
      }
      if (path.match(/^\/services\/\d+$/) && method === 'DELETE') {
        const id = path.split('/')[2];
        await env.DB.prepare('DELETE FROM services WHERE id=?').bind(id).run();
        return json({ success: true }, corsHeaders);
      }

      // BOOKINGS
      if (path === '/bookings' && method === 'GET') {
        const { results } = await env.DB.prepare('SELECT * FROM bookings ORDER BY id DESC').all();
        return json(results, corsHeaders);
      }
      if (path === '/bookings' && method === 'POST') {
        const body = await request.json();
        const r = await env.DB.prepare(
          'INSERT INTO bookings (customer_name, customer_phone, address, notes, date, time_slot, job_duration, time_display, items, total, deposit, deposit_sent, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)'
        ).bind(body.customer_name, body.customer_phone, body.address, body.notes || '',
          body.date, body.time_slot || null, body.job_duration || null, body.time_display || '',
          JSON.stringify(body.items), body.total, body.deposit || 25, body.deposit_sent ? 1 : 0, 'pending').run();
        return json({ success: true, id: r.meta.last_row_id }, corsHeaders);
      }
      if (path.match(/^\/bookings\/\d+$/) && method === 'PUT') {
        const id = path.split('/')[2];
        const body = await request.json();
        const fields = []; const values = [];
        for (const key of ['status','worker_id','worker_name','clock_in','clock_out','photo_before','photo_after','photos_reviewed','rating','review','deposit_sent']) {
          if (body[key] !== undefined) { fields.push(key+'=?'); values.push(key === 'deposit_sent' ? (body[key] ? 1 : 0) : body[key]); }
        }
        if (fields.length) { values.push(id); await env.DB.prepare('UPDATE bookings SET '+fields.join(',')+' WHERE id=?').bind(...values).run(); }
        return json({ success: true }, corsHeaders);
      }
      if (path === '/bookings/date' && method === 'POST') {
        const body = await request.json();
        const { results } = await env.DB.prepare("SELECT time_slot, job_duration FROM bookings WHERE date = ? AND status != 'cancelled'").bind(body.date).all();
        return json(results, corsHeaders);
      }

      // TRACK
      if (path === '/track' && method === 'POST') {
        const body = await request.json();
        const { results } = await env.DB.prepare('SELECT * FROM bookings WHERE customer_phone = ? ORDER BY id DESC').bind(body.phone).all();
        return json(results, corsHeaders);
      }

      // WORKERS
      if (path === '/workers' && method === 'GET') {
        const { results } = await env.DB.prepare('SELECT id, name, flat_rate, created_at FROM workers ORDER BY id').all();
        return json(results, corsHeaders);
      }
      if (path === '/workers' && method === 'POST') {
        const body = await request.json();
        const r = await env.DB.prepare('INSERT INTO workers (name, password, flat_rate) VALUES (?,?,?)').bind(body.name, body.password, body.flat_rate || 25).run();
        return json({ success: true, id: r.meta.last_row_id }, corsHeaders);
      }
      if (path.match(/^\/workers\/\d+$/) && method === 'DELETE') {
        const id = path.split('/')[2];
        await env.DB.prepare('DELETE FROM workers WHERE id=?').bind(id).run();
        return json({ success: true }, corsHeaders);
      }

      // GALLERY
      if (path === '/gallery' && method === 'GET') {
        const { results } = await env.DB.prepare('SELECT * FROM gallery ORDER BY id DESC').all();
        return json(results, corsHeaders);
      }
      if (path === '/gallery' && method === 'POST') {
        const body = await request.json();
        const r = await env.DB.prepare('INSERT INTO gallery (before_url, after_url, caption) VALUES (?,?,?)').bind(body.before_url, body.after_url, body.caption || '').run();
        return json({ success: true, id: r.meta.last_row_id }, corsHeaders);
      }
      if (path.match(/^\/gallery\/\d+$/) && method === 'DELETE') {
        const id = path.split('/')[2];
        await env.DB.prepare('DELETE FROM gallery WHERE id=?').bind(id).run();
        return json({ success: true }, corsHeaders);
      }

      // EXPENSES
      if (path === '/expenses' && method === 'GET') {
        const { results } = await env.DB.prepare('SELECT * FROM expenses ORDER BY date DESC, id DESC').all();
        return json(results, corsHeaders);
      }
      if (path === '/expenses' && method === 'POST') {
        const body = await request.json();
        const r = await env.DB.prepare('INSERT INTO expenses (category, description, amount, miles, date) VALUES (?,?,?,?,?)')
          .bind(body.category, body.description || '', body.amount, body.miles || 0, body.date).run();
        return json({ success: true, id: r.meta.last_row_id }, corsHeaders);
      }
      if (path.match(/^\/expenses\/\d+$/) && method === 'DELETE') {
        const id = path.split('/')[2];
        await env.DB.prepare('DELETE FROM expenses WHERE id=?').bind(id).run();
        return json({ success: true }, corsHeaders);
      }

      // MILEAGE
      if (path === '/mileage' && method === 'GET') {
        const { results } = await env.DB.prepare('SELECT * FROM mileage_log ORDER BY date DESC, id DESC').all();
        return json(results, corsHeaders);
      }
      if (path === '/mileage' && method === 'POST') {
        const body = await request.json();
        const r = await env.DB.prepare('INSERT INTO mileage_log (worker_id, worker_name, date, start_reading, end_reading, miles, deduction) VALUES (?,?,?,?,?,?,?)')
          .bind(body.worker_id, body.worker_name, body.date, body.start_reading, body.end_reading, body.miles, body.deduction).run();
        await env.DB.prepare('INSERT INTO expenses (category, description, amount, miles, date) VALUES (?,?,?,?,?)')
          .bind('🚗 Mileage', body.worker_name + ' — ' + body.miles.toFixed(1) + ' mi', body.deduction, body.miles, body.date).run();
        return json({ success: true, id: r.meta.last_row_id }, corsHeaders);
      }

      return json({ error: 'Not found' }, corsHeaders, 404);
    } catch (err) {
      return json({ error: err.message }, corsHeaders, 500);
    }
  }
};

function json(data, headers, status = 200) {
  return new Response(JSON.stringify(data), { status, headers });
}
