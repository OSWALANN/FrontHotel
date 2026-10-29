CREATE SCHEMA IF NOT EXISTS hotel;

CREATE TYPE hotel.room_status AS ENUM (
  'disponible',
  'ocupado',
  'reservado',
  'inhabilitado'
);

CREATE TYPE hotel.reservation_status AS ENUM (
  'pendiente',
  'confirmada',
  'check_in',
  'check_out',
  'cancelada'
);

CREATE TYPE hotel.payment_status AS ENUM (
  'pendiente',
  'pagado',
  'reembolsado'
);

CREATE TYPE hotel.notification_type AS ENUM (
  'info',
  'warning',
  'success',
  'error'
);

CREATE TABLE hotel.app_users (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name varchar(120) NOT NULL,
  email varchar(160) NOT NULL UNIQUE,
  role varchar(40) NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE hotel.guests (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  first_name varchar(80) NOT NULL,
  last_name varchar(80) NOT NULL,
  email varchar(160),
  phone varchar(40),
  document_type varchar(40),
  document_number varchar(80),
  address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT guests_document_unique UNIQUE (document_type, document_number)
);

CREATE TABLE hotel.room_types (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name varchar(80) NOT NULL UNIQUE,
  description text,
  capacity int NOT NULL DEFAULT 1 CHECK (capacity > 0),
  base_price numeric(10, 2) NOT NULL DEFAULT 0 CHECK (base_price >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE hotel.rooms (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  room_number varchar(20) NOT NULL UNIQUE,
  room_type_id bigint NOT NULL REFERENCES hotel.room_types(id),
  status hotel.room_status NOT NULL DEFAULT 'disponible',
  floor int,
  notes text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE hotel.reservations (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  guest_id bigint NOT NULL REFERENCES hotel.guests(id),
  room_id bigint NOT NULL REFERENCES hotel.rooms(id),
  check_in date NOT NULL,
  check_out date NOT NULL,
  adults int NOT NULL DEFAULT 1 CHECK (adults > 0),
  children int NOT NULL DEFAULT 0 CHECK (children >= 0),
  status hotel.reservation_status NOT NULL DEFAULT 'pendiente',
  total_amount numeric(10, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reservation_dates_valid CHECK (check_out > check_in)
);

CREATE TABLE hotel.payments (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  reservation_id bigint NOT NULL REFERENCES hotel.reservations(id) ON DELETE CASCADE,
  amount numeric(10, 2) NOT NULL CHECK (amount > 0),
  method varchar(60) NOT NULL,
  status hotel.payment_status NOT NULL DEFAULT 'pendiente',
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE hotel.notifications (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title varchar(120) NOT NULL,
  message text NOT NULL,
  type hotel.notification_type NOT NULL DEFAULT 'info',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE hotel.settings (
  key varchar(80) PRIMARY KEY,
  value text NOT NULL,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX reservations_guest_id_idx ON hotel.reservations (guest_id);
CREATE INDEX reservations_room_id_idx ON hotel.reservations (room_id);
CREATE INDEX reservations_dates_idx ON hotel.reservations (check_in, check_out);
CREATE INDEX reservations_status_idx ON hotel.reservations (status);
CREATE INDEX rooms_status_idx ON hotel.rooms (status);
CREATE INDEX payments_reservation_id_idx ON hotel.payments (reservation_id);

CREATE OR REPLACE FUNCTION hotel.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER app_users_set_updated_at
BEFORE UPDATE ON hotel.app_users
FOR EACH ROW EXECUTE FUNCTION hotel.set_updated_at();

CREATE TRIGGER guests_set_updated_at
BEFORE UPDATE ON hotel.guests
FOR EACH ROW EXECUTE FUNCTION hotel.set_updated_at();

CREATE TRIGGER room_types_set_updated_at
BEFORE UPDATE ON hotel.room_types
FOR EACH ROW EXECUTE FUNCTION hotel.set_updated_at();

CREATE TRIGGER rooms_set_updated_at
BEFORE UPDATE ON hotel.rooms
FOR EACH ROW EXECUTE FUNCTION hotel.set_updated_at();

CREATE TRIGGER reservations_set_updated_at
BEFORE UPDATE ON hotel.reservations
FOR EACH ROW EXECUTE FUNCTION hotel.set_updated_at();

CREATE TRIGGER payments_set_updated_at
BEFORE UPDATE ON hotel.payments
FOR EACH ROW EXECUTE FUNCTION hotel.set_updated_at();

CREATE TRIGGER settings_set_updated_at
BEFORE UPDATE ON hotel.settings
FOR EACH ROW EXECUTE FUNCTION hotel.set_updated_at();

CREATE OR REPLACE VIEW hotel.room_status_counts AS
SELECT
  status,
  count(*)::int AS total
FROM hotel.rooms
GROUP BY status;

CREATE OR REPLACE VIEW hotel.reservation_summary AS
SELECT
  r.id,
  r.check_in,
  r.check_out,
  r.status,
  r.total_amount,
  g.first_name || ' ' || g.last_name AS guest_name,
  g.email AS guest_email,
  rooms.room_number,
  rt.name AS room_type
FROM hotel.reservations r
JOIN hotel.guests g ON g.id = r.guest_id
JOIN hotel.rooms rooms ON rooms.id = r.room_id
JOIN hotel.room_types rt ON rt.id = rooms.room_type_id;
