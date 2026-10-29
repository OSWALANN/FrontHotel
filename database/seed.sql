INSERT INTO hotel.app_users (full_name, email, role)
VALUES ('Oswal Marin', 'oswalmarin56@gmail.com', 'admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO hotel.room_types (name, description, capacity, base_price)
VALUES
  ('Individual', 'Habitacion para una persona', 1, 750.00),
  ('Doble', 'Habitacion para dos personas', 2, 1200.00),
  ('Suite', 'Habitacion premium con mas espacio', 4, 2200.00)
ON CONFLICT (name) DO NOTHING;

INSERT INTO hotel.rooms (room_number, room_type_id, status, floor, notes)
VALUES
  ('1', (SELECT id FROM hotel.room_types WHERE name = 'Individual'), 'disponible', 1, 'Habitacion base'),
  ('2', (SELECT id FROM hotel.room_types WHERE name = 'Doble'), 'disponible', 1, 'Habitacion base'),
  ('3', (SELECT id FROM hotel.room_types WHERE name = 'Suite'), 'disponible', 1, 'Habitacion base'),
  ('4', (SELECT id FROM hotel.room_types WHERE name = 'Individual'), 'disponible', 2, 'Habitacion base'),
  ('5', (SELECT id FROM hotel.room_types WHERE name = 'Doble'), 'disponible', 2, 'Habitacion base'),
  ('6', (SELECT id FROM hotel.room_types WHERE name = 'Doble'), 'disponible', 2, 'Habitacion base'),
  ('7', (SELECT id FROM hotel.room_types WHERE name = 'Suite'), 'reservado', 3, 'Reservada para muestra'),
  ('8', (SELECT id FROM hotel.room_types WHERE name = 'Individual'), 'reservado', 3, 'Reservada para muestra'),
  ('9', (SELECT id FROM hotel.room_types WHERE name = 'Doble'), 'ocupado', 3, 'Ocupada para muestra'),
  ('10', (SELECT id FROM hotel.room_types WHERE name = 'Suite'), 'inhabilitado', 4, 'Mantenimiento')
ON CONFLICT (room_number) DO NOTHING;

INSERT INTO hotel.guests (first_name, last_name, email, phone, document_type, document_number)
VALUES
  ('Ana', 'Lopez', 'ana.lopez@example.com', '555-100-2000', 'INE', 'ANA100200'),
  ('Carlos', 'Perez', 'carlos.perez@example.com', '555-300-4000', 'INE', 'CAR300400')
ON CONFLICT (document_type, document_number) DO NOTHING;

INSERT INTO hotel.reservations (guest_id, room_id, check_in, check_out, adults, children, status, total_amount, notes)
VALUES
  (
    (SELECT id FROM hotel.guests WHERE email = 'ana.lopez@example.com'),
    (SELECT id FROM hotel.rooms WHERE room_number = '7'),
    current_date + 1,
    current_date + 3,
    2,
    0,
    'confirmada',
    4400.00,
    'Reserva de ejemplo'
  ),
  (
    (SELECT id FROM hotel.guests WHERE email = 'carlos.perez@example.com'),
    (SELECT id FROM hotel.rooms WHERE room_number = '9'),
    current_date - 1,
    current_date + 1,
    1,
    0,
    'check_in',
    2400.00,
    'Huesped actualmente hospedado'
  );

INSERT INTO hotel.payments (reservation_id, amount, method, status, paid_at)
SELECT id, total_amount, 'tarjeta', 'pagado', now()
FROM hotel.reservations
WHERE status IN ('confirmada', 'check_in');

INSERT INTO hotel.notifications (title, message, type)
VALUES
  ('Reserva confirmada', 'La habitacion 7 tiene una reserva confirmada.', 'success'),
  ('Mantenimiento pendiente', 'La habitacion 10 esta inhabilitada.', 'warning');

INSERT INTO hotel.settings (key, value, description)
VALUES
  ('hotel_name', 'Diana Cazadora', 'Nombre visible del hotel'),
  ('currency', 'MXN', 'Moneda usada para precios y pagos'),
  ('check_in_time', '15:00', 'Hora sugerida de entrada'),
  ('check_out_time', '12:00', 'Hora sugerida de salida')
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = now();
