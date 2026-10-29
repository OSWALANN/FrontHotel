import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout.jsx";
import GuestsPage from "./pages/GuestsPage.jsx";
import MainPage from "./pages/MainPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import ReservationPage from "./pages/ReservationPage.jsx";
import RoomsPage from "./pages/RoomsPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";

import { LanguageProvider } from "./context/LanguageProvider.jsx";

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<MainPage />} />
            <Route path="rooms" element={<RoomsPage />} />
            <Route path="reservation" element={<ReservationPage />} />
            <Route path="guests" element={<GuestsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />

            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;