
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";

// Layout principal: mantiene el sidebar y muestra la página activa.
function Layout() {
  // Controla si el sidebar está expandido o contraído.
  const [minimized, setMinimized] = useState(false);

  return (
    <>
      {/* Menú lateral con su estado y botón de control. */}
      <Sidebar
        minimized={minimized}
        onToggle={() => setMinimized((value) => !value)}
      />

      {/* Contenido principal: su clase cambia con el sidebar. */}
      <main className={`contenido ${minimized ? "minimize" : ""}`}>
        <Outlet />
      </main>
    </>
  );
}

export default Layout;
