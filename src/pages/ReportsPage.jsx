import { useLanguage } from "../context/useLanguage.js";

import ReservationsChart from "../components/Reports/ReservationsChart.jsx";
import InvestmentChart from "../components/Reports/InvestmentChart.jsx";
import SeasonChart from "../components/Reports/SeasonChart.jsx";
import ProfitsChart from "../components/Reports/ProfitsChart.jsx";

function ReportsPage() {
  const { t } = useLanguage();

  return (
    <div className="reports-page">

      <div className="reports-header">
        <h1>{t("reports")}</h1>

        <p>{t("reportsDescription")}</p>
      </div>

      <ReservationsChart />

      <InvestmentChart />

      <SeasonChart />

      <ProfitsChart />

    </div>
  );
}

export default ReportsPage;