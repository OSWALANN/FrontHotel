import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";

import { hotelApi } from "../../services/api.js";
import { useLanguage } from "../../context/useLanguage.js";

function ReservationsChart() {
  const { t } = useLanguage();
  const [reservationsData, setData] = useState([]);
  useEffect(() => { hotelApi.reports({ type: "reservations" }).then((data) => setData(Array.isArray(data) ? data : data.items || [])).catch(() => {}); }, []);

  return (
    <div className="report-card">
      <div className="report-card-header">
        <h2>{t("monthlyReservations")}</h2>
      </div>

      <div className="report-chart">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={reservationsData.map((item) => ({ ...item, month: t(item.month) }))}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="reservations"
              name={t("reservations")}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ReservationsChart;
