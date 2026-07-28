import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./components/Footer";
import tyresJson from "./data/tyres.json";
import "./TyreSearchPage.css";

const MIDAS_URL =
  "http://127.0.0.1:5001/tyremen-system/us-central1/midasTyreSearch";

export default function TyreSearchPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);
  const [vehicle, setVehicle] = useState(null);
  const [tyres, setTyres] = useState([]);
  const [loadingTyres, setLoadingTyres] = useState(false);
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

  const normaliseSize = (size) =>
    String(size || "")
      .toUpperCase()
      .replace(/\s/g, "")
      .replace("-", "/")
      .replace("ZR", "R");

  const getSize = (tyre) => {
    if (tyre.size) return tyre.size.replace(" ", "");
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
  const getTitle = (tyre) =>
    `${getBrand(tyre)} ${getModel(tyre)} ${getSize(tyre)}`.trim();

  async function searchLiveTyres(size) {
  const match = normaliseSize(size).match(/(\d+)\/(\d+)R(\d+)/);
  if (!match) return [];

  const url = `${MIDAS_URL}?width=${match[1]}&profile=${match[2]}&rim=${match[3]}`;

  console.log("MIDAS SEARCH URL:", url);

  const res = await fetch(url);
  const data = await res.json();

  console.log("MIDAS RESULT:", data);

  setLiveTried(true);

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

          let liveTyres = [];

          if (front && rear && front !== rear) {
            const frontResults = await searchLiveTyres(front);
            const rearResults = await searchLiveTyres(rear);
            liveTyres = [...frontResults, ...rearResults];
          } else {
            liveTyres = await searchLiveTyres(front || main);
          }

          setTyres(liveTyres);
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

  const [liveTried, setLiveTried] = useState(false);

  const frontSize = normaliseSize(vehicle?.frontTyreSize);
  const rearSize = normaliseSize(vehicle?.rearTyreSize);
  const mainVehicleSize = normaliseSize(
    vehicle?.frontTyreSize || vehicle?.tyreSize || search
  );

  const isStaggered = Boolean(frontSize && rearSize && frontSize !== rearSize);

  const csvTyresForSize = tyresJson.filter(
  (csvTyre) => normaliseSize(getSize(csvTyre)) === mainVehicleSize
);

const midasTyresForSize = tyres.filter(
  (midasTyre) => normaliseSize(getSize(midasTyre)) === mainVehicleSize
);

const cleanText = (value) =>
  String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

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

const midasOnlyTyres = midasTyresForSize.filter(
  (midasTyre) => !tyreAlreadyInCsv(midasTyre)
);

const sourceTyres = [...csvTyresForSize, ...midasOnlyTyres];

  const frontTyres = useMemo(() => {
    if (!frontSize) return [];
    return sourceTyres
      .filter((tyre) => normaliseSize(getSize(tyre)) === frontSize)
      .sort((a, b) => getPrice(a) - getPrice(b));
  }, [frontSize, sourceTyres]);

  const rearTyres = useMemo(() => {
    if (!rearSize) return [];
    return sourceTyres
      .filter((tyre) => normaliseSize(getSize(tyre)) === rearSize)
      .sort((a, b) => getPrice(a) - getPrice(b));
  }, [rearSize, sourceTyres]);

  const filteredTyres = useMemo(() => {
    let list = sourceTyres;

    if (mainVehicleSize && !isStaggered && tyres.length === 0) {
      list = list.filter(
        (tyre) => normaliseSize(getSize(tyre)) === mainVehicleSize
      );
    }

    if (search && !vehicle && !isStaggered) {
      const term = normaliseSize(search);

      list = sourceTyres.filter((tyre) => {
        const text = normaliseSize(`
          ${getTitle(tyre)}
          ${getBrand(tyre)}
          ${getModel(tyre)}
          ${getSize(tyre)}
        `);

        return text.includes(term);
      });
    }

    list = [...list].sort((a, b) => {
  const aIsCsv = !a.pricing;
  const bIsCsv = !b.pricing;

  // Always put Tyremen stock first
  if (aIsCsv && !bIsCsv) return -1;
  if (!aIsCsv && bIsCsv) return 1;

  // Then sort by price
  if (sortBy === "priceDesc") {
    return getPrice(b) - getPrice(a);
  }

  return getPrice(a) - getPrice(b);
});

    return list;
  }, [search, vehicle, isStaggered, mainVehicleSize, sortBy, sourceTyres]);

  const visibleTyres = filteredTyres.slice(0, visibleCount);

  const openTyre = (tyre, axle = "") => {
    const query = vehicle?.vrm
      ? `?vrm=${vehicle.vrm}${axle ? `&axle=${axle}` : ""}`
      : "";

    navigate(`/tyres/${makeSlug(getTitle(tyre))}${query}`, {
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
    const qty = getQty(tyre);
    const brand = getBrand(tyre);
    const model = getModel(tyre);
    const image = getImage(tyre);

    return (
      <article className="tsrCardLong" key={`${axle}-${getTitle(tyre)}-${index}`}>
        <div className="tsrRibbon">
          {axle ? `${axle.toUpperCase()} FITTED` : "FULLY FITTED"}
        </div>

        <div className="tsrImageBox">
          <div className={qty <= 1 ? "tsrStockBadge low" : "tsrStockBadge"}>
            {!tyre.pricing ? (
  <div className="tsrTagBadge">In stock Today</div>
) : (
  <div className="tsrTagBadge">Fitting Next Day</div>
)}
            {qty > 0 ? `${qty} available` : "Check stock"}
          </div>

          
          

          {image && <img src={image} alt={getTitle(tyre)} />}
        </div>

        <div className="tsrTyreInfo">
          <h3>{brand}</h3>
          <p>{model}</p>

          <div className="tsrTyreSizeLine">
            <div className="tsrMiniBadges">
  <span>{tyre.season || "Summer"}</span>
  {tyre.pricing ? <span>Supplier Stock</span> : <span>Fit Today</span>}
</div>
            {size}
            {(tyre.extraLoad || tyre.Reinforced) && <span>XL</span>}
            {tyre.runFlat && <span>Run Flat</span>}
          </div>

          <div className="tsrSpecs">
            <span>Load {tyre.loadSpeed || tyre["Load Index"] || "-"}</span>
            <span>Speed {tyre.speedRating || tyre["Speed Rating"] || "-"}</span>
            <span>Wet {tyre.labels?.wetGrip || tyre["Wet Grip"] || "-"}</span>
            <span>Fuel {tyre.labels?.fuel || tyre["Rolling Resistance"] || "-"}</span>
            <span>
              Noise{" "}
              {tyre.labels?.noise ||
                (tyre["Noise Performance"]
                  ? `${tyre["Noise Performance"]} dB`
                  : "-")}
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
      <section className="tsrVehicleHero">
        {vehicle?.image && (
          <div className="tsrVehicleHeroImage">
            <img src={vehicle.image} alt={vehicleTitle} />
          </div>
        )}

        <div className="tsrVehicleHeroText">
          <h1>{vehicleTitle}</h1>

          <p>
            {vehicle?.year && (
              <>
                {vehicle.year} <span>•</span>{" "}
              </>
            )}
            {vehicle?.fuel && (
              <>
                {vehicle.fuel} <span>•</span>{" "}
              </>
            )}
            Tyre size: <strong>{displaySize}</strong>
          </p>
        </div>
      </section>

      {loadingVehicle && (
        <div className="tsrVehicleLoading">Loading vehicle...</div>
      )}

      {loadingTyres && (
        <div className="tsrVehicleLoading">Searching live stock...</div>
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
          <div>✅ Hull fitting centre</div>
          <div>✅ Over 55 years trusted</div>
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
<pre style={{ color: "white", background: "black", padding: "20px" }}>
  tyres: {tyres.length}
  {"\n"}sourceTyres: {sourceTyres.length}
  {"\n"}filteredTyres: {filteredTyres.length}
  {"\n"}displaySize: {displaySize}
  {"\n"}mainVehicleSize: {mainVehicleSize}
</pre>

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

      <Footer />
    </div>
  );
}