import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "./components/Footer";
import "./TyreProductPage.css";
import { addToBasket as addBasketItem } from "./Basket";

function getSize(tyre) {
  const width = tyre.Width || tyre.width || tyre["Section Width"] || "";
  const profile = tyre["Aspect Ratio"] || tyre.aspectRatio || tyre.Profile || "";
  const rim = tyre.Rim || tyre.rim || tyre["Rim Size"] || "";

  if (width && profile && rim) {
    return `${width}/${profile}R${rim}`;
  }

  return tyre.Size || tyre.size || tyre["Tyre Size"] || "";
}

function getPrice(tyre) {
  const cost = Number(tyre.Price || 0);
  return (cost + 25) * 1.2;
}

export default function TyreProductPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const tyre =
    location.state?.tyre ||
    JSON.parse(localStorage.getItem("selectedTyre") || "null");

  const vehicle =
    location.state?.vehicle ||
    JSON.parse(localStorage.getItem("vehicle") || "null") ||
    {};

  const axle = location.state?.axle || "";

  useEffect(() => {
    if (location.state?.tyre) {
      localStorage.setItem("selectedTyre", JSON.stringify(location.state.tyre));
    }

    if (location.state?.vehicle) {
      localStorage.setItem("vehicle", JSON.stringify(location.state.vehicle));
    }
  }, [location.state]);

  if (!tyre) {
    return (
      <>
        <main className="tyreResultsPage">
          <section className="helpBox">
            <div>
              <h2>Tyre not found</h2>
              <p>Please go back to the tyre search and select a tyre again.</p>
            </div>

            <button onClick={() => navigate("/tyres")}>Back to tyres</button>
          </section>
        </main>
        <Footer />
      </>
    );
  }
  const size = getSize(tyre);
  const price = getPrice(tyre);

const bookTyre = () => {
  const basketItem = {
    id: `tyre-${Date.now()}`,
    name: `${tyre.Brand || ""} ${tyre.Model || ""}`.trim(),
    service: `${tyre.Brand || ""} ${tyre.Model || ""}`.trim(),
    type: "tyre",
    category: "Tyre",
    qty: 1,
    price: Number(price || 0),

    size,
    brand: tyre.Brand || "",
    pattern: tyre.Model || "",
    loadIndex: tyre["Load Index"] || "",
    speedRating: tyre["Speed Rating"] || "",
    runflat: tyre.Reinforced || "",
    axle: axle || "",

    registration: vehicle?.vrm || "",
    vehicle: vehicle || null,

    extras: "",
    icon: "🛞",
  };

  addBasketItem(basketItem);

  navigate("/booking", {
    state: {
      vehicle,
      registration: vehicle?.vrm || "",
    },
  });
};
  

  const vehicleTitle =
    vehicle?.make && vehicle?.model
      ? `${vehicle.make} ${vehicle.model}`.trim()
      : "Your Vehicle";


  return (
    <>
      <main className="tyreResultsPage">
        <section className="vehicleHero">
          <div className="vehicleHeroText">
            <h1>{tyre.Brand}</h1>
            <p>
              {tyre.Model} <span>•</span> Tyre size:{" "}
              <strong>{size}</strong>
            </p>
          </div>
        </section>

        <section className="tyreSizePanel">
          <div className="sizeLeft">
            <img src="/images/tyres/tyre-side.png" alt="" />
            <div>
              <span>Your selected tyre</span>
              <h2>{size}</h2>
            </div>
          </div>

          <div className="trustGrid">
            <div>✅ Fully fitted price</div>
            <div>✅ Hull fitting centre</div>
            <div>✅ Over 55 years trusted</div>
            <div>☎ 01482 328800</div>
          </div>
        </section>

        <section className="tyreList">
          <article className="tyreCardLong">
            <div className="tyreRibbon">
              {axle ? `${axle.toUpperCase()} FITTED` : "FULLY FITTED"}
            </div>

            <div className="tyreImageBox">
              <div className="stockBadge">
                {Number(tyre.Quantity || 0)} available
              </div>

              <div className="tagBadge">Fully Fitted</div>

              <img src={tyre["Image URL"]} alt={tyre.Title} />
            </div>

            <div className="tyreInfo">
              <h3>{tyre.Brand}</h3>
              <p>{tyre.Model}</p>

              <div className="tyreSizeLine">
                {size}
                {tyre.Reinforced && <span>{tyre.Reinforced}</span>}
              </div>

              <div className="specGrid">
                <span>Load {tyre["Load Index"] || "-"}</span>
                <span>Speed {tyre["Speed Rating"] || "-"}</span>
                <span>Wet {tyre["Wet Grip"] || "-"}</span>
                <span>Fuel {tyre["Rolling Resistance"] || "-"}</span>
                <span>
                  Noise{" "}
                  {tyre["Noise Performance"]
                    ? `${tyre["Noise Performance"]} dB`
                    : "-"}
                </span>
              </div>
            </div>

            <div className="pricePanel">
              <small>
                Fully fitted at Tyremen Hull
                {vehicleTitle !== "Your Vehicle" && ` for ${vehicleTitle}`}
              </small>

              <strong>£{price.toFixed(2)}</strong>

              <button type="button" onClick={bookTyre}>
                Book This Tyre →
                </button>
            </div>
          </article>
        </section>

        <section className="fittingStrip">
          <div>
            <strong>Expert fitting</strong>
            <span>All tyres fitted by trained technicians.</span>
          </div>
          <div>
            <strong>Wheel balancing</strong>
            <span>Precision balancing included.</span>
          </div>
          <div>
            <strong>New valve</strong>
            <span>Brand new valves included.</span>
          </div>
          <div>
            <strong>Peace of mind</strong>
            <span>All tyres include VAT and fitting.</span>
          </div>
        </section>

        <section className="helpBox">
          <div>
            <h2>Need help?</h2>
            <p>Our experts can help you confirm this tyre is correct.</p>
          </div>

          <a href="tel:01482328800">01482 328800</a>
        </section>
      </main>

      <Footer />
    </>
  );
}