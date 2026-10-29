import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useEffect, useState } from "react";

import { hotelApi } from "../../services/api.js";
import { useLanguage } from "../../context/useLanguage.js";

function ProfitsChart() {
  const { t } = useLanguage();
  const [profitsData, setData] = useState([]);
  useEffect(() => { hotelApi.reports({ type: "profits" }).then((data) => setData(Array.isArray(data) ? data : data.items || [])).catch(() => {}); }, []);
  const translatedProfits = profitsData.map((item) => ({ ...item, name: t(item.name) }));
  return (
    <div className="report-card">
      <div className="report-card-header">
        <h2>{t("profitDistribution")}</h2>
      </div>

      <div className="profit-chart">
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={translatedProfits}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={110}
              label
            >
              {translatedProfits.map((entry, index) => (
                <Cell key={`cell-${index}`} />
              ))}
            </Pie>

            <Tooltip />

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ProfitsChart;
