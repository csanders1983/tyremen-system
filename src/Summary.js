import { useLocation, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import "./Summary.css";
import { getBasket, saveBasket, servicePrices } from "./Basket";

const serviceInfo = {
  "OIL & FILTER": { price: 120, icon: "🛢️" },
  "INTERIM SERVICE": { price: 128.5, icon: "🔧" },
  "FULL SERVICE": { price: 155, icon: "⚙️" },
  "MAJOR SERVICE": { price: 180, icon: "🛠️" },

  "Oil & Filter": { price: 120, icon: "🛢️" },
  "Interim Service": { price: 128.5, icon: "🔧" },
  "Full Service": { price: 155, icon: "⚙️" },
  "Major Service": { price: 180, icon: "🛠️" },

  MOT: { price: 40, icon: "✅" },
  "Class 4 MOT": { price: 40, icon: "✅" },
  "Class 7 MOT": { price: null, icon: "🚐" },
};

export default function Summary() {
  const navigate = useNavigate();
  const params = new URLSearchParams(useLocation().search);

  const service = params.get("service") || "Service";
  const extras = params.get("extras") || "";

  const savedBasket = getBasket();

  const selected = savedBasket || servicePrices[service] || serviceInfo[service] || {
    service,
    type: "Service",
    price: null,
    extras: "",
    icon: "🚗",
  };

  const displayService = selected.service || service;
  const total = selected.price;
  return (
    <div className="summaryPage">
      <Header />

      <section className="summaryHero">
        <div>
          <p>BOOKING BASKET</p>
          <h1>Review Your Booking</h1>
          <span>Check your selected service before choosing a date and time.</span>
        </div>
      </section>

      <section className="summaryMain">
        <div className="summaryCard">
          <h2>Your Booking Basket</h2>

          <div className="basketLine">
  <div className="basketIcon">{selected.icon}</div>

  <div>
    <span>SERVICE</span>
    <strong>{displayService}</strong>
  </div>

  <div className="basketPrice">
    {total !== null ? `£${Number(total).toFixed(2)}` : "POA"}
  </div>
</div>

          <div className="summaryTotal">
            <span>Estimated total from</span>
            <strong>{total !== null ? `£${total.toFixed(2)}` : "Price on request"}</strong>
          </div>

          <div className="summaryNotice">
            Final price may vary depending on vehicle, oil type, parts and inspection.
            We’ll confirm before carrying out any work.
          </div>

          <button
            className="summaryContinue"
            onClick={() => navigate(`/booking?service=${service}&extras=${extras}`)}
          >
            Continue to booking →
          </button>
        </div>
      </section>
    </div>
  );
}