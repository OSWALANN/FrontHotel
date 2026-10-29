import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";

import { hotelApi } from "../../services/api.js";
import { useLanguage } from "../../context/useLanguage.js";

function SeasonChart() {
  const { t } = useLanguage();
  const [seasonData, setData] = useState([]);
  useEffect(() => { hotelApi.reports({ type: "occupancy" }).then((data) => setData(Array.isArray(data) ? data : data.items || [])).catch(() => {}); }, []);

  return (
    <div className="report-card">
      <div className="report-card-header">
        <h2>{t("season")}</h2>
      </div>

      <div className="report-chart">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={seasonData.map((item) => ({ ...item, month: t(item.month) }))}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />

            <Tooltip
              formatter={(value) => `${value}%`}
            />

            <Legend />

            <Line
              type="monotone"
              dataKey="occupancy"
              name={t("occupancy")}
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SeasonChart;
