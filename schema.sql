-- Sterling Opulence Carpet Care - Database Schema

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY,
  biz_name TEXT DEFAULT 'Sterling Opulence Carpet Care',
  zelle TEXT DEFAULT 'pay@sterlingopulence.com',
  deposit REAL DEFAULT 25,
  max_bookings INTEGER DEFAULT 10,
  admin_pass TEXT DEFAULT '1991',
  created_at TEXT DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO settings (id, biz_name, zelle, deposit, max_bookings, admin_pass)
VALUES (1, 'Sterling Opulence Carpet Care', 'pay@sterlingopulence.com', 25, 10, '1991');

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  emoji TEXT DEFAULT '🧹',
  name TEXT NOT NULL,
  price REAL NOT NULL,
  description TEXT DEFAULT '',
  duration INTEGER DEFAULT 60,
  visible INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO services (id, emoji, name, price, description, duration, visible) VALUES
(1, '🧼', '1 Area', 120, 'Room or Living Room — Minimum', 60, 1),
(2, '🏢', 'LR + 1 Bedroom', 180, 'Apartment Package', 90, 1),
(3, '🏢', 'LR + 2 Bedrooms', 220, 'Apartment Package', 120, 1),
(4, '🏢', 'LR + 3 Bedrooms', 260, 'Apartment Package', 150, 1),
(5, '🏢', 'LR + 4 Bedrooms', 300, 'Apartment Package — Best Value', 180, 1),
(6, '🏡', 'House LR + 2 Bed', 240, 'House Package', 120, 1),
(7, '🏡', 'House LR + 3 Bed', 280, 'House Package', 150, 1),
(8, '🏡', 'House LR + 4 Bed', 320, 'House Package', 180, 1),
(9, '🏡', 'House LR + 5 Bed', 360, 'House Package', 210, 1),
(10, '🪜', 'Stairs', 40, 'Add-On', 30, 1),
(11, '🚪', 'Walk-in Closet', 20, 'Add-On', 10, 1),
(12, '🏠', 'Walk-in Closet Large', 60, 'Add-On', 20, 1),
(13, '🚶‍♂️', 'Hallway', 60, 'Add-On', 15, 1);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  notes TEXT DEFAULT '',
  date TEXT NOT NULL,
  time_slot INTEGER DEFAULT NULL,
  job_duration INTEGER DEFAULT NULL,
  time_display TEXT DEFAULT '',
  items TEXT NOT NULL,
  total REAL NOT NULL,
  deposit REAL DEFAULT 25,
  deposit_sent INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  worker_id INTEGER DEFAULT NULL,
  worker_name TEXT DEFAULT NULL,
  clock_in TEXT DEFAULT NULL,
  clock_out TEXT DEFAULT NULL,
  photo_before TEXT DEFAULT NULL,
  photo_after TEXT DEFAULT NULL,
  photos_reviewed INTEGER DEFAULT 0,
  rating INTEGER DEFAULT NULL,
  review TEXT DEFAULT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS workers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  flat_rate REAL DEFAULT 25,
  created_at TEXT DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO workers (id, name, password, flat_rate)
VALUES (1, 'Team Member', '1990', 25);

CREATE TABLE IF NOT EXISTS gallery (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  before_url TEXT NOT NULL,
  after_url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  description TEXT DEFAULT '',
  amount REAL NOT NULL,
  miles REAL DEFAULT 0,
  date TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS mileage_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_id INTEGER,
  worker_name TEXT,
  date TEXT NOT NULL,
  start_reading REAL NOT NULL,
  end_reading REAL NOT NULL,
  miles REAL NOT NULL,
  deduction REAL NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
