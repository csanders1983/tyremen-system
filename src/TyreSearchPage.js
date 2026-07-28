import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./components/Footer";
import tyresJson from "./data/tyres.json";
import "./TyreSearchPage.css";

const MIDAS_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:5001/tyremen-system/us-central1/midasTyreSearch"
    : "https://us-central1-tyremen-system.cloudfunctions.net/midasTyreSearch";

export default function TyreSearchPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);
  const [vehicle, setVehicle] = useState(null);
  const [midasTyres, setMidasTyres] = useState([]);
  const [loadingVehicle, setLoadingVehicle] = useState(false);
  const [loadingTyres, setLoadingTyres] = useState(false);

  const [sortBy, setSortBy] = useState("priceAsc");
  const [brandFilter, setBrandFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [speedFilter, setSpeedFilter] = useState("");
  const [stockNowOnly, setStockNowOnly] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const vrm = params.get("vrm");

  const normaliseSize = (size) =>
    String(size || "")
      .toUpperCase()
      .replace(/\s/g, "")
      .replace("-", "/")
      .replace("ZR", "R");

  const cleanText = (value) =>
    String(value || "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

  const getSize = (tyre) => {
    if (tyre.size) return String(tyre.size).replace(/\s/g, "");
    return `${tyre.Width || ""}/${tyre["Aspect Ratio"] || ""}R${tyre.Rim || ""}`;
  };

  const getPrice = (tyre) => {
    if (tyre.pricing?.retail) return Number(tyre.pricing.retail);
    const cost = Number(tyre.Price || 0);
    return (cost + 25) * 1.2;
  };

  const getQty = (tyre) => {
    if (tyre.stock?.available !== undefined) return Number(tyre.stock.available);
    return Number(tyre.Quantity || 0);
  };

  const getBrand = (tyre) => tyre.brand || tyre.Brand || "";
  const getModel = (tyre) => tyre.pattern || tyre.Model || "";
  const getImage = (tyre) => tyre.images?.tyre || tyre["Image URL"] || "";
  const getBrandLogo = (tyre) => tyre.images?.brand || "";
  const getSpeed = (tyre) => tyre.speedRating || tyre["Speed Rating"] || "";
  const isLocalTyre = (tyre) => !tyre.pricing;

  const getTitle = (tyre) =>
    `${getBrand(tyre)} ${getModel(tyre)} ${getSize(tyre)}`.trim();

  const makeSlug = (title) =>
    String(title || "")
      .toLowerCase()
      .replaceAll("/", "-")
      .replaceAll(" ", "-")
      .replace(/[^a-z0-9-]/g, "");

  async function searchLiveTyres(size) {
    const match = normaliseSize(size).match(/(\d+)\/(\d+)R(\d+)/);
    if (!match) return [];

    const url = `${MIDAS_URL}?width=${match[1]}&profile=${match[2]}&rim=${match[3]}`;
    const res = await fetch(url);
    const data = await res.json();

    return data.success ? data.tyres || [] : [];
  }

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
          const foundVehicle = data.vehicle;
          setVehicle(foundVehicle);

          const front = foundVehicle?.frontTyreSize;
          const rear = foundVehicle?.rearTyreSize;
          const main = foundVehicle?.tyreSize;

          if (front && rear) {
            setSearch(front === rear ? front : "");
          } else if (main) {
            setSearch(main);
          }

          setLoadingTyres(true);

          let live = [];

          if (front && rear && front !== rear) {
            const frontResults = await searchLiveTyres(front);
            const rearResults = await searchLiveTyres(rear);
            live = [...frontResults, ...rearResults];
          } else {
            live = await searchLiveTyres(front || main);
          }

          setMidasTyres(live);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingVehicle(false);
        setLoadingTyres(false);
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

  const sourceTyres = useMemo(() => {
    const csvTyresForSize = mainVehicleSize
      ? tyresJson.filter(
          (csvTyre) => normaliseSize(getSize(csvTyre)) === mainVehicleSize
        )
      : tyresJson;

    const midasTyresForSize = mainVehicleSize
      ? midasTyres.filter(
          (midasTyre) => normaliseSize(getSize(midasTyre)) === mainVehicleSize
        )
      : midasTyres;

    const tyreAlreadyInCsv = (midasTyre) => {
      return csvTyresForSize.some((csvTyre) => {
        const sameSize =
          normaliseSize(getSize(csvTyre)) === normaliseSize(getSize(midasTyre));

        const sameBrand =
          cleanText(csvTyre.Brand) === cleanText(midasTyre.brand);

        const csvModel = cleanText(csvTyre.Model);
        const midasPattern = cleanText(midasTyre.pattern);

        const similarPattern =
          csvModel &&
          midasPattern &&
          (midasPattern.includes(csvModel) || csvModel.includes(midasPattern));

        return sameSize && sameBrand && similarPattern;
      });
    };

    const midasOnly = midasTyresForSize.filter(
      (midasTyre) => !tyreAlreadyInCsv(midasTyre)
    );

    return [...csvTyresForSize, ...midasOnly];
  }, [mainVehicleSize, midasTyres]);

  const brandOptions = useMemo(
    () => [...new Set(sourceTyres.map(getBrand).filter(Boolean))].sort(),
    [sourceTyres]
  );

  const modelOptions = useMemo(
    () => [...new Set(sourceTyres.map(getModel).filter(Boolean))].sort(),
    [sourceTyres]
  );

  const speedOptions = useMemo(
    () => [...new Set(sourceTyres.map(getSpeed).filter(Boolean))].sort(),
    [sourceTyres]
  );

  const filteredTyres = useMemo(() => {
    let list = [...sourceTyres];

    if (brandFilter) {
      list = list.filter((tyre) => getBrand(tyre) === brandFilter);
    }

    if (modelFilter) {
      list = list.filter((tyre) => getModel(tyre) === modelFilter);
    }

    if (speedFilter) {
      list = list.filter((tyre) => getSpeed(tyre) === speedFilter);
    }

    if (stockNowOnly) {
      list = list.filter((tyre) => isLocalTyre(tyre) && getQty(tyre) > 0);
    }

    if (search && !vehicle && !isStaggered) {
      const term = normaliseSize(search);
      list = list.filter((tyre) => {
        const text = normaliseSize(`
          ${getTitle(tyre)}
          ${getBrand(tyre)}
          ${getModel(tyre)}
          ${getSize(tyre)}
        `);

        return text.includes(term);
      });
    }

    list.sort((a, b) => {
      const aLocal = isLocalTyre(a);
      const bLocal = isLocalTyre(b);

      if (aLocal && !bLocal) return -1;
      if (!aLocal && bLocal) return 1;

      if (sortBy === "priceDesc") return getPrice(b) - getPrice(a);
      return getPrice(a) - getPrice(b);
    });

    return list;
  }, [
    sourceTyres,
    brandFilter,
    modelFilter,
    speedFilter,
    stockNowOnly,
    search,
    vehicle,
    isStaggered,
    sortBy,
  ]);

  const frontTyres = useMemo(() => {
    if (!frontSize) return [];
    return filteredTyres.filter(
      (tyre) => normaliseSize(getSize(tyre)) === frontSize
    );
  }, [filteredTyres, frontSize]);

  const rearTyres = useMemo(() => {
    if (!rearSize) return [];
    return filteredTyres.filter(
      (tyre) => normaliseSize(getSize(tyre)) === rearSize
    );
  }, [filteredTyres, rearSize]);

  const visibleTyres = filteredTyres.slice(0, visibleCount);

  const localStockCount = sourceTyres
    .filter((tyre) => isLocalTyre(tyre))
    .reduce((total, tyre) => total + getQty(tyre), 0);

  const vehicleTitle = vehicle
    ? `${vehicle.make || ""} ${vehicle.model || ""}`.trim()
    : "Find Your Tyres";

  const displaySize =
    vehicle?.frontTyreSize || vehicle?.tyreSize || search || "Enter tyre size";

  const openTyre = (tyre, axle = "") => {
    const query = vehicle?.vrm
      ? `?vrm=${vehicle.vrm}${axle ? `&axle=${axle}` : ""}`
      : "";

    navigate(`/tyres/${makeSlug(getTitle(tyre))}${query}`, {
      state: { tyre, axle, vehicle },
    });
  };

  const TyreCard = ({ tyre, index, axle = "" }) => {
    const local = isLocalTyre(tyre);
    const qty = getQty(tyre);
    const price = getPrice(tyre);
    const brandLogo = getBrandLogo(tyre);
    const image = getImage(tyre);

    return (
      <article
        className={`v2TyreCard ${local ? "local" : "supplier"}`}
        key={`${axle}-${getTitle(tyre)}-${index}`}
      >
        <div className="v2StockPanel">
          <span>{local ? "IN STOCK" : "SUPPLIER STOCK"}</span>
          <strong>{qty}</strong>
          <small>AVAILABLE</small>
          <em>{local ? "FIT TODAY" : "TODAY"}</em>
        </div>

        <div className="v2ImagePanel">
          {image && <img src={image} alt={getTitle(tyre)} />}
        </div>

        <div className="v2InfoPanel">
          {brandLogo && <img className="v2BrandLogo" src={brandLogo} alt="" />}

          <h3>{getBrand(tyre)}</h3>
          <p>{getModel(tyre)}</p>

          <div className="v2Chips">
            <span>{getSize(tyre)}</span>
            <span>{tyre.loadSpeed || tyre["Load Index"] || "-"}</span>
            {(tyre.extraLoad || tyre.Reinforced) && <span>XL</span>}
            {tyre.runFlat && <span>Run Flat</span>}
          </div>

          <div className="v2Labels">
            <span>☀ {tyre.season || "Summer"}</span>
            <span>Fuel {tyre.labels?.fuel || tyre["Rolling Resistance"] || "-"}</span>
            <span>Wet {tyre.labels?.wetGrip || tyre["Wet Grip"] || "-"}</span>
            <span>
              Noise{" "}
              {tyre.labels?.noise ||
                (tyre["Noise Performance"]
                  ? `${tyre["Noise Performance"]} dB`
                  : "-")}
            </span>
          </div>
        </div>

        <div className="v2Availability">
          <strong>{local ? "In Our Workshop" : "Available Today"}</strong>
          <span>{local ? "Fit today • No waiting" : "From our supplier"}</span>
          <small>
            {qty} tyres {local ? "in stock" : "available"}
          </small>
          <em>{local ? "Collect or fit today" : "Order before 3pm"}</em>
        </div>

        <div className="v2BuyPanel">
          <strong>£{price.toFixed(2)}</strong>
          <small>FULLY FITTED</small>
          <button className="v2BuyNow" onClick={() => openTyre(tyre, axle)}>
            BUY NOW
          </button>
          <button className="v2Need" onClick={() => setStockNowOnly(true)}>
            NEED IT TODAY?
          </button>
          <button className="v2Details" onClick={() => openTyre(tyre, axle)}>
            VIEW DETAILS
          </button>
        </div>
      </article>
    );
  };

  const FilterBar = () => (
    <section className="v2FilterBar">
      <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}>
        <option value="">Brands</option>
        {brandOptions.map((brand) => (
          <option key={brand} value={brand}>
            {brand}
          </option>
        ))}
      </select>

      <select value={modelFilter} onChange={(e) => setModelFilter(e.target.value)}>
        <option value="">Model</option>
        {modelOptions.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>

      <select value={speedFilter} onChange={(e) => setSpeedFilter(e.target.value)}>
        <option value="">Speed</option>
        {speedOptions.map((speed) => (
          <option key={speed} value={speed}>
            {speed}
          </option>
        ))}
      </select>

      <button
        className={stockNowOnly ? "active" : ""}
        onClick={() => setStockNowOnly((prev) => !prev)}
      >
        Need a tyre now
      </button>

      {stockNowOnly && <strong>Showing stock now</strong>}

      <div className="v2Sort">
        <span>Sort by:</span>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="priceAsc">Price: Low to High</option>
          <option value="priceDesc">Price: High to Low</option>
        </select>
      </div>
    </section>
  );

  return (
    <div className="v2Page">
      <section className="v2TodayHero">
        <div>
          <h1>
            NEED A TYRE <span>TODAY?</span>
          </h1>
          <p>We have tyres in stock and ready to fit at Tyremen Hull.</p>

          <div className="v2HeroStats">
            <div>✅ {localStockCount} tyres in stock now</div>
            <div>⏱ Same-day fitting available</div>
            <div>☎ Call 01482 328800 or book online</div>
          </div>
        </div>
      </section>

      <section className="v2VehicleStrip">
        <div className="v2VehicleImage">
          {vehicle?.image && <img src={vehicle.image} alt={vehicleTitle} />}
        </div>

        <div className="v2VehicleInfo">
          <span>YOUR VEHICLE</span>
          <h2>{vehicleTitle}</h2>
          <p>
            {vehicle?.year && <>{vehicle.year} • </>}
            {vehicle?.fuel && <>{vehicle.fuel} • </>}
            Tyre size: <strong>{displaySize}</strong>
          </p>
        </div>

        <button onClick={() => navigate("/")}>CHANGE VEHICLE</button>
      </section>

      {loadingVehicle && <div className="v2Loading">Loading vehicle...</div>}
      {loadingTyres && <div className="v2Loading">Searching live stock...</div>}

      <FilterBar />

      <section className="v2Intro">
        <div>
          <h2>
            {filteredTyres.length} TYRES FOUND FOR <span>{displaySize}</span>
          </h2>
          <p>All prices include fitting, VAT, valve and balance.</p>
        </div>
      </section>

      {filteredTyres.length === 0 && (
        <p className="v2NoTyres">
          No tyres found for {displaySize}. Call us on 01482 328800.
        </p>
      )}

      {isStaggered ? (
        <>
          <section className="v2Intro small">
            <h2>
              Front tyres found: <span>{frontTyres.length}</span>
            </h2>
            <p>Front axle size: {vehicle.frontTyreSize}</p>
          </section>

          <section className="v2List">
            {frontTyres.map((tyre, index) => (
              <TyreCard tyre={tyre} index={index} axle="front" key={`f-${index}`} />
            ))}
          </section>

          <section className="v2Intro small">
            <h2>
              Rear tyres found: <span>{rearTyres.length}</span>
            </h2>
            <p>Rear axle size: {vehicle.rearTyreSize}</p>
          </section>

          <section className="v2List">
            {rearTyres.map((tyre, index) => (
              <TyreCard tyre={tyre} index={index} axle="rear" key={`r-${index}`} />
            ))}
          </section>
        </>
      ) : (
        <>
          <section className="v2List">
            {visibleTyres.map((tyre, index) => (
              <TyreCard tyre={tyre} index={index} key={index} />
            ))}
          </section>

          {visibleCount < filteredTyres.length && (
            <div className="v2LoadMore">
              <button onClick={() => setVisibleCount((prev) => prev + 20)}>
                Load More Tyres
              </button>
            </div>
          )}
        </>
      )}

      <section className="v2Benefits">
        <div>🛡 Price includes fitting, balancing, valve & disposal</div>
        <div>🏆 Best price guarantee</div>
        <div>📅 Same-day fitting on stock items</div>
        <div>🎧 Expert advice: 01482 328800</div>
      </section>

      <Footer />
    </div>
  );
}