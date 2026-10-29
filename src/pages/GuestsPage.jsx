/*

 * GuestsPage.jsx

 * ----------------

 * Page for listing and searching hotel guests.

 *

 * Included functionality:

 * - Search guests by name, email, or phone.

 * - Navigate to the reservation form.

 * - Read a registration-sheet image with Tesseract OCR.

 * - Add recognized guests to the local page state.

 * - Remove a guest from the visible list.

 * - Display the same guest information as a table on desktop

 *   and as individual cards on small screens.

 *

 * Note: this component currently uses local React state and sample data.

 * It does not persist changes to a backend/database.

 */

import { useEffect, useMemo, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import { createWorker } from "tesseract.js";
import { useLanguage } from "../context/useLanguage.js";
import "../css/GuestsPage.css";
import { hotelApi } from "../services/api.js";

const createEmptyGuest = () => ({

  id: crypto.randomUUID(),

  firstName: "",

  lastName: "",

  email: "",

  phone: "",

  documentNumber: "",

  reservations: 0,

  lastReservation: "",

  sourceRow: null,

});

const normalizeText = (value = "") =>

  value.replace(/\s+/g, " ").trim();

const splitName = (fullName = "") => {

  const parts = normalizeText(fullName)

    .split(" ")

    .filter(Boolean);

  if (parts.length === 0) {

    return { firstName: "", lastName: "" };

  }

  if (parts.length === 1) {

    return {

      firstName: parts[0],

      lastName: "",

    };

  }

  return {

    firstName: parts[0],

    lastName: parts.slice(1).join(" "),

  };

};

/*

 * The registration sheet has 10 numbered rows.

 * We use OCR word coordinates to group text by the row where it appears.

 *

 * This is intentionally kept separate from ReservationPage:

 * OCR creates/updates guests only.

 */

const getRowCenters = (words, imageWidth, imageHeight) => {

  const detected = [];

  for (const word of words) {

    const text = normalizeText(word.text);

    const number = Number(text);

    if (

      Number.isInteger(number) &&

      number >= 1 &&

      number <= 10 &&

      word.bbox &&

      ((word.bbox.x0 + word.bbox.x1) / 2) <

        imageWidth * 0.22

    ) {

      detected.push({

        row: number,

        y: (word.bbox.y0 + word.bbox.y1) / 2,

        confidence: word.confidence ?? 0,

      });

    }

  }

  if (detected.length >= 2) {

    const bestByRow = new Map();

    detected.forEach((item) => {

      const current = bestByRow.get(item.row);

      if (

        !current ||

        item.confidence > current.confidence

      ) {

        bestByRow.set(item.row, item);

      }

    });

    const points = [...bestByRow.values()].map((item) => ({

      x: item.row - 1,

      y: item.y,

    }));

    const meanX =

      points.reduce((sum, point) => sum + point.x, 0) /

      points.length;

    const meanY =

      points.reduce((sum, point) => sum + point.y, 0) /

      points.length;

    let numerator = 0;

    let denominator = 0;

    points.forEach((point) => {

      numerator +=

        (point.x - meanX) * (point.y - meanY);

      denominator +=

        (point.x - meanX) ** 2;

    });

    const slope =

      denominator === 0

        ? imageHeight * 0.079

        : numerator / denominator;

    const intercept = meanY - slope * meanX;

    return Array.from(

      { length: 10 },

      (_, index) => intercept + slope * index

    );

  }

  // Fallback if OCR cannot read the row numbers.

  const firstRow = imageHeight * 0.20;

  const rowStep = imageHeight * 0.079;

  return Array.from(

    { length: 10 },

    (_, index) => firstRow + rowStep * index

  );

};

const getColumn = (x, imageWidth) => {

  const tableLeft = imageWidth * 0.14;

  const tableRight = imageWidth * 0.985;

  const relativeX = Math.min(

    Math.max(

      (x - tableLeft) /

        (tableRight - tableLeft),

      0

    ),

    1

  );

  /*

   * Approximate columns based on the registration

   * sheet shown by the user.

   */

  if (relativeX < 0.06) return "rowNumber";

  if (relativeX < 0.322) return "name";

  if (relativeX < 0.354) return "adults";

  if (relativeX < 0.383) return "children";

  if (relativeX < 0.434) return "pets";

  if (relativeX < 0.526) return "rate";

  if (relativeX < 0.618) return "advance";

  if (relativeX < 0.696) return "payment";

  if (relativeX < 0.812) return "amountToPay";

  if (relativeX < 0.864) return "vendor";

  if (relativeX < 0.934) return "vehicle";

  return "phone";

};

const wordsToText = (words) =>

  normalizeText(

    [...words]

      .sort((a, b) => a.bbox.x0 - b.bbox.x0)

      .map((word) => word.text)

      .join(" ")

  );

const groupWordsByRows = (

  words,

  imageWidth,

  imageHeight

) => {

  const rowCenters = getRowCenters(

    words,

    imageWidth,

    imageHeight

  );

  const rowHeight = imageHeight * 0.079;

  const rows = Array.from(

    { length: 10 },

    () => []

  );

  words.forEach((word) => {

    if (!word.bbox || !normalizeText(word.text)) {

      return;

    }

    const x =

      (word.bbox.x0 + word.bbox.x1) / 2;

    const y =

      (word.bbox.y0 + word.bbox.y1) / 2;

    let closestRow = 0;

    let closestDistance = Infinity;

    rowCenters.forEach((center, index) => {

      const distance = Math.abs(y - center);

      if (distance < closestDistance) {

        closestDistance = distance;

        closestRow = index;

      }

    });

    if (closestDistance > rowHeight * 0.48) {

      return;

    }

    const column = getColumn(x, imageWidth);

    if (column === "rowNumber") {

      return;

    }

    rows[closestRow].push({

      ...word,

      column,

    });

  });

  return rows;

};

const parseOCRGuests = (

  words,

  imageWidth,

  imageHeight

) => {

  const rows = groupWordsByRows(

    words,

    imageWidth,

    imageHeight

  );

  return rows

    .map((rowWords, index) => {

      const nameWords = rowWords.filter(

        (word) => word.column === "name"

      );

      const phoneWords = rowWords.filter(

        (word) => word.column === "phone"

      );

      const fullName = wordsToText(nameWords);

      const phone = wordsToText(phoneWords)

        .replace(/[^\d+]/g, "");

      if (!fullName || fullName.length < 2) {

        return null;

      }

      const name = splitName(fullName);

      return {

        ...createEmptyGuest(),

        firstName: name.firstName,

        lastName: name.lastName,

        phone,

        sourceRow: index + 1,

      };

    })

    .filter(Boolean);

};

const prepareImagesForOCR = async (file) => {
  const image = await createImageBitmap(file);
  const shouldRotate = image.height > image.width * 1.05;
  const sourceWidth = shouldRotate ? image.height : image.width;
  const sourceHeight = shouldRotate ? image.width : image.height;
  const scale = Math.min(3, 2600 / Math.max(sourceWidth, sourceHeight));
  const width = Math.round(sourceWidth * scale);
  const height = Math.round(sourceHeight * scale);
  const baseCanvas = document.createElement("canvas");
  baseCanvas.width = width;
  baseCanvas.height = height;
  const baseContext = baseCanvas.getContext("2d", { willReadFrequently: true });
  if (!baseContext) {
    image.close();
    throw new Error("Could not create canvas context.");
  }

  baseContext.imageSmoothingEnabled = true;
  baseContext.imageSmoothingQuality = "high";
  if (shouldRotate) {
    baseContext.translate(width / 2, height / 2);
    baseContext.rotate(Math.PI / 2);
    baseContext.drawImage(image, -image.width * scale / 2, -image.height * scale / 2, image.width * scale, image.height * scale);
  } else {
    baseContext.drawImage(image, 0, 0, width, height);
  }
  image.close();

  const imageData = baseContext.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const histogram = new Uint32Array(256);
  const grayscale = new Uint8Array(width * height);
  for (let pixel = 0; pixel < grayscale.length; pixel += 1) {
    const offset = pixel * 4;
    const gray = Math.round(0.299 * pixels[offset] + 0.587 * pixels[offset + 1] + 0.114 * pixels[offset + 2]);
    grayscale[pixel] = gray;
    histogram[gray] += 1;
  }

  // Otsu threshold creates a second high contrast version for faded or shadowed print.
  const total = grayscale.length;
  let weightedTotal = 0;
  for (let level = 0; level < histogram.length; level += 1) weightedTotal += level * histogram[level];
  let backgroundWeight = 0;
  let backgroundSum = 0;
  let bestVariance = -1;
  let threshold = 160;
  for (let level = 0; level < histogram.length; level += 1) {
    backgroundWeight += histogram[level];
    if (!backgroundWeight) continue;
    const foregroundWeight = total - backgroundWeight;
    if (!foregroundWeight) break;
    backgroundSum += level * histogram[level];
    const backgroundMean = backgroundSum / backgroundWeight;
    const foregroundMean = (weightedTotal - backgroundSum) / foregroundWeight;
    const variance = backgroundWeight * foregroundWeight * (backgroundMean - foregroundMean) ** 2;
    if (variance > bestVariance) {
      bestVariance = variance;
      threshold = level;
    }
  }

  const cleanCanvas = document.createElement("canvas");
  cleanCanvas.width = width;
  cleanCanvas.height = height;
  const cleanContext = cleanCanvas.getContext("2d");
  const binaryCanvas = document.createElement("canvas");
  binaryCanvas.width = width;
  binaryCanvas.height = height;
  const binaryContext = binaryCanvas.getContext("2d");
  if (!cleanContext || !binaryContext) throw new Error("Could not prepare image canvases.");
  const cleanData = cleanContext.createImageData(width, height);
  const binaryData = binaryContext.createImageData(width, height);
  for (let pixel = 0; pixel < grayscale.length; pixel += 1) {
    const source = grayscale[pixel];
    const contrast = Math.max(0, Math.min(255, Math.round((source - 128) * 1.45 + 128)));
    const cleanValue = Math.max(0, Math.min(255, Math.round((contrast - threshold) * 1.18 + 168)));
    const binaryValue = source < threshold ? 0 : 255;
    const offset = pixel * 4;
    for (let channel = 0; channel < 3; channel += 1) {
      cleanData.data[offset + channel] = cleanValue;
      binaryData.data[offset + channel] = binaryValue;
    }
    cleanData.data[offset + 3] = 255;
    binaryData.data[offset + 3] = 255;
  }
  cleanContext.putImageData(cleanData, 0, 0);
  binaryContext.putImageData(binaryData, 0, 0);

  const toBlob = (canvas) => new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not prepare image.")), "image/png");
  });
  return {
    variants: [await toBlob(cleanCanvas), await toBlob(binaryCanvas)],
    width,
    height,
  };
};

// Main page component. It owns the guest list, search, and OCR interaction.

function GuestsPage() {
  const { t } = useLanguage();

  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  // Search input value; used to derive filteredGuests below.

  const [search, setSearch] = useState("");

  // Guest records shown by this page. The initial values are demonstration data.

  const [guests, setGuests] = useState([]);
  const loadGuests = async () => {
    try {
      const result = await hotelApi.guests.list();
      setGuests((Array.isArray(result) ? result : result.items || []).map((guest) => ({
        ...guest,
        firstName: guest.firstName ?? guest.first_name ?? "",
        lastName: guest.lastName ?? guest.last_name ?? "",
        documentNumber: guest.documentNumber ?? guest.document_number ?? "",
        reservations: guest.reservations ?? guest.reservationCount ?? 0,
        lastReservation: guest.lastReservation ?? "",
      })));
    } catch (error) { alert(error.message); }
  };
  useEffect(() => { loadGuests(); }, []);

  const [selectedFile, setSelectedFile] =

    useState(null);

  const [ocrText, setOcrText] = useState("");

  const [ocrLoading, setOcrLoading] =

    useState(false);

  // Recalculate the visible list only when the search term or guest list changes.

  const filteredGuests = useMemo(() => {

    const normalizeSearch = (text = "") => text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    const value = normalizeSearch(search.trim());

    if (!value) {

      return guests;

    }

    return guests.filter((guest) => {

      const fullName = normalizeSearch(`${guest.firstName} ${guest.lastName}`);

      return (

        fullName.includes(value) ||

        normalizeSearch(guest.email).includes(value) ||
        normalizeSearch(guest.phone).includes(value) ||
        normalizeSearch(guest.documentNumber).includes(value)

      );

    });

  }, [search, guests]);

  const handleNewReservation = () => {

    navigate("/reservation");

  };

  const handleFileSelect = (event) => {

    const file = event.target.files?.[0];

    if (!file) {

      return;

    }

    if (!file.type.startsWith("image/")) {

      alert(t("selectImage"));

      return;

    }

    setSelectedFile(file);

    setOcrText("");

  };

  // Run OCR against the selected registration-sheet image and add detected guests.

  const runOCR = async () => {

    if (!selectedFile) {

      alert(

        t("selectRegistrationSheet")

      );

      return;

    }

    let worker = null;

    try {

      setOcrLoading(true);

      setOcrText("");

      const prepared = await prepareImagesForOCR(selectedFile);
      worker = await createWorker("spa+eng");
      await worker.setParameters({
        tessedit_pageseg_mode: "6",
        preserve_interword_spaces: "1",
      });

      let bestResult = null;
      let detectedGuests = [];
      let bestScore = -1;
      for (const variant of prepared.variants) {
        const result = await worker.recognize(variant, {}, { blocks: true });
        const words = result.data.words || [];
        const guestsFromVariant = parseOCRGuests(
          words,
          prepared.width,
          prepared.height
        );
        const score = guestsFromVariant.length * 1000 + (result.data.confidence || 0);
        if (score > bestScore) {
          bestScore = score;
          bestResult = result;
          detectedGuests = guestsFromVariant;
        }
      }

      const text = bestResult?.data.text || "";
      const words = bestResult?.data.words || [];

      setOcrText(text);

      if (!words.length) {

        alert(

          t("ocrNoWordPositions")

        );

        return;

      }

      if (!detectedGuests.length) {

        alert(

          t("ocrNoGuests")

        );

        return;

      }

      /*

       * OCR records are added to the existing guest list.

       * We do not create reservations here.

       */

      for (const guest of detectedGuests) {
        await hotelApi.guests.create({ firstName: guest.firstName, lastName: guest.lastName, phone: guest.phone, email: guest.email, documentNumber: guest.documentNumber });
      }
      await loadGuests();

      alert(t("ocrDetectedCount").replace("{count}", detectedGuests.length));

    } catch (error) {

      console.error(

        "Guest OCR error:",

        error

      );

      alert(

        t("ocrFailed")

      );

    } finally {

      if (worker) {

        await worker.terminate();

      }

      setOcrLoading(false);

    }

  };

  // Update one field on a guest. Kept available for future edit controls.

  const updateGuest = (

    id,

    field,

    value

  ) => {

    const guest = guests.find((item) => item.id === id);
    if (!guest) return;
    const updated = { ...guest, [field]: value };
    hotelApi.guests.update(id, updated).then(loadGuests).catch((error) => alert(error.message));

  };

  // Remove a guest from the local React state.

  const removeGuest = (id) => {

    hotelApi.guests.remove(id).then(loadGuests).catch((error) => alert(error.message));

  };

  return (

    <div className="guests-page">

      {/* =========================

          HEADER

      \========================== */}

      <div className="guests-header">

        <div>

          <h1>{t("guests")}</h1>

          <p>

            {t("manageGuests")}

          </p>

        </div>

        <div

          style={{

            display: "flex",

            gap: "10px",

            flexWrap: "wrap",

          }}

        >

          <input

            ref={fileInputRef}

            type="file"

            accept="image/*"

            hidden

            onChange={handleFileSelect}

          />

          <button

            type="button"

            className="guests-primary-button"

            onClick={() =>

              fileInputRef.current?.click()

            }

          >

            <i className="bx bx-image-add" />

            {t("importDailySheet")}

          </button>

          <button

            type="button"

            className="guests-primary-button"

            onClick={

              handleNewReservation

            }

          >

            <i className="bx bx-calendar-plus" />

            {t("newReservation")}

          </button>

        </div>

      </div>

      {/* =========================

          OCR

      \========================== */}

      {selectedFile && (

        <section

          className="guests-table-card"

          style={{

            marginBottom: "20px",

            padding: "20px",

          }}

        >

          <div>

            <strong>

              {t("dailyRegistrationSheet")}

            </strong>

            <p

              style={{

                margin: "6px 0",

                color:

                  "var(--color-text-secondary)",

              }}

            >

              {selectedFile.name}

            </p>

            <p

              style={{

                margin: 0,

                fontSize: "14px",

                color:

                  "var(--color-text-secondary)",

              }}

            >

              OCR will detect occupied rows and

              add the guests to this list. It will

              not create reservations.

            </p>

          </div>

          <button

            type="button"

            className="guests-primary-button"

            onClick={runOCR}

            disabled={ocrLoading}

            style={{

              marginTop: "12px",

            }}

          >

            <i className="bx bx-scan" />

            {ocrLoading

              ? t("readingSheet")

              : t("extractGuests")}

          </button>

          {ocrText && (

            <details

              style={{

                marginTop: "15px",

              }}

            >

              <summary>

                {t("viewRawOcr")}

              </summary>

              <textarea

                value={ocrText}

                readOnly

                rows={8}

                style={{

                  width: "100%",

                  marginTop: "10px",

                  resize: "vertical",

                }}

              />

            </details>

          )}

        </section>

      )}

      {/* =========================

          SEARCH

      \========================== */}

      <section className="guests-toolbar">

        <div className="guests-search">

          <i className="bx bx-search" />

          <input

            type="text"

            placeholder={t("searchGuest")}

            value={search}

            onChange={(event) =>

              setSearch(event.target.value)

            }

          />

        </div>

        <span className="guests-count">

          {filteredGuests.length} {t("guestsCount")}

        </span>

      </section>

      {/* =========================

          GUESTS TABLE

      \========================== */}

      <section className="guests-table-card">

        {/* Mobile layout: cards are easier to read than six compressed columns. */}

        <div className="guests-mobile-list">

          {filteredGuests.length > 0 ? (

            filteredGuests.map((guest) => (

              <article className="guest-mobile-card" key={`mobile-${guest.id}`}>

                {/* Guest identity and initials. */}

                <div className="guest-mobile-card__header">

                  <div className="guest-avatar">

                    {guest.firstName.charAt(0)}

                    {guest.lastName.charAt(0)}

                  </div>

                  <div className="guest-mobile-card__identity">

                    <strong>

                      {guest.firstName} {guest.lastName}

                    </strong>

                    <span>{guest.email || t("noEmailProvided")}</span>

                  </div>

                </div>

                {/* Contact and reservation details. */}

                <dl className="guest-mobile-card__details">

                  <div>

                    <dt>{t("phone")}</dt>

                    <dd>{guest.phone || "—"}</dd>

                  </div>

                  <div>

                    <dt>{t("reservations")}</dt>

                    <dd>{guest.reservations ?? 0}</dd>

                  </div>

                  <div>

                    <dt>{t("lastReservation")}</dt>

                    <dd>{guest.lastReservation || "—"}</dd>

                  </div>

                </dl>

                {/* Show the source row when the guest came from OCR. */}

                {guest.sourceRow && (

                  <p className="guest-mobile-card__source">

                    {t("importedFromRow")} {guest.sourceRow}

                  </p>

                )}

                {/* Remove this guest from the current page state. */}

                <button

                  type="button"

                  className="guests-primary-button guest-mobile-card__remove"

                  onClick={() => removeGuest(guest.id)}

                >

                  {t("removeGuest")}

                </button>

              </article>

            ))

          ) : (

            <p className="guests-empty guests-mobile-empty">

              {t("noGuestsFound")}

            </p>

          )}

        </div>

        {/* Desktop layout: retain the existing full-width data table. */}

        <div className="guests-table-wrapper">

          <table className="guests-table">

            <thead>

              <tr>

                <th>{t("guest")}</th>

                <th>{t("email")}</th>

                <th>{t("phone")}</th>

                <th>{t("reservations")}</th>

                <th>{t("lastReservation")}</th>

                <th>{t("actions")}</th>

              </tr>

            </thead>

            <tbody>

              {filteredGuests.length > 0 ? (

                filteredGuests.map(

                  (guest) => (

                    <tr key={guest.id}>

                      <td>

                        <div className="guest-name">

                          <div className="guest-avatar">

                            {guest.firstName.charAt(

                              0

                            )}

                            {guest.lastName.charAt(

                              0

                            )}

                          </div>

                          <div>

                            <span>

                              {guest.firstName}{" "}

                              {guest.lastName}

                            </span>

                            {guest.sourceRow && (

                              <small

                                style={{

                                  display:

                                    "block",

                                  opacity: 0.6,

                                }}

                              >

                                {t("importedFromRow")}{" "}

                                {

                                  guest.sourceRow

                                }

                              </small>

                            )}

                          </div>

                        </div>

                      </td>

                      <td>

                        {guest.email || "—"}

                      </td>

                      <td>

                        {guest.phone || "—"}

                      </td>

                      <td>

                        <span className="guest-reservation-badge">

                          {guest.reservations ??

                            0}

                        </span>

                      </td>

                      <td>

                        {guest.lastReservation ||

                          "—"}

                      </td>

                      <td>

                        <button

                          type="button"

                          className="guests-primary-button"

                          onClick={() =>

                            removeGuest(

                              guest.id

                            )

                          }

                        >

                          {t("remove")}

                        </button>

                      </td>

                    </tr>

                  )

                )

              ) : (

                <tr>

                  <td

                    colSpan="6"

                    className="guests-empty"

                  >

                    {t("noGuestsFound")}

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>

  );

}

export default GuestsPage;
