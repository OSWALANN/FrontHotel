import { useEffect, useState } from "react";
import { useLanguage } from "../context/useLanguage.js";
import { hotelApi } from "../services/api.js";

function SettingsPage() {
  const { language, changeLanguage, darkMode, changeDarkMode, t } = useLanguage();
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    () => localStorage.getItem("notificationsEnabled") !== "false"
  );
  useEffect(() => {
    hotelApi.settings.get().then((settings) => {
      const value = settings.notificationsEnabled ?? settings.notifications_enabled;
      if (value !== undefined) setNotificationsEnabled(value === true || value === "true");
    }).catch(() => {});
  }, []);

  const toggleNotifications = (event) => {
    const enabled = event.target.checked;
    setNotificationsEnabled(enabled);
    localStorage.setItem("notificationsEnabled", String(enabled));
    hotelApi.settings.update({ notificationsEnabled: enabled }).catch((error) => alert(error.message));
  };

  return (
    <div className="settings-page">
      <section className="settings-header">
        <div>
          <h1>{t("settings")}</h1>
          <p>{t("settingsDescription")}</p>
        </div>
      </section>

      <section className="settings-container" aria-labelledby="general-settings-title">
        <h2 id="general-settings-title">{t("generalSettings")}</h2>

        <div className="setting-item">
          <div className="setting-info">
            <h3>{t("language")}</h3>
            <p>{t("languageDescription")}</p>
          </div>
          <select
            aria-label={t("language")}
            value={language}
            onChange={(event) => changeLanguage(event.target.value)}
          >
            <option value="English">English</option>
            <option value="Spanish">Español</option>
          </select>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h3>{t("notifications")}</h3>
            <p>{t("notificationsDescription")}</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={toggleNotifications}
              aria-label={t("notifications")}
            />
            <span className="slider" />
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h3>{t("darkMode")}</h3>
            <p>{t("darkModeDescription")}</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={(event) => changeDarkMode(event.target.checked)}
              aria-label={t("darkMode")}
            />
            <span className="slider" />
          </label>
        </div>
      </section>
    </div>
  );
}

export default SettingsPage;
