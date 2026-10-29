import { NavLink } from "react-router-dom";
import { menuGroups, userProfile } from "../data/hotelData.js";
import { useLanguage } from "../context/useLanguage.js";

function Sidebar({ minimized, onToggle }) {
  const { t } = useLanguage();

  return (
    <aside className={`sidebar ${minimized ? "minimize" : ""}`}>
      
      <div className="header">
        <button
          className="menu-btn"
          type="button"
          onClick={onToggle}
          aria-label="Cambiar menu"
        >
          <i
            className={`bx ${
              minimized ? "bx-chevron-right" : "bx-chevron-left"
            }`}
          />
        </button>

        <div className="icons">
          <img
            src={userProfile.hotelIcon}
            alt="Logo Diana Cazadora"
          />
          <span>Diana Cazadora</span>
        </div>
      </div>

      <div className="menu-container">

        {/* MENU */}
        <nav
          className="menu"
          aria-label="Navegacion principal"
        >
          {menuGroups.map((group) => (
            <div
              className="menu-group"
              key={group.title}
            >
              <h6>{t(group.title)}</h6>

              {group.items.map((item) => (
                <NavLink
                  className="menu-item menu-link"
                  end={item.path === "/"}
                  key={item.path}
                  to={item.path}
                >
                  <i className={`bx ${item.icon}`} />

                  <span>{t(item.label)}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* USUARIO */}
        <div className="user">
          <div className="user-img">
            <img
              src={userProfile.avatar}
              alt="Usuario"
            />
          </div>

          <div className="user-data">
            <span className="name">
              {userProfile.name}
            </span>

            <span className="email">
              {userProfile.email}
            </span>
          </div>

          <div className="user-icon">
            <i className="bx bx-exit" />
          </div>
        </div>

      </div>
    </aside>
  );
}

export default Sidebar;
