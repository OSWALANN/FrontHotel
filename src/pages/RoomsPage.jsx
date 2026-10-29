import { useEffect, useState } from "react";
import { useLanguage } from "../context/useLanguage.js";

import { roomStatuses } from "../data/hotelData.js";
import { hotelApi } from "../services/api.js";



function RoomsPage() {
  const { t } = useLanguage();

  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loadError, setLoadError] = useState("");
  const loadRooms = async () => {
    try {
      const result = await hotelApi.rooms.list();
      setRooms(Array.isArray(result) ? result : result.items || []);
      setLoadError("");
    } catch (error) { setLoadError(error.message); }
  };
  useEffect(() => { loadRooms(); }, []);
  useEffect(() => {
    hotelApi.roomTypes().then((result) => setRoomTypes(Array.isArray(result) ? result : result.items || [])).catch((error) => setLoadError(error.message));
  }, []);



  const [search, setSearch] = useState("");



  const [showModal, setShowModal] = useState(false);

  const [editingRoom, setEditingRoom] = useState(null);



  const [formData, setFormData] = useState({

    name: "",
    roomTypeId: "",

    image: "",

    description: "",

    status: "disponible",

  });



  // =========================

  // SEARCH

  // =========================



  const normalizeSearchText = (value = "") =>
    value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const normalizedSearch = normalizeSearchText(search.trim());
  const filteredRooms = rooms.filter((room) => {
    const statusLabel = roomStatuses.find(
      (status) => status.className === room.status
    )?.label || "";
    return [room.name, room.description, room.status, t(statusLabel)]
      .some((value) => normalizeSearchText(value).includes(normalizedSearch));
  });



  // =========================

  // OPEN ADD

  // =========================



  const handleAddRoom = () => {

    setEditingRoom(null);



    setFormData({

      name: "",
      roomTypeId: roomTypes[0]?.id || "",

      image: "",

      description: "",

      status: "disponible",

    });



    setShowModal(true);

  };



  // =========================

  // OPEN EDIT

  // =========================



  const handleEditRoom = (room) => {

    setEditingRoom(room);



    setFormData({

      name: room.name || "",
      roomTypeId: room.roomTypeId || "",

      image: room.image || "",

      description: room.description || "",

      status: room.status || "disponible",

    });



    setShowModal(true);

  };



  // =========================

  // DELETE

  // =========================



  const handleDeleteRoom = async (room) => {

    const confirmed = window.confirm(

      `¿Deseas eliminar ${room.name}?`

    );



    if (!confirmed) {

      return;

    }



    try { await hotelApi.rooms.remove(room.id); await loadRooms(); }
    catch (error) { alert(error.message); }

  };



  // =========================

  // FORM CHANGE

  // =========================



  const handleChange = (event) => {

    const { name, value } = event.target;



    setFormData((current) => ({

      ...current,

      [name]: value,

    }));

  };



  // =========================

  // SAVE ROOM

  // =========================



  const handleSubmit = async (event) => {

    event.preventDefault();



    if (!formData.name.trim()) {

      alert(t("roomNameRequired"));

      return;

    }



    try {
      const payload = { name: formData.name.trim(), roomTypeId: Number(formData.roomTypeId), image: formData.image, description: formData.description, status: formData.status };
      if (editingRoom) await hotelApi.rooms.update(editingRoom.id, payload);
      else await hotelApi.rooms.create(payload);
      await loadRooms();
      setShowModal(false);
      setEditingRoom(null);
    } catch (error) { alert(error.message); }

  };



  return (

    <>

      {/* =========================

          HEADER

      ========================== */}



      <section className="tablas">



        <div className="search-content">

          <i className="bx bx-search" />



          <input

            type="search"

            placeholder={t("searchRooms")}

            value={search}

            onChange={(event) =>

              setSearch(event.target.value)

            }

          />

        </div>



        <div className="card-estado">
        <div className="estado-heading">
          <h3>{t("roomStatusTitle")}</h3>
          <span>{rooms.length} {t("roomsTotal")}</span>
        </div>

        <div className="estados">
          {roomStatuses.map((status) => {
            const statusKey = {
              disponible: "disponible",
              ocupado: "ocupado",
              reservado: "reservado",
              inhabilitado: "inhabilitado",
            }[status.key || status.status || status.className] || status.className;

            const count = rooms.filter((room) => room.status === statusKey).length;

            return (
              <div className={`estado ${status.className || ""}`} key={status.label}>
                <div className={`icono ${status.className || ""}`}>
                  {status.symbol}
                </div>
                <div className="estado-copy">
                  <span>{t(status.label)}</span>
                  <h2>{count}</h2>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>



      {/* =========================

          ROOMS

      ========================== */}



      {loadError && <p role="alert">{loadError}</p>}
      <section className="rooms-grid">



        {filteredRooms.map((room) => (

          <article

            className="room-card"

            key={room.id}

          >



            {/* IMAGE */}



            <div className="room-image-container">



              <img

                src={room.image}

                alt={room.name}

              />



              {/* ACTIONS */}



              <div className="room-actions">



                <button

                  type="button"

                  className="room-action-button room-edit-button"

                  onClick={() =>

                    handleEditRoom(room)

                  }

                  title={t("editRoom")}

                >

                  <i className="bx bx-pencil" />

                </button>



                <button

                  type="button"

                  className="room-action-button room-delete-button"

                  onClick={() =>

                    handleDeleteRoom(room)

                  }

                  title={t("deleteRoom")}

                >

                  <i className="bx bx-x" />

                </button>



              </div>



            </div>



            {/* INFO */}



            <div className="room-info">



              <div className="room-title">



                <h2>

                  {room.name.replace(/^Room\s+/i, `${t("roomLabel")} `)}

                </h2>



                <span

                  className={`room-status ${

                    room.status || "disponible"

                  }`}

                >

                  {room.status ===

                  "ocupado"

                    ? t("occupied")

                    : room.status ===

                      "reservado"

                    ? t("reserved")

                    : room.status ===

                      "inhabilitado"

                    ? t("disabled")

                    : t("available")}

                </span>



              </div>



              <p>

                {room.description ||

                  t("roomAvailableDescription")}

              </p>



            </div>



          </article>

        ))}



        {/* =========================

            ADD ROOM CARD

        ========================== */}



        <button

          type="button"

          className="room-add-card"

          onClick={handleAddRoom}

        >

          <div className="room-add-icon">

            <i className="bx bx-plus" />

          </div>



          <strong>

            {t("addNewRoom")}

          </strong>



          <span>

            {t("createHotelRoom")}

          </span>

        </button>



      </section>



      {/* =========================

          MODAL

      ========================== */}



      {showModal && (

        <div

          className="room-modal-overlay"

          onMouseDown={(event) => {

            if (

              event.target ===

              event.currentTarget

            ) {

              setShowModal(false);

            }

          }}

        >



          <div className="room-modal">



            {/* HEADER */}



            <div className="room-modal-header">



              <div>

                <span className="room-modal-label">

                  {t("roomManagement")}

                </span>



                <h2>

                  {editingRoom

                    ? t("editRoom")

                    : t("addNewRoom")}

                </h2>



                <p>

                  {editingRoom

                    ? t("updateRoomInfo")

                    : t("addRoomDescription")}

                </p>

              </div>



              <button

                type="button"

                className="room-modal-close"

                onClick={() =>

                  setShowModal(false)

                }

              >

                <i className="bx bx-x" />

              </button>



            </div>



            {/* FORM */}



            <form

              className="room-modal-form"

              onSubmit={handleSubmit}

            >



              <div className="room-form-group">



                <label htmlFor="name">

                  {t("roomFormRoomName")}

                </label>



                <input

                  id="name"

                  name="name"

                  type="text"

                  placeholder={`${t("roomLabel")} 101`}

                  value={formData.name}

                  onChange={handleChange}

                  required

                />



              </div>



              <div className="room-form-group">
                <label htmlFor="roomTypeId">Tipo de habitación</label>
                <select id="roomTypeId" name="roomTypeId" value={formData.roomTypeId} onChange={handleChange} required>
                  <option value="">Selecciona tipo</option>
                  {roomTypes.map((type) => <option key={type.id} value={type.id}>{type.name} · {type.capacity} huéspedes · ${type.basePrice ?? type.base_price}</option>)}
                </select>
              </div>

              <div className="room-form-group">



                <label htmlFor="image">

                  {t("imageUrl")}

                </label>



                <input

                  id="image"

                  name="image"

                  type="url"

                  placeholder="https\://..."

                  value={formData.image}

                  onChange={handleChange}

                />



              </div>



              <div className="room-form-group">



                <label htmlFor="description">

                  {t("description")}

                </label>



                <textarea

                  id="description"

                  name="description"

                  placeholder={t("roomPlaceholderDescription")}

                  rows="4"

                  value={

                    formData.description

                  }

                  onChange={handleChange}

                />



              </div>



              <div className="room-form-group">



                <label htmlFor="status">

                  {t("status")}

                </label>



                <select

                  id="status"

                  name="status"

                  value={formData.status}

                  onChange={handleChange}

                >

                  <option value="disponible">

                    {t("available")}

                  </option>



                  <option value="ocupado">

                    {t("occupied")}

                  </option>



                  <option value="reservado">

                    {t("reserved")}

                  </option>



                  <option value="inhabilitado">

                    {t("disabled")}

                  </option>

                </select>



              </div>



              {/* PREVIEW */}



              {formData.image && (

                <div className="room-preview">



                  <img

                    src={formData.image}

                    alt={t("roomPreview")}

                  />



                </div>

              )}



              {/* ACTIONS */}



              <div className="room-modal-actions">



                <button

                  type="button"

                  className="room-cancel-button"

                  onClick={() =>

                    setShowModal(false)

                  }

                >

                  {t("cancel")}

                </button>



                <button

                  type="submit"

                  className="room-save-button"

                >

                  <i className="bx bx-save" />



                  {editingRoom

                    ? t("saveChanges")

                    : t("createRoom")}

                </button>



              </div>



            </form>



          </div>



        </div>

      )}

    </>

  );

}



export default RoomsPage;
