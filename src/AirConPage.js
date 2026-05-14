import { useNavigate } from "react-router-dom";
import Header from "./components/Header";
import "./AirConPage.css";
import { saveBasket } from "./Basket";

export default function AirConPage() {
  const navigate = useNavigate();

  const selectService = (service, price) => {
    saveBasket({
      service,
      type: "Air Con",
      price,
      extras: "",
    });

    navigate(`/summary?service=${encodeURIComponent(service)}`);
  };

  return (
    <div className="airconPage">
      <Header />

      <section className="airconHero">
        <div>
          <p>AIR CONDITIONING</p>
          <h1>Air Con Recharge & Repairs</h1>
          <span>Stay cool with fast, same-day air conditioning services in Hull.</span>
        </div>
      </section>

      <section className="airconCards">

        {/* R134A */}
        <div className="airconCard">
          <h2>R134a Gas Recharge</h2>
          <p className="airconSub">Vehicles up to 2014</p>

          <div className="airconPrice">£64.99</div>

          <ul>
            <li>✔ Full system recharge</li>
            <li>✔ Performance check</li>
            <li>✔ Same-day service</li>
          </ul>

          <button onClick={() => selectService("Air Con R134a Recharge", 64.99)}>
            BOOK NOW →
          </button>
        </div>

        {/* R1234YF */}
        <div className="airconCard featured">
          <div className="badge">MOST COMMON</div>

          <h2>R1234yf Gas Recharge</h2>
          <p className="airconSub">Vehicles 2015 onwards</p>

          <div className="airconPrice">£124.99</div>

          <ul>
            <li>✔ Latest gas systems</li>
            <li>✔ Full recharge & check</li>
            <li>✔ Same-day service</li>
          </ul>

          <button onClick={() => selectService("Air Con R1234yf Recharge", 124.99)}>
            BOOK NOW →
          </button>
        </div>

        {/* LEAK TEST */}
        <div className="airconCard">
          <h2>Air Con Leak Test</h2>
          <p className="airconSub">Find faults & gas leaks</p>

          <div className="airconPrice">£40.00</div>

          <ul>
            <li>✔ Leak detection test</li>
            <li>✔ Pressure check</li>
            <li>✔ Fault diagnosis</li>
          </ul>

          <button onClick={() => selectService("Air Con Leak Test", 40.00)}>
            BOOK NOW →
          </button>
        </div>

      </section>
    </div>
  );
}