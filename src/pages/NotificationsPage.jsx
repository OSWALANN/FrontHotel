import { useEffect, useState } from "react";
import { useLanguage } from "../context/useLanguage.js";
import { hotelApi } from "../services/api.js";

function NotificationsPage() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const load = () => hotelApi.notifications.list().then((items) => setNotifications(Array.isArray(items) ? items : items.items || [])).catch((requestError) => setError(requestError.message));
  useEffect(() => { load(); }, []);
  const markRead = (id) => hotelApi.notifications.markRead(id).then(load).catch((requestError) => setError(requestError.message));
  return (
    <div className="notifications-page">

      <div className="notifications-header">
        <h1>{t("notifications")}</h1>
        <p>{t("notificationsDescriptionPage")}</p>
      </div>

      {error && <p role="alert">{error}</p>}
      <section className="notifications-list">

        {notifications.map((notification) => (
          <article
            className={`notification-card ${
              (notification.read ?? notification.isRead) ? "read" : "unread"
            }`}
            key={notification.id}
          >

            <div className="notification-icon">
              <i className={`bx ${notification.icon || "bx-bell"}`} />
            </div>

            <div className="notification-content">

              <h2>{notification.title}</h2>

              <p>{notification.description || notification.message}</p>

              <div className="notification-date">
                <span>
                  <i className="bx bx-calendar" />
                  {notification.date || new Date(notification.createdAt).toLocaleDateString()}
                </span>

                <span>
                  <i className="bx bx-time-five" />
                  {notification.time || new Date(notification.createdAt).toLocaleTimeString()}
                </span>
              </div>

            </div>

            {!notification.read && !notification.isRead && <button type="button" className="notification-new" onClick={() => markRead(notification.id)}>{t("new")}</button>}

          </article>
        ))}

      </section>

    </div>
  );
}

export default NotificationsPage;
