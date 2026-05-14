import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./components/Header";
import tyres from "./data/tyres.json";
import "./TyreSearchPage.css";
import heroCar from "./hero-car.jpg";

export default function TyreSearchPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);
  const [vehicle, setVehicle] = useState(null);
  const [loadingVehicle, setLoadingVehicle] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const vrm = params.get("vrm");

  const makeSlug = (title) =>
    String(title || "")
      .toLowerCase()
      .replaceAll("/", "-")
      .replaceAll(" ", "-")
      .replace(/[^a-z0-9-]/g, "");

  const brandLogos = {
    VREDESTEIN: "/brand-logos/vredestein.png",
    APTANY: "/brand-logos/aptany.png",
    LINGLONG: "/brand-logos/linglong.png",
    DELINTE: "/brand-logos/delinte.png",
    PIRELLI: "/brand-logos/pirelli.png",
    MICHELIN: "/brand-logos/michelin.png",
    GOODYEAR: "/brand-logos/goodyear.png",
    CONTINENTAL: "/brand-logos/continental.png",
    BRIDGESTONE: "/brand-logos/bridgestone.png",
    HANKOOK: "/brand-logos/hankook.png",
  };

  const getSize = (tyre) =>
    `${tyre.Width || ""}/${tyre["Aspect Ratio"] || ""}R${tyre.Rim || ""}`;

  const normaliseSize = (size) =>
    String(size || "")
      .toUpperCase()
      .replace(/\s/g, "")
      .replace("-", "/")
      .replace("ZR", "R");

  const getPrice = (tyre) => {
    const cost = Number(tyre.Price || 0);
    return (cost + 25) * 1.2;
  };

  const getBrandLogo = (brand) => {
    const key = String(brand || "").toUpperCase().trim();
    return brandLogos[key] || "";
  };

  useEffect(() => {
    if (!vrm) return;

    async function loadVehicle() {
      try {
        setLoadingVehicle(true);

        const res = await fetch(
          `https://vehiclelookup-tx3ipea3qa-uc.a.run.app?vrm=${vrm}`
        );

        const data = await res.json();

        if (data.success) {
          setVehicle(data.vehicle);

          if (data.vehicle?.frontTyreSize && data.vehicle?.rearTyreSize) {
            if (data.vehicle.frontTyreSize === data.vehicle.rearTyreSize) {
              setSearch(data.vehicle.frontTyreSize);
            } else {
              setSearch("");
            }
          } else if (data.vehicle?.tyreSize) {
            setSearch(data.vehicle.tyreSize);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingVehicle(false);
      }
    }

    loadVehicle();
  }, [vrm]);

  const frontSize = normaliseSize(vehicle?.frontTyreSize);
  const rearSize = normaliseSize(vehicle?.rearTyreSize);
  const isStaggered = Boolean(frontSize && rearSize && frontSize !== rearSize);

  const frontTyres = useMemo(() => {
    if (!frontSize) return [];

    return tyres.filter((tyre) => normaliseSize(getSize(tyre)) === frontSize);
  }, [frontSize]);

  const rearTyres = useMemo(() => {
    if (!rearSize) return [];

    return tyres.filter((tyre) => normaliseSize(getSize(tyre)) === rearSize);
  }, [rearSize]);

  const filteredTyres = useMemo(() => {
    let list = tyres;

    if (vehicle?.tyreSize && !isStaggered) {
      const vehicleSize = normaliseSize(vehicle.tyreSize);

      list = list.filter((tyre) => {
        const tyreSize = normaliseSize(getSize(tyre));
        return tyreSize === vehicleSize;
      });
    }

    const term = normaliseSize(search);

    if (term && !vehicle?.tyreSize && !isStaggered) {
      list = list.filter((tyre) => {
        const text = normaliseSize(`
          ${tyre.Title || ""}
          ${tyre.Brand || ""}
          ${tyre.Model || ""}
          ${getSize(tyre)}
        `);

        return text.includes(term);
      });
    }

    return list;
  }, [search, vehicle, isStaggered]);

  const visibleTyres = filteredTyres.slice(0, visibleCount);

  const openTyre = (tyre, axle = "") => {
    const query = vehicle?.vrm
      ? `?vrm=${vehicle.vrm}${axle ? `&axle=${axle}` : ""}`
      : "";

    navigate(`/tyres/${makeSlug(tyre.Title)}${query}`, {
      state: { tyre, axle },
    });
  };

  const renderTyreCard = (tyre, index, axle = "") => {
    const size = getSize(tyre);
    const price = getPrice(tyre);
    const brandLogo = getBrandLogo(tyre.Brand);
    const qty = Number(tyre.Quantity || 0);

    return (
      <article className="tsrCard" key={`${axle}-${tyre.Title}-${index}`}>
        <div className="tsrRibbon">
          {axle ? `${axle.toUpperCase()} FITTED` : "FULLY FITTED"}
        </div>

        <div className="tsrBadges">
          <span className={qty <= 1 ? "tsrStock low" : "tsrStock"}>
            {qty > 0 ? `${qty} available` : "Check stock"}
          </span>

          <span className="tsrRange">
            {axle ? `${axle} axle` : "Budget Option"}
          </span>
        </div>

        <div className="tsrImage">
          <img src={tyre["Image URL"]} alt={tyre.Title} />
        </div>

        <div className="tsrInfo">
          <div className="tsrBrand">
            {brandLogo ? (
              <img
                src={brandLogo}
                alt={tyre.Brand}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextSibling.style.display = "block";
                }}
              />
            ) : null}

            <strong style={{ display: brandLogo ? "none" : "block" }}>
              {tyre.Brand}
            </strong>
          </div>

          <p>{tyre.Model}</p>

          <h3>
            {size}
            {tyre.Reinforced && <span>{tyre.Reinforced}</span>}
          </h3>

          <div className="tsrSpecs">
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

        <div className="tsrPrice">
          <div className="tsrFitter">
            <img src="/wheel.png" alt="Wheel" className="tsrWheelIcon" />
          </div>

          <div>
            <small>
              {axle
                ? `${axle.toUpperCase()} axle fitted at Tyremen Hull`
                : "Fully fitted at Tyremen Hull"}
            </small>

            <strong>£{price.toFixed(2)}</strong>
          </div>

          <button onClick={() => openTyre(tyre, axle)}>View Tyre</button>
        </div>
      </article>
    );
  };

  return (
    <div className="tsrPage">
      <Header />

      <section
        className="tsrHero"
        style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(5,5,5,0.96), rgba(21,21,21,0.72)),
            url(${heroCar})
          `,
        }}
      >
        <div className="tsrHeroOverlay">
          <span>TYREMEN HULL</span>
          <h1>Find Your Tyres</h1>
          <p>Fully fitted tyres including VAT, valve and balance.</p>
          <strong>More than just tyres.</strong>
        </div>
      </section>

      {loadingVehicle && (
        <div className="tsrVehicleLoading">Loading vehicle...</div>
      )}

      {vehicle && (
        <section className="tsrVehicleBox">
          {vehicle.image && (
            <img
              src={vehicle.image}
              alt={vehicle.model}
              className="tsrVehicleImage"
            />
          )}

          <div className="tsrVehicleInfo">
            <div className="tsrVehicleVrm">{vehicle.vrm}</div>

            <h2>
              {vehicle.make} {vehicle.model}
            </h2>

            <p>
              {vehicle.year} • {vehicle.fuel} •{" "}
              {isStaggered ? (
                <>
                  Front: <strong>{vehicle.frontTyreSize}</strong> • Rear:{" "}
                  <strong>{vehicle.rearTyreSize}</strong>
                </>
              ) : (
                <>
                  Tyre size:{" "}
                  <strong>
                    {vehicle.frontTyreSize || vehicle.tyreSize || "Confirm size"}
                  </strong>
                </>
              )}
            </p>
          </div>
        </section>
      )}

      {isStaggered && (
        <section className="tsrStaggeredNotice">
          <strong>Staggered fitment detected</strong>
          <p>
            This vehicle uses different front and rear tyre sizes. Please choose
            front tyres and rear tyres separately.
          </p>
        </section>
      )}

      <div className="tsrSearchWrap">
        <input
          type="text"
          placeholder="Search by size, brand or pattern..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setVisibleCount(20);
            setVehicle(null);
          }}
        />
      </div>

      <section className="tsrTrust">
        <div> Fully fitted price</div>
        <div> Hull fitting centre</div>
        <div> &#128077;&#127999;Over 55 years trusted</div>
        <div>&#9742; 01482 328800</div>
      </section>

      {isStaggered ? (
        <>
          <section className="tsrIntro">
            <h2>
              Front tyres found: {frontTyres.length}
            </h2>
            <p>Front axle size: {vehicle.frontTyreSize}</p>
          </section>

          <section className="tsrGrid">
            {frontTyres.map((tyre, index) =>
              renderTyreCard(tyre, index, "front")
            )}
          </section>

          <section className="tsrIntro">
            <h2>
              Rear tyres found: {rearTyres.length}
            </h2>
            <p>Rear axle size: {vehicle.rearTyreSize}</p>
          </section>

          <section className="tsrGrid">
            {rearTyres.map((tyre, index) =>
              renderTyreCard(tyre, index, "rear")
            )}
          </section>
        </>
      ) : (
        <>
          <section className="tsrIntro">
            <h2>
              {filteredTyres.length} tyres found
              {vehicle?.frontTyreSize
                ? ` for ${vehicle.frontTyreSize}`
                : vehicle?.tyreSize
                  ? ` for ${vehicle.tyreSize}`
                  : ""}
            </h2>
            <p>All prices include fitting, VAT, valve and balance.</p>
          </section>

          <section className="tsrGrid">
            {visibleTyres.map((tyre, index) =>
              renderTyreCard(tyre, index)
            )}
          </section>

          {visibleCount < filteredTyres.length && (
            <div className="tsrLoadMore">
              <button onClick={() => setVisibleCount((prev) => prev + 20)}>
                Load More Tyres
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}