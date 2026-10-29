import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../context/useLanguage.js";
import { hotelApi } from "../services/api.js";

function ReservationPage() {
  const { t, language } = useLanguage();
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    hotelApi.rooms.list().then((items) => setRooms(Array.isArray(items) ? items : items.items || []))
      .catch((requestError) => setError(requestError.message));
  }, []);
  const [guest, setGuest] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    documentNumber: "",
  });

  const [reservation, setReservation] = useState({
    roomId: "",
    checkIn: "",
    checkOut: "",
    adults: 1,
    children: 0,
    pets: 0,
    vehiclePlate: "",
    paymentMethod: "Efectivo",
    notes: "",
  });

  const selectedRoom = useMemo(
    () => rooms.find((room) => String(room.id) === String(reservation.roomId)),
    [reservation.roomId]
  );

  const nights = useMemo(() => {
    if (!reservation.checkIn || !reservation.checkOut) return 0;

    const checkIn = new Date(`${reservation.checkIn}T00:00:00`);
    const checkOut = new Date(`${reservation.checkOut}T00:00:00`);
    const difference = checkOut.getTime() - checkIn.getTime();

    if (difference <= 0) return 0;

    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  }, [reservation.checkIn, reservation.checkOut]);

  const total = selectedRoom ? nights * selectedRoom.price : 0;

  const handleGuestChange = (event) => {
    const { name, value } = event.target;

    setGuest((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleReservationChange = (event) => {
    const { name, value } = event.target;

    setReservation((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const increment = (field) => {
    setReservation((current) => ({
      ...current,
      [field]: Number(current[field]) + 1,
    }));
  };

  const decrement = (field, minimum = 0) => {
    setReservation((current) => ({
      ...current,
      [field]: Math.max(minimum, Number(current[field]) - 1),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!guest.firstName.trim() || !guest.lastName.trim()) {
      alert(t("reservationNameRequired"));
      return;
    }

    if (!reservation.roomId) {
      alert(t("reservationRoomRequired"));
      return;
    }

    if (!reservation.checkIn || !reservation.checkOut) {
      alert(t("reservationDatesRequired"));
      return;
    }

    if (nights <= 0) {
      alert(t("checkoutMustFollowCheckin"));
      return;
    }

    if (
      Number(reservation.adults) + Number(reservation.children) >
      selectedRoom.capacity
    ) {
      alert(t("roomCapacityMessage").replace("{capacity}", selectedRoom.capacity));
      return;
    }

    const payload = {
      guest: {
        firstName: guest.firstName.trim(),
        lastName: guest.lastName.trim(),
        email: guest.email.trim(),
        phone: guest.phone.trim(),
        documentNumber: guest.documentNumber.trim(),
      },
      reservation: {
        roomId: Number(reservation.roomId),
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        adults: Number(reservation.adults),
        children: Number(reservation.children),
        pets: Number(reservation.pets),
        vehiclePlate: reservation.vehiclePlate.trim(),
        paymentMethod: reservation.paymentMethod,
        notes: reservation.notes.trim(),
        nights,
        total,
      },
    };

    setSaving(true);
    try {
      await hotelApi.reservations.create(payload);
      alert(t("reservationPrepared"));
      setGuest({ firstName: "", lastName: "", email: "", phone: "", documentNumber: "" });
      setReservation({ roomId: "", checkIn: "", checkOut: "", adults: 1, children: 0, pets: 0, vehiclePlate: "", paymentMethod: "Efectivo", notes: "" });
      setError("");
    } catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  };

  return (
    <>
      <div className="reservation-header">
        <h1>{t("newReservation")}</h1>
        <p>{t("reservationPageDescription")}</p>
      </div>

      {error && <p role="alert">{error}</p>}
      <form className="reservation-container" onSubmit={handleSubmit}>
        {/* =========================
            GUEST INFORMATION
        ========================== */}
        <div
          className="reservation-field"
          style={{ gridColumn: "1 / -1" }}
        >
          <label>{t("guestInformation")}</label>
          <p
            style={{
              margin: "5px 0 0",
              color: "var(--color-text-secondary)",
              fontSize: "14px",
            }}
          >
            {t("enterGuestInformation")}
          </p>
        </div>

        <div className="reservation-field">
          <label htmlFor="firstName">{t("firstName")}</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={guest.firstName}
            onChange={handleGuestChange}
            placeholder={t("enterFirstName")}
            required
          />
        </div>

        <div className="reservation-field">
          <label htmlFor="lastName">{t("lastName")}</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={guest.lastName}
            onChange={handleGuestChange}
            placeholder={t("enterLastName")}
            required
          />
        </div>

        <div className="reservation-field">
          <label htmlFor="email">{t("email")}</label>
          <input
            id="email"
            name="email"
            type="email"
            value={guest.email}
            onChange={handleGuestChange}
            placeholder="guest@example.com"
          />
        </div>

        <div className="reservation-field">
          <label htmlFor="phone">{t("phone")}</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={guest.phone}
            onChange={handleGuestChange}
            placeholder={t("enterPhone")}
          />
        </div>

        <div className="reservation-field">
          <label htmlFor="documentNumber">{t("documentNumber")}</label>
          <input
            id="documentNumber"
            name="documentNumber"
            type="text"
            value={guest.documentNumber}
            onChange={handleGuestChange}
            placeholder={t("idPassport")}
          />
        </div>

        {/* =========================
            ROOM
        ========================== */}
        <div
          className="reservation-field"
          style={{ gridColumn: "1 / -1" }}
        >
          <label>{t("room")}</label>
        </div>

        <div className="reservation-field">
          <label htmlFor="roomId">{t("room")}</label>
          <select
            id="roomId"
            name="roomId"
            value={reservation.roomId}
            onChange={handleReservationChange}
            required
          >
            <option value="">{t("selectRoom")}</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {t("roomLabel")} {room.number ?? room.name} — {t(`roomType${room.type}`)} — $
                {room.price.toLocaleString(language === "Spanish" ? "es-MX" : "en-US")}/{t("perNight")}
              </option>
            ))}
          </select>
        </div>

        {selectedRoom && (
          <div
            className="reservation-field"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <span>
              {t("capacity")} {selectedRoom.capacity} {t("guests")}
            </span>
            <strong>
              ${selectedRoom.price.toLocaleString(language === "Spanish" ? "es-MX" : "en-US")} / {t("perNight")}
            </strong>
          </div>
        )}

        {/* =========================
            DATES
        ========================== */}
        <div className="reservation-field">
          <label htmlFor="checkIn">{t("checkIn")}</label>
          <input
            id="checkIn"
            name="checkIn"
            type="date"
            value={reservation.checkIn}
            onChange={handleReservationChange}
            required
          />
        </div>

        <div className="reservation-field">
          <label htmlFor="checkOut">{t("checkOut")}</label>
          <input
            id="checkOut"
            name="checkOut"
            type="date"
            value={reservation.checkOut}
            onChange={handleReservationChange}
            required
          />
        </div>

        {/* =========================
            OCCUPANCY
        ========================== */}
        <div className="reservation-field">
          <label>{t("adults")}</label>
          <div className="number-selector">
            <button
              type="button"
              onClick={() => decrement("adults", 1)}
            >
              −
            </button>
            <span>{reservation.adults}</span>
            <button type="button" onClick={() => increment("adults")}>
              +
            </button>
          </div>
        </div>

        <div className="reservation-field">
          <label>{t("children")}</label>
          <div className="number-selector">
            <button
              type="button"
              onClick={() => decrement("children", 0)}
            >
              −
            </button>
            <span>{reservation.children}</span>
            <button type="button" onClick={() => increment("children")}>
              +
            </button>
          </div>
        </div>

        <div className="reservation-field">
          <label>{t("pets")}</label>
          <div className="number-selector">
            <button type="button" onClick={() => decrement("pets", 0)}>
              −
            </button>
            <span>{reservation.pets}</span>
            <button type="button" onClick={() => increment("pets")}>
              +
            </button>
          </div>
        </div>

        {/* =========================
            VEHICLE / PAYMENT
        ========================== */}
        <div className="reservation-field">
          <label htmlFor="vehiclePlate">{t("vehiclePlate")}</label>
          <input
            id="vehiclePlate"
            name="vehiclePlate"
            type="text"
            value={reservation.vehiclePlate}
            onChange={handleReservationChange}
            placeholder="ABC-123"
          />
        </div>

        <div className="reservation-field">
          <label htmlFor="paymentMethod">{t("paymentMethod")}</label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={reservation.paymentMethod}
            onChange={handleReservationChange}
          >
            <option value="Efectivo">{t("cash")}</option>
            <option value="Tarjeta">{t("card")}</option>
            <option value="Transferencia">{t("transfer")}</option>
          </select>
        </div>

        <div
          className="reservation-field"
          style={{ gridColumn: "1 / -1" }}
        >
          <label htmlFor="notes">{t("notes")}</label>
          <textarea
            id="notes"
            name="notes"
            value={reservation.notes}
            onChange={handleReservationChange}
            placeholder={t("additionalInformation")}
            rows="4"
          />
        </div>

        {/* =========================
            SUMMARY
        ========================== */}
        <div
          className="reservation-summary"
          style={{ gridColumn: "1 / -1" }}
        >
          <h3>{t("reservationSummary")}</h3>

          <div className="reservation-summary-row">
            <span>{t("guest")}</span>
            <strong>
              {guest.firstName || guest.lastName
                ? `${guest.firstName} ${guest.lastName}`.trim()
                : t("notRegistered")}
            </strong>
          </div>

          <div className="reservation-summary-row">
            <span>{t("room")}</span>
            <strong>
              {selectedRoom
                ? `${t("roomLabel")} ${selectedRoom.number}`
                : t("notSelected")}
            </strong>
          </div>

          <div className="reservation-summary-row">
            <span>{t("nights")}</span>
            <strong>{nights}</strong>
          </div>

          <div className="reservation-summary-row">
            <span>Total</span>
            <strong>${total.toLocaleString(language === "Spanish" ? "es-MX" : "en-US")}</strong>
          </div>
        </div>

        <div
          className="reservation-actions"
          style={{ gridColumn: "1 / -1" }}
        >
          <button type="submit" className="reservation-button" disabled={saving}>
            {t("createReservation")}
          </button>
        </div>
      </form>
    </>
  );
}

export default ReservationPage;
