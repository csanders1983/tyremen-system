import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import Header from "./components/Header";
import "./TyreProductPage.css";

function cleanSize(value) {
  return String(value || "")
    .replace(/\s/g, "")
    .replace(/-/g, "")
    .toUpperCase();
}

function getTyreSize(tyre, fallbackSize) {
  if (tyre.size) return tyre.size;
  if (tyre.tyreSize) return tyre.tyreSize;
  if (tyre.Size) return tyre.Size;
  if (tyre["Tyre Size"]) return tyre["Tyre Size"];

  const width = tyre.width || tyre.Width;
  const profile = tyre.profile || tyre.Profile;
  const rim = tyre.rim || tyre.Rim || tyre.diameter || tyre.Diameter;

  if (width && profile && rim) {
    return `${width}/${profile}R${rim}`;
  }

  return fallbackSize;
}

function normaliseTyre(tyre, tyreSize) {
  const price = Number(
    tyre.price ||
      tyre.Price ||
      tyre.retail ||
      tyre.Retail ||
      tyre.sell ||
      tyre.Sell ||
      tyre["Sell Price"] ||
      tyre["Retail Price"] ||
      0
  );

  return {
    id: tyre.id,
    brand: tyre.brand || tyre.Brand || tyre.make || tyre.Make || "",
    model:
      tyre.model ||
      tyre.Model ||
      tyre.pattern ||
      tyre.Pattern ||
      tyre.description ||
      tyre.Description ||
      "",
    size: getTyreSize(tyre, tyreSize),
    load:
      tyre.load ||
      tyre.Load ||
      tyre.loadIndex ||
      tyre["Load Index"] ||
      "",
    speed:
      tyre.speed ||
      tyre.Speed ||
      tyre.speedRating ||
      tyre["Speed Rating"] ||
      "",
    wet:
      tyre.wet ||
      tyre.Wet ||
      tyre.wetGrip ||
      tyre["Wet Grip"] ||
      "",
    fuel:
      tyre.fuel ||
      tyre.Fuel ||
      tyre.fuelRating ||
      tyre["Fuel Rating"] ||
      "",
    noise:
      tyre.noise ||
      tyre.Noise ||
      tyre.noiseDb ||
      tyre["Noise dB"] ||
      "",
    stock: Number(
      tyre.stock ||
        tyre.Stock ||
        tyre.qty ||
        tyre.Qty ||
        tyre.quantity ||
        tyre.Quantity ||
        0
    ),
    price,
    image:
      tyre.image ||
      tyre.Image ||
      tyre.imageUrl ||
      tyre.ImageUrl ||
      "/images/tyres/default-tyre.png",
    tag:
      tyre.tag ||
      tyre.Tag ||
      tyre.category ||
      tyre.Category ||
      "Fully Fitted",
    raw: tyre,
  };
}

export default function TyreProductPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [allTyres, setAllTyres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("priceAsc");

  const vehicle =
    location.state?.vehicle ||
    JSON.parse(localStorage.getItem("vehicle") || "null") ||
    {};

  const tyreSize =
    location.state?.tyreSize ||
    localStorage.getItem("tyreSize") ||
    vehicle?.tyreSize ||
    vehicle?.frontTyreSize ||
    "205/45R17";

  const vehicleTitle =
    vehicle?.make && vehicle?.model
      ? `${vehicle.make} ${vehicle.model} ${vehicle.derivative || ""}`.trim()
      : "Your Vehicle";

  const vehicleYear =
    vehicle?.year || vehicle?.manufactureYear || vehicle?.registrationYear || "";

  const fuel = vehicle?.fuel || vehicle?.fuelType || vehicle?.FuelType || "";

  const vehicleImage =
    vehicle?.image ||
    vehicle?.vehicleImage ||
    vehicle?.imageUrl ||
    "/images/vehicles/default-car.png";

  useEffect(() => {
    async function loadTyres() {
      try {
        const snap = await getDocs(collection(db, "tyres"));

        const firebaseTyres = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAllTyres(firebaseTyres);
      } catch (err) {
        console.error("Firebase tyre load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadTyres();
  }, []);

  const tyres = useMemo(() => {
    let list = allTyres
      .map((tyre) => normaliseTyre(tyre, tyreSize))
      .filter((tyre) => cleanSize(tyre.size) === cleanSize(tyreSize));

    if (sortBy === "priceAsc") {
      list = [...list].sort((a, b) => a.price - b.price);
    }

    if (sortBy === "priceDesc") {
      list = [...list].sort((a, b) => b.price - a.price);
    }

    return list;
  }, [allTyres, tyreSize, sortBy]);

  function viewTyre(tyre) {
    localStorage.setItem("selectedTyre", JSON.stringify(tyre));

    navigate(`/tyre/${tyre.id}`, {
      state: {
        tyre,
        vehicle,
        tyreSize,
      },
    });
  }

  return (
    <>
      <Header />

      <main className="tyreResultsPage">
        <section className="vehicleHero">
          <div className="vehicleHeroImage">
            <img src={vehicleImage} alt={vehicleTitle} />
          </div>

          <div className="vehicleHeroText">
            <h1>{vehicleTitle}</h1>
            <p>
              {vehicleYear && (
                <>
                  {vehicleYear} <span>•</span>{" "}
                </>
              )}
              {fuel && (
                <>
                  {fuel} <span>•</span>{" "}
                </>
              )}
              Tyre size: <strong>{tyreSize}</strong>
            </p>
          </div>
        </section>

        <section className="tyreSizePanel">
          <div className="sizeLeft">
            <img src="/images/tyres/tyre-side.png" alt="" />
            <div>
              <span>Your tyre size</span>
              <h2>{tyreSize}</h2>
            </div>
          </div>

          <div className="trustGrid">
            <div>✅ Fully fitted price</div>
            <div>🏁 Hull fitting centre</div>
            <div>🛡️ Over 55 years trusted</div>
            <div>☎ 01482 328800</div>
          </div>
        </section>

        <section className="resultsHeader">
          <div>
            <h2>
              {tyres.length} tyres found for <strong>{tyreSize}</strong>
            </h2>
            <p>All prices include fitting, VAT, valve and balance.</p>
          </div>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="priceAsc">Sort by: Price low to high</option>
            <option value="priceDesc">Sort by: Price high to low</option>
          </select>
        </section>

        {loading && <p className="loadingTyres">Loading tyres...</p>}

        {!loading && tyres.length === 0 && (
          <p className="loadingTyres">
            No tyres found for {tyreSize}. Call us on 01482 328800.
          </p>
        )}

        <section className="tyreList">
          {tyres.map((tyre) => (
            <article className="tyreCardLong" key={tyre.id}>
              <div className="tyreRibbon">Fully fitted</div>

              <div className="tyreImageBox">
                <div className="stockBadge">{tyre.stock} available</div>

                <div
                  className={`tagBadge ${
                    tyre.tag !== "Budget Option" ? "redTag" : ""
                  }`}
                >
                  {tyre.tag}
                </div>

                <img src={tyre.image} alt={`${tyre.brand} ${tyre.model}`} />
              </div>

              <div className="tyreInfo">
                <h3>{tyre.brand}</h3>
                <p>{tyre.model}</p>

                <div className="tyreSizeLine">
                  {tyre.size}
                  <span>XL</span>
                </div>

                <div className="specGrid">
                  {tyre.load && <span>Load {tyre.load}</span>}
                  {tyre.speed && <span>Speed {tyre.speed}</span>}
                  {tyre.wet && <span>Wet {tyre.wet}</span>}
                  {tyre.fuel && <span>Fuel {tyre.fuel}</span>}
                  {tyre.noise && <span>Noise {tyre.noise}</span>}
                </div>
              </div>

              <div className="pricePanel">
                <small>Fully fitted at Tyremen Hull</small>
                <strong>£{Number(tyre.price || 0).toFixed(2)}</strong>
                <button onClick={() => viewTyre(tyre)}>View Tyre →</button>
              </div>
            </article>
          ))}
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
            <h2>Need help choosing?</h2>
            <p>Our experts can help you find the right tyres for your vehicle.</p>
          </div>

          <a href="tel:01482328800">01482 328800</a>
        </section>
      </main>
    </>
  );
}