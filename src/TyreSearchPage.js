import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./components/Header";
import tyres from "./data/tyres.json";
import "./TyreSearchPage.css";

export default function TyreSearchPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);
  const [vehicle, setVehicle] = useState(null);
  const [loadingVehicle, setLoadingVehicle] = useState(false);
  const [sortBy, setSortBy] = useState("priceAsc");

  const params = new URLSearchParams(window.location.search);
  const vrm = params.get("vrm");

  const makeSlug = (title) =>
    String(title || "")
      .toLowerCase()
      .replaceAll("/", "-")
      .replaceAll(" ", "-")
      .replace(/[^a-z0-9-]/g, "");

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
  const mainVehicleSize = normaliseSize(
    vehicle?.frontTyreSize || vehicle?.tyreSize || search
  );

  const isStaggered = Boolean(frontSize && rearSize && frontSize !== rearSize);

  const frontTyres = useMemo(() => {
    if (!frontSize) return [];

    return tyres
      .filter((tyre) => normaliseSize(getSize(tyre)) === frontSize)
      .sort((a, b) => getPrice(a) - getPrice(b));
  }, [frontSize]);

  const rearTyres = useMemo(() => {
    if (!rearSize) return [];

    return tyres
      .filter((tyre) => normaliseSize(getSize(tyre)) === rearSize)
      .sort((a, b) => getPrice(a) - getPrice(b));
  }, [rearSize]);

  const filteredTyres = useMemo(() => {
    let list = tyres;

    if (mainVehicleSize && !isStaggered) {
      list = list.filter((tyre) => {
        const tyreSize = normaliseSize(getSize(tyre));
        return tyreSize === mainVehicleSize;
      });
    }

    if (search && !vehicle && !isStaggered) {
      const term = normaliseSize(search);

      list = tyres.filter((tyre) => {
        const text = normaliseSize(`
          ${tyre.Title || ""}
          ${tyre.Brand || ""}
          ${tyre.Model || ""}
          ${getSize(tyre)}
        `);

        return text.includes(term);
      });
    }

    if (sortBy === "priceAsc") {
      list = [...list].sort((a, b) => getPrice(a) - getPrice(b));
    }

    if (sortBy === "priceDesc") {
      list = [...list].sort((a, b) => getPrice(b) - getPrice(a));
    }

    return list;
  }, [search, vehicle, isStaggered, mainVehicleSize, sortBy]);

  const visibleTyres = filteredTyres.slice(0, visibleCount);

  const openTyre = (tyre, axle = "") => {
    const query = vehicle?.vrm
      ? `?vrm=${vehicle.vrm}${axle ? `&axle=${axle}` : ""}`
      : "";

    navigate(`/tyres/${makeSlug(tyre.Title)}${query}`, {
      state: { tyre, axle, vehicle },
    });
  };

  const vehicleTitle = vehicle
    ? `${vehicle.make || ""} ${vehicle.model || ""}`.trim()
    : "Find Your Tyres";

  const displaySize =
    vehicle?.frontTyreSize || vehicle?.tyreSize || search || "Enter tyre size";

  const renderTyreCard = (tyre, index, axle = "") => {
    const size = getSize(tyre);
    const price = getPrice(tyre);
    const qty = Number(tyre.Quantity || 0);

    return (
      <article className="tsrCardLong" key={`${axle}-${tyre.Title}-${index}`}>
        <div className="tsrRibbon">
          {axle ? `${axle.toUpperCase()} FITTED` : "FULLY FITTED"}
        </div>

        <div className="tsrImageBox">
          <div className={qty <= 1 ? "tsrStockBadge low" : "tsrStockBadge"}>
            {qty > 0 ? `${qty} available` : "Check stock"}
          </div>

          <div className="tsrTagBadge">
            {axle ? `${axle} axle` : "Budget Option"}
          </div>

          <img src={tyre["Image URL"]} alt={tyre.Title} />
        </div>

        <div className="tsrTyreInfo">
          <h3>{tyre.Brand}</h3>
          <p>{tyre.Model}</p>

          <div className="tsrTyreSizeLine">
            {size}
            {tyre.Reinforced && <span>{tyre.Reinforced}</span>}
          </div>

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

        <div className="tsrPricePanel">
          <small>
            {axle
              ? `${axle.toUpperCase()} axle fitted at Tyremen Hull`
              : "Fully fitted at Tyremen Hull"}
          </small>

          <strong>£{price.toFixed(2)}</strong>

          <button onClick={() => openTyre(tyre, axle)}>View Tyre →</button>
        </div>
      </article>
    );
  };

  return (
    <div className="tsrPage">
      <Header />

      <section className="tsrVehicleHero">
        {vehicle?.image && (
          <div className="tsrVehicleHeroImage">
            <img src={vehicle.image} alt={vehicleTitle} />
          </div>
        )}

        <div className="tsrVehicleHeroText">
          <h1>{vehicleTitle}</h1>

          <p>
            {vehicle?.year && <>{vehicle.year} <span>•</span> </>}
            {vehicle?.fuel && <>{vehicle.fuel} <span>•</span> </>}
            Tyre size: <strong>{displaySize}</strong>
          </p>
        </div>
      </section>

      {loadingVehicle && (
        <div className="tsrVehicleLoading">Loading vehicle...</div>
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

      {!vehicle && (
        <div className="tsrSearchWrap">
          <input
            type="text"
            placeholder="Search by size, brand or pattern..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setVisibleCount(20);
            }}
          />
        </div>
      )}

      <section className="tsrSizePanel">
        <div className="tsrSizeLeft">
          <div>
            <span>Your tyre size</span>
            <h2>{displaySize}</h2>
          </div>
        </div>

        <div className="tsrTrustGrid">
          <div>✅ Fully fitted price</div>
          <div>🏁 Hull fitting centre</div>
          <div>🛡️ Over 55 years trusted</div>
          <div>☎ 01482 328800</div>
        </div>
      </section>

      {isStaggered ? (
        <>
          <section className="tsrIntro">
            <div>
              <h2>
                Front tyres found: <strong>{frontTyres.length}</strong>
              </h2>
              <p>Front axle size: {vehicle.frontTyreSize}</p>
            </div>
          </section>

          <section className="tsrList">
            {frontTyres.map((tyre, index) =>
              renderTyreCard(tyre, index, "front")
            )}
          </section>

          <section className="tsrIntro">
            <div>
              <h2>
                Rear tyres found: <strong>{rearTyres.length}</strong>
              </h2>
              <p>Rear axle size: {vehicle.rearTyreSize}</p>
            </div>
          </section>

          <section className="tsrList">
            {rearTyres.map((tyre, index) =>
              renderTyreCard(tyre, index, "rear")
            )}
          </section>
        </>
      ) : (
        <>
          <section className="tsrIntro">
            <div>
              <h2>
                {filteredTyres.length} tyres found for{" "}
                <strong>{displaySize}</strong>
              </h2>
              <p>All prices include fitting, VAT, valve and balance.</p>
            </div>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="priceAsc">Sort by: Price low to high</option>
              <option value="priceDesc">Sort by: Price high to low</option>
            </select>
          </section>

          {filteredTyres.length === 0 && (
            <p className="tsrNoTyres">
              No tyres found for {displaySize}. Call us on 01482 328800.
            </p>
          )}

          <section className="tsrList">
            {visibleTyres.map((tyre, index) => renderTyreCard(tyre, index))}
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

      <section className="tsrFittingStrip">
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
    </div>
  );
}