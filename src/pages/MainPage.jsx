import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/useLanguage.js";
import { hotelApi } from "../services/api.js";



function MainPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [dashboard, setDashboard] = useState({});
  useEffect(() => { hotelApi.dashboard().then(setDashboard).catch(() => {}); }, []);



  const stats = [

    {

      title: t("rooms"),

      value: dashboard.roomsTotal ?? 0,

      description: t("totalRooms"),

      icon: "bx-bed",

      className: "main-stat-blue",

    },

    {

      title: t("occupancy"),

      value: `${dashboard.occupancyPercent ?? 0}%`,

      description: t("currentOccupancy"),

      icon: "bx-bar-chart-alt-2",

      className: "main-stat-green",

    },

    {

      title: t("checkIns"),

      value: dashboard.checkInsToday ?? 0,

      description: t("arrivalsToday"),

      icon: "bx-log-in",

      className: "main-stat-orange",

    },

    {

      title: t("checkOuts"),

      value: dashboard.checkOutsToday ?? 0,

      description: t("departuresToday"),

      icon: "bx-log-out",

      className: "main-stat-purple",

    },

  ];



  const activity = dashboard.activities || [];



  const occupancy = useMemo(

    () => [

      { label: t("occupied"), value: dashboard.occupiedPercent ?? 0 },
      { label: t("available"), value: dashboard.availablePercent ?? 0 },
      { label: t("reserved"), value: dashboard.reservedPercent ?? 0 },

    ],

    [t]

  );



  return (

    <div className="main-page">



      {/* =========================

          WELCOME

      ========================== */}



      <section className="main-welcome">

        <div className="main-welcome-content">



          <span className="main-welcome-label">

            {t("hotelName")}

          </span>



          <h1>

            {t("welcomeBack")}

            <br />

            <span>Oswal</span>

          </h1>



          <p>

            {t("hotelToday")}

          </p>



          <div className="main-welcome-actions">



            <button
              type="button"
              className="main-action-primary"
              onClick={() => navigate("/reservation")}
            >

              <i className="bx bx-plus" />

              {t("newReservation")}

            </button>



            <button
              type="button"
              className="main-action-secondary"
              onClick={() => navigate("/guests")}
            >

              <i className="bx bx-group" />

              {t("viewGuests")}

            </button>



          </div>

        </div>



        <div className="main-welcome-decoration">

          <div className="main-sun" />

          <div className="main-wave main-wave-one" />

          <div className="main-wave main-wave-two" />

          <div className="main-wave main-wave-three" />



          <div className="main-hotel-mark">

            <i className="bx bx-building-house" />

          </div>

        </div>

      </section>





      {/* =========================

          STATS

      ========================== */}



      <section className="main-stats">



        {stats.map((stat) => (

          <article

            className="main-stat-card"

            key={stat.title}

          >

            <div

              className={`main-stat-icon ${stat.className}`}

            >

              <i className={`bx ${stat.icon}`} />

            </div>



            <div className="main-stat-info">



              <span>

                {stat.title}

              </span>



              <strong>

                {stat.value}

              </strong>



              <small>

                {stat.description}

              </small>



            </div>

          </article>

        ))}



      </section>





      {/* =========================

          MAIN GRID

      ========================== */}



      <section className="main-dashboard-grid">



        {/* =========================

            OCCUPANCY

        ========================== */}



        <article className="main-panel occupancy-panel">



          <div className="main-panel-header">



            <div>

              <span className="main-panel-eyebrow">

                {t("hotelStatus")}

              </span>



              <h2>

                {t("occupancyOverview")}

              </h2>

            </div>



            <button

              type="button"

              className="main-panel-menu"

            >

              <i className="bx bx-dots-horizontal-rounded" />

            </button>



          </div>



          <div className="occupancy-content">



            <div className="occupancy-circle">



              <div className="occupancy-circle-inner">



                <strong>

                  {dashboard.occupancyPercent ?? 0}%

                </strong>



                <span>

                  {t("occupied")}

                </span>



              </div>



            </div>



            <div className="occupancy-details">



              {occupancy.map((item) => (

                <div

                  className="occupancy-item"

                  key={item.label}

                >



                  <div className="occupancy-item-label">



                    <span

                      className={`occupancy-dot occupancy-dot-${item.label

                        .toLowerCase()

                        .replace(" ", "-")}`}

                    />



                    <span>

                      {item.label}

                    </span>



                  </div>



                  <strong>

                    {item.value}%

                  </strong>



                </div>

              ))}



            </div>



          </div>



          <div className="occupancy-progress">



            <div

              className="occupancy-progress-fill"

              style={{ width: `${dashboard.occupancyPercent ?? 0}%` }}

            />



          </div>



          <div className="occupancy-footer">



            <span>

              {t("occupancySummary").replace("{occupied}", String(dashboard.occupiedRooms ?? 0)).replace("{total}", String(dashboard.roomsTotal ?? 0))}

            </span>



            <span>

              {t("updatedNow")}

            </span>



          </div>



        </article>





        {/* =========================

            ACTIVITY

        ========================== */}



        <article className="main-panel activity-panel">



          <div className="main-panel-header">



            <div>

              <span className="main-panel-eyebrow">

                {t("today")}

              </span>



              <h2>

                {t("recentActivity")}

              </h2>

            </div>



            <button
              type="button"
              className="main-view-all"
              onClick={() => navigate("/reservation")}
            >

              {t("viewAll")}

            </button>



          </div>



          <div className="main-activity-list">



            {activity.map((item) => (



              <div

                className="main-activity-item"

                key={item.id}

              >



                <div

                  className={`main-activity-icon main-activity-${item.type}`}

                >

                  <i

                    className={

                      item.type === "checkin"

                        ? "bx bx-log-in"

                        : item.type === "checkout"

                        ? "bx bx-log-out"

                        : "bx bx-calendar-check"

                    }

                  />

                </div>



                <div className="main-activity-info">



                  <strong>

                    {item.guest}

                  </strong>



                  <span>

                  {(item.room || "").replace("Room", t("roomLabel"))}

                  </span>



                </div>



                <div className="main-activity-meta">



                  <span>

                    {item.time}

                  </span>



                  <small>

                    {t(item.status === "Confirmed" ? "confirmed" : item.status === "Pending" ? "pending" : "newReservationStatus")}

                  </small>



                </div>



              </div>



            ))}



          </div>



        </article>





        {/* =========================

            QUICK ACTIONS

        ========================== */}



        <article className="main-panel quick-actions-panel">



          <div className="main-panel-header">



            <div>

              <span className="main-panel-eyebrow">

                {t("shortcuts")}

              </span>



              <h2>

                {t("quickActions")}

              </h2>

            </div>



          </div>



          <div className="quick-actions-grid">



            <button
              type="button"
              className="quick-action"
              onClick={() => navigate("/reservation")}
            >

              <div className="quick-action-icon">

                <i className="bx bx-calendar-plus" />

              </div>



              <div>

                <strong>

                  {t("newReservation")}

                </strong>



                <span>

                  {t("registerStay")}

                </span>

              </div>



              <i className="bx bx-right-arrow-alt" />

            </button>





            <button
              type="button"
              className="quick-action"
              onClick={() => navigate("/guests")}
            >

              <div className="quick-action-icon">

                <i className="bx bx-group" />

              </div>



              <div>

                <strong>

                  {t("guests")}

                </strong>



                <span>

                  {t("viewRegisteredGuests")}

                </span>

              </div>



              <i className="bx bx-right-arrow-alt" />

            </button>





            <button
              type="button"
              className="quick-action"
              onClick={() => navigate("/rooms")}
            >

              <div className="quick-action-icon">

                <i className="bx bx-bed" />

              </div>



              <div>

                <strong>

                  {t("rooms")}

                </strong>



                <span>

                  {t("checkRoomStatus")}

                </span>

              </div>



              <i className="bx bx-right-arrow-alt" />

            </button>





            <button
              type="button"
              className="quick-action"
              onClick={() => navigate("/reports")}
            >

              <div className="quick-action-icon">

                <i className="bx bx-line-chart" />

              </div>



              <div>

                <strong>

                  {t("reports")}

                </strong>



                <span>

                  {t("analyzeHotelActivity")}

                </span>

              </div>



              <i className="bx bx-right-arrow-alt" />

            </button>



          </div>



        </article>





        {/* =========================

            SUMMARY

        ========================== */}



        <article className="main-panel summary-panel">



          <div className="main-panel-header">



            <div>

              <span className="main-panel-eyebrow">

                {t("summary")}

              </span>



              <h2>

                {t("todaysNumbers")}

              </h2>

            </div>



            <i className="bx bx-calendar main-summary-icon" />



          </div>



          <div className="summary-list">



            <div className="summary-row">



              <div className="summary-row-left">



                <div className="summary-icon summary-blue">

                  <i className="bx bx-calendar-check" />

                </div>



                <span>

                  {t("reservations")}

                </span>



              </div>



              <strong>

                12

              </strong>



            </div>





            <div className="summary-row">



              <div className="summary-row-left">



                <div className="summary-icon summary-green">

                  <i className="bx bx-log-in" />

                </div>



                <span>

                  {t("checkIns")}

                </span>



              </div>



              <strong>

                5

              </strong>



            </div>





            <div className="summary-row">



              <div className="summary-row-left">



                <div className="summary-icon summary-orange">

                  <i className="bx bx-log-out" />

                </div>



                <span>

                  {t("checkOuts")}

                </span>



              </div>



              <strong>

                3

              </strong>



            </div>





            <div className="summary-row">



              <div className="summary-row-left">



                <div className="summary-icon summary-purple">

                  <i className="bx bx-user" />

                </div>



                <span>

                  {t("guests")}

                </span>



              </div>



              <strong>

                31

              </strong>



            </div>



          </div>



        </article>



      </section>



    </div>

  );

}



export default MainPage;
