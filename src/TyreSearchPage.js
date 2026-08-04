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
  const [enlargedImage, setEnlargedImage] = useState(null);
  
  const [manualWidth, setManualWidth] = useState("");
  const [manualProfile, setManualProfile] = useState("");
  const [manualRim, setManualRim] = useState("");
  const [manualSearchActive, setManualSearchActive] = useState(false);

  const [runFlatFilter, setRunFlatFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [seasonFilter, setSeasonFilter] = useState("");
  const [manualSearchOpen, setManualSearchOpen] = useState(false);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);

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
  if (!tyre) return "";

  if (tyre.size) {
    return String(tyre.size).replace(/\s/g, "");
  }

  return `${tyre.Width || ""}/${tyre["Aspect Ratio"] || ""}R${tyre.Rim || ""}`;
};

 const isTyremenRecommended = (tyre) =>
  cleanText(getBrand(tyre)) === "DAVANTI" &&
  isLocalTyre(tyre) &&
  getQty(tyre) > 0;

  const VAT_RATE = 1.2;
const WEBSITE_DISCOUNT = 0.12;

const getTyreCost = (tyre) => {
  if (tyre?.pricing?.cost !== undefined) {
    return Number(tyre.pricing.cost);
  }

  return Number(tyre?.Price || 0);
};

const getMarkup = (cost) => {
  if (cost <= 20) return 30;
  if (cost <= 39) return 35;
  if (cost <= 50) return 47;
  if (cost <= 99) return 46;

  return 47;
};

// Original retail price (before website discount)
const getOriginalPrice = (tyre) => {
  const cost = getTyreCost(tyre);
  const markup = getMarkup(cost);

  return (cost + markup) * VAT_RATE;
};

// Website selling price (12% off)
const getPrice = (tyre) => {
  const originalPrice = getOriginalPrice(tyre);

  return originalPrice * (1 - WEBSITE_DISCOUNT);
};

  const getQty = (tyre) => {
    if (tyre.stock?.available !== undefined) return Number(tyre.stock.available);
    return Number(tyre.Quantity || 0);
  };

  const getBrand = (tyre) =>
  tyre?.brand ||
  tyre?.Brand ||
  "";
  const getModel = (tyre) =>
  tyre?.pattern ||
  tyre?.Model ||
  "";
  const getImage = (tyre) =>
  tyre?.images?.tyre ||
  tyre?.["Image URL"] ||
  "";

const getBrandLogo = (tyre) =>
  tyre?.images?.brand ||
  "";
  const getSpeed = (tyre) =>
  tyre?.speedRating ||
  tyre?.["Speed Rating"] ||
  "";

  const isLocalTyre = (tyre) => !tyre.pricing;

  const getLoadSpeed = (tyre) => {
    if (tyre.loadSpeed) return String(tyre.loadSpeed).trim();

    const load = tyre.loadIndex || tyre["Load Index"] || "";
    const speed = getSpeed(tyre);

    return `${load}${speed}`.trim();
  };

  const isExtraLoad = (tyre) =>
    Boolean(tyre.extraLoad || tyre.Reinforced || tyre.reinforced);

  const getSeasonClass = (season) => {
    const value = String(season || "Summer").toLowerCase();
    if (value.includes("winter")) return "winter";
    if (value.includes("all")) return "all-season";
    return "summer";
  };

  const getLabelClass = (value) => {
    const rating = String(value || "").trim().toUpperCase();
    if (["A", "B"].includes(rating)) return "good";
    if (["C", "D"].includes(rating)) return "average";
    if (["E", "F", "G"].includes(rating)) return "poor";
    return "neutral";
  };

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

  async function handleManualSearch(e) {
  e.preventDefault();

  if (!manualWidth || !manualProfile || !manualRim) {
    return;
  }

  const selectedSize = `${manualWidth}/${manualProfile}R${manualRim}`;

  setSearch(selectedSize);
  setManualSearchActive(true);
  setManualSearchOpen(false);
  setVisibleCount(20);

  try {
    setLoadingTyres(true);

    const liveResults = await searchLiveTyres(selectedSize);
    setMidasTyres(liveResults);
  } catch (error) {
    console.error("Manual tyre search failed:", error);
    setMidasTyres([]);
  } finally {
    setLoadingTyres(false);
  }
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
          setManualSearchActive(false);
          setSearch(foundVehicle?.frontTyreSize || foundVehicle?.tyreSize || "");
          setManualWidth("");
          setManualProfile("");
          setManualRim("");

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
  const mainVehicleSize = manualSearchActive
  ? normaliseSize(search)
  : normaliseSize(
      vehicle?.frontTyreSize || vehicle?.tyreSize || search
    );

  const isStaggered = Boolean(
  !manualSearchActive &&
  frontSize &&
  rearSize &&
  frontSize !== rearSize
);

  const sourceTyres = useMemo(() => {
  const csvTyresForSize = mainVehicleSize
    ? tyresJson.filter(
        (csvTyre) =>
          normaliseSize(getSize(csvTyre)) === mainVehicleSize
      )
    : tyresJson;

  const midasTyresForSize = mainVehicleSize
    ? midasTyres.filter(
        (midasTyre) =>
          normaliseSize(getSize(midasTyre)) === mainVehicleSize
      )
    : midasTyres;

  const sameBrand = (a, b) =>
    cleanText(getBrand(a)) === cleanText(getBrand(b));

  const sameSize = (a, b) =>
    normaliseSize(getSize(a)) === normaliseSize(getSize(b));

  const modelsAreSimilar = (a, b) => {
    const modelA = cleanText(getModel(a));
    const modelB = cleanText(getModel(b));

    if (!modelA || !modelB) return false;

    return (
      modelA === modelB ||
      modelA.includes(modelB) ||
      modelB.includes(modelA)
    );
  };

  const enrichedCsvTyres = csvTyresForSize.map((csvTyre) => {
    // Logo only needs the same brand.
    const brandMatch = midasTyresForSize.find(
      (midasTyre) =>
        sameBrand(csvTyre, midasTyre) &&
        Boolean(getBrandLogo(midasTyre))
    );

    // Tyre image should use brand + size, with model preferred.
    const exactImageMatch = midasTyresForSize.find(
      (midasTyre) =>
        sameBrand(csvTyre, midasTyre) &&
        sameSize(csvTyre, midasTyre) &&
        modelsAreSimilar(csvTyre, midasTyre) &&
        Boolean(getImage(midasTyre))
    );

    // Fallback where MIDAS and CSV model descriptions differ.
    const sizeBrandImageMatch = midasTyresForSize.find(
      (midasTyre) =>
        sameBrand(csvTyre, midasTyre) &&
        sameSize(csvTyre, midasTyre) &&
        Boolean(getImage(midasTyre))
    );

    const imageMatch = exactImageMatch || sizeBrandImageMatch;

    return {
      ...csvTyre,

      images: {
        ...(csvTyre.images || {}),

        brand:
          getBrandLogo(csvTyre) ||
          getBrandLogo(brandMatch) ||
          "",

        tyre:
          getImage(csvTyre) ||
          getImage(imageMatch) ||
          "",
      },
    };
  });

  const tyreAlreadyInCsv = (midasTyre) =>
    csvTyresForSize.some(
      (csvTyre) =>
        sameBrand(csvTyre, midasTyre) &&
        sameSize(csvTyre, midasTyre) &&
        modelsAreSimilar(csvTyre, midasTyre)
    );

  const midasOnly = midasTyresForSize.filter(
    (midasTyre) => !tyreAlreadyInCsv(midasTyre)
  );

  return [...enrichedCsvTyres, ...midasOnly];
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

  const seasonOptions = useMemo(
    () => [...new Set(sourceTyres.map((tyre) => tyre.season || "Summer").filter(Boolean))].sort(),
    [sourceTyres]
  );

  const filteredTyres = useMemo(() => {
    let list = [...sourceTyres];
    
    if (runFlatFilter === "runflat") {
  list = list.filter((tyre) => Boolean(tyre.runFlat));
}

    if (runFlatFilter === "standard") {
      list = list.filter((tyre) => !tyre.runFlat);
    }

    if (availabilityFilter === "today") {
      list = list.filter(
       (tyre) => isLocalTyre(tyre) && getQty(tyre) > 0
    );
  }

if (availabilityFilter === "nextDay") {
  list = list.filter(
    (tyre) => !isLocalTyre(tyre) && getQty(tyre) > 0
  );
}
    
    if (seasonFilter) {
      list = list.filter(
        (tyre) => String(tyre.season || "Summer") === seasonFilter
      );
    }

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
      const aRecommended = isTyremenRecommended(a);
      const bRecommended = isTyremenRecommended(b);
      const aLocal = isLocalTyre(a);
      const bLocal = isLocalTyre(b);

      if (aRecommended && !bRecommended) return -1;
      if (!aRecommended && bRecommended) return 1;

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
  seasonFilter,
  runFlatFilter,
  availabilityFilter,
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

  const recommendedTyre = useMemo(
  () => filteredTyres.find((tyre) => isTyremenRecommended(tyre)) || null,
  [filteredTyres]
);

const remainingTyres = useMemo(() => {
  if (!recommendedTyre) return filteredTyres;

  return filteredTyres.filter((tyre) => tyre !== recommendedTyre);
}, [filteredTyres, recommendedTyre]);

const visibleTyres = remainingTyres.slice(0, visibleCount);

  const localStockCount = sourceTyres
    .filter((tyre) => isLocalTyre(tyre))
    .reduce((total, tyre) => total + getQty(tyre), 0);

  const vehicleTitle = vehicle
    ? `${vehicle.make || ""} ${vehicle.model || ""}`.trim()
    : "Find Your Tyres";

  const displaySize = manualSearchActive
  ? search
  : vehicle?.frontTyreSize ||
    vehicle?.tyreSize ||
    search ||
    "Enter tyre size";

  const activeFilters = [
    brandFilter && { label: `Brand: ${brandFilter}`, clear: () => setBrandFilter("") },
    modelFilter && { label: `Model: ${modelFilter}`, clear: () => setModelFilter("") },
    seasonFilter && { label: `Season: ${seasonFilter}`, clear: () => setSeasonFilter("") },
    speedFilter && { label: `Speed: ${speedFilter}`, clear: () => setSpeedFilter("") },
    runFlatFilter && {
      label: runFlatFilter === "runflat" ? "Run Flat" : "Standard Tyres",
      clear: () => setRunFlatFilter(""),
    },
    availabilityFilter && {
      label: availabilityFilter === "today" ? "In Stock Today" : "Supplier / Next Day",
      clear: () => setAvailabilityFilter(""),
    },
    stockNowOnly && { label: "Need It Today", clear: () => setStockNowOnly(false) },
  ].filter(Boolean);

  const clearAllFilters = () => {
    setBrandFilter("");
    setModelFilter("");
    setSeasonFilter("");
    setSpeedFilter("");
    setRunFlatFilter("");
    setAvailabilityFilter("");
    setStockNowOnly(false);
  };

  const openTyre = (tyre, axle = "") => {
    const query = vehicle?.vrm
      ? `?vrm=${vehicle.vrm}${axle ? `&axle=${axle}` : ""}`
      : "";

    navigate(`/tyres/${makeSlug(getTitle(tyre))}${query}`, {
      state: { tyre, axle, vehicle },
    });
  };

const FeaturedRecommendation = ({ tyre }) => {
  if (!tyre) return null;

  const qty = getQty(tyre);
  const price = getPrice(tyre);
  const image = getImage(tyre);
  const brandLogo = getBrandLogo(tyre);
  const loadSpeed = getLoadSpeed(tyre);

  const specification = [
    getSize(tyre),
    loadSpeed,
    isExtraLoad(tyre) ? "XL" : "",
    tyre.runFlat ? "Run Flat" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className="v2FeaturedRecommendation">
      <div className="v2FeaturedBadge">
        <span>★</span>

        <div>
          <small>TYREMEN’S</small>
          <strong>RECOMMENDED</strong>
        </div>
      </div>

      <button
        type="button"
        className="v2FeaturedImage"
        onClick={() =>
          image &&
          setEnlargedImage({
            src: image,
            alt: getTitle(tyre),
          })
        }
        disabled={!image}
        aria-label={`Enlarge ${getTitle(tyre)} image`}
      >
        {image && <img src={image} alt={getTitle(tyre)} />}
        {image && <span>Click to enlarge</span>}
      </button>

      <div className="v2FeaturedInfo">
        {brandLogo && (
          <img
            className="v2FeaturedLogo"
            src={brandLogo}
            alt={`${getBrand(tyre)} logo`}
          />
        )}

        <span className="v2FeaturedFitToday">
          AVAILABLE TO FIT TODAY
        </span>

        <h2>
          <strong>{specification}</strong>

          <span>
            {getBrand(tyre)}
            {getModel(tyre) ? ` ${getModel(tyre)}` : ""}
          </span>
        </h2>

        <div className="v2FeaturedBenefits">
          <span>✓ Mid-range quality</span>
          <span>✓ More mileage</span>
          <span>✓ Better fuel economy</span>
          <span>✓ Better wet grip</span>
        </div>

        <p>
          <strong>{qty}</strong> tyres physically in stock at Tyremen
        </p>
      </div>

      <div className="v2FeaturedBuy">
        <span>TYREMEN STOCK</span>

        <strong>£{price.toFixed(2)}</strong>

        <small>FULLY FITTED • VAT INCLUDED</small>

        <button
          type="button"
          onClick={() => openTyre(tyre)}
        >
          BOOK NOW
        </button>

        <em>Same-day fitting available</em>
      </div>
    </section>
  );
};

  const TyreCard = ({ tyre, index, axle = "" }) => {
    const local = isLocalTyre(tyre);
    const qty = getQty(tyre);
    const price = getPrice(tyre);
    const originalPrice = getOriginalPrice(tyre);
    const saving = originalPrice - price;
    const brandLogo = getBrandLogo(tyre);
    const image = getImage(tyre);
    const loadSpeed = getLoadSpeed(tyre);
    const season = tyre.season || "Summer";
    const fuel = tyre.labels?.fuel || tyre["Rolling Resistance"] || "-";
    const wet = tyre.labels?.wetGrip || tyre["Wet Grip"] || "-";
    const noise =
      tyre.labels?.noise ||
      (tyre["Noise Performance"]
        ? `${tyre["Noise Performance"]} dB`
        : "-");

    const specification = [
      getSize(tyre),
      loadSpeed,
      isExtraLoad(tyre) ? "XL" : "",
      tyre.runFlat ? "Run Flat" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <article
        className={`v2TyreCard ${local ? "local" : "supplier"}`}
        key={`${axle}-${getTitle(tyre)}-${index}`}
      >
        <div className="v2StockPanel">
          <span className="v2StockDot" aria-hidden="true" />
          <strong>{qty}</strong>
          <small>{local ? "FIT TODAY" : "NEXT DAY"}</small>
          <em>{local ? "IN STOCK" : "SUPPLIER"}</em>
        </div>

        <button
          type="button"
          className="v2ImagePanel"
          onClick={() => image && setEnlargedImage({ src: image, alt: getTitle(tyre) })}
          aria-label={`Enlarge ${getTitle(tyre)} image`}
          disabled={!image}
        >
          {image && <img src={image} alt={getTitle(tyre)} />}
          {image && <span className="v2ImageHint">Click to enlarge</span>}
        </button>

        <div className="v2InfoPanel">
          {brandLogo && (
            <img
              className="v2BrandLogo"
              src={brandLogo}
              alt={`${getBrand(tyre)} logo`}
            />
          )}
   
          

          <h3 className="v2TyreTitle">
            <span className="v2TyreSpecification">{specification}</span>{" "}
            <span className="v2TyreBrandModel">
              {getBrand(tyre)}{getModel(tyre) ? `, ${getModel(tyre)}` : ""}
            </span>
          </h3>

          <div className="v2Labels">
            <span className={`v2SeasonLabel ${getSeasonClass(season)}`}>
              {season}
            </span>
            <span className={`v2PerformanceLabel fuel ${getLabelClass(fuel)}`}>
              <small>FUEL</small>
              <strong>{fuel}</strong>
            </span>
            <span className={`v2PerformanceLabel wet ${getLabelClass(wet)}`}>
              <small>WET</small>
              <strong>{wet}</strong>
            </span>
            <span className="v2PerformanceLabel noise">
              <small>NOISE</small>
              <strong>{noise}</strong>
            </span>
          </div>
        </div>

        <div className="v2Availability">
          <strong>{local ? "Tyremen's Stock" : "Fitting Tomorrow"}</strong>
          <span>{local ? "Order Now • Fit Now" : "From our supplier"}</span>
          <em>{local ? "Physical Stock" : "Order before 3pm"}</em>
          <small>
            {qty} tyres {local ? "in stock" : "available"}
          </small>
        </div>

        <div className="v2BuyPanel">
  <span className="v2OnlinePrice">TYREMEN ONLINE PRICE</span>

  <div className="v2CompactPriceRow">
    <div>
      <span className="v2WasPrice">
        Was £{originalPrice.toFixed(2)}
      </span>

      <strong className="v2NowPrice">
        £{price.toFixed(2)}
      </strong>
    </div>

    <span className="v2Saving">
      Save £{saving.toFixed(2)}
    </span>
  </div>

  <div className="v2CompactIncluded">
    <span>✓ Fitting</span>
    <span>✓ Valve</span>
    <span>✓ Balance</span>
    <span>✓ Disposal</span>
    <span>✓ VAT</span>
  </div>

  <button
    className="v2BuyNow"
    onClick={() => openTyre(tyre, axle)}
  >
    BOOK NOW
  </button>

  <small className="v2FittingStatus">
    {local ? "Available to fit today" : "Available for next-day fitting"}
  </small>
</div>
      </article>
    );
  };

  const FilterBar = () => (
    <>
      <section className="v2FilterBar">
        <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}>
          <option value="">Brand</option>
          {brandOptions.map((brand) => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>

        <select value={modelFilter} onChange={(e) => setModelFilter(e.target.value)}>
          <option value="">Model</option>
          {modelOptions.map((model) => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>

        <select value={seasonFilter} onChange={(e) => setSeasonFilter(e.target.value)}>
          <option value="">Season</option>
          {seasonOptions.map((season) => (
            <option key={season} value={season}>{season}</option>
          ))}
        </select>

        <select
          value={availabilityFilter}
          onChange={(e) => setAvailabilityFilter(e.target.value)}
        >
          <option value="">Availability</option>
          <option value="today">Tyremen Stock Today</option>
          <option value="nextDay">Supplier / Next Day</option>
        </select>

        <button
          type="button"
          className={`v2AdvancedToggle ${advancedFiltersOpen ? "active" : ""}`}
          onClick={() => setAdvancedFiltersOpen((open) => !open)}
        >
          Advanced {advancedFiltersOpen ? "−" : "+"}
        </button>

        <div className="v2Sort">
          <span>Sort:</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
          </select>
        </div>

        {advancedFiltersOpen && (
          <div className="v2AdvancedFilters">
            <select value={speedFilter} onChange={(e) => setSpeedFilter(e.target.value)}>
              <option value="">Speed Rating</option>
              {speedOptions.map((speed) => (
                <option key={speed} value={speed}>{speed}</option>
              ))}
            </select>

            <select value={runFlatFilter} onChange={(e) => setRunFlatFilter(e.target.value)}>
              <option value="">Run Flat: All</option>
              <option value="runflat">Run Flat Only</option>
              <option value="standard">Standard Tyres</option>
            </select>

            <button
              type="button"
              className={stockNowOnly ? "active" : ""}
              onClick={() => setStockNowOnly((current) => !current)}
            >
              Need It Today
            </button>
          </div>
        )}
      </section>

      {activeFilters.length > 0 && (
        <section className="v2ActiveFilters" aria-label="Active tyre filters">
          <strong>Active filters:</strong>
          {activeFilters.map((filter) => (
            <button type="button" key={filter.label} onClick={filter.clear}>
              {filter.label} <span>×</span>
            </button>
          ))}
          <button type="button" className="v2ClearFilters" onClick={clearAllFilters}>
            Clear all
          </button>
        </section>
      )}
    </>
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

  <p className="v2VehicleMeta">
    {vehicle?.year && <>{vehicle.year}</>}
    {vehicle?.year && vehicle?.fuel && <> • </>}
    {vehicle?.fuel && <>{vehicle.fuel}</>}
  </p>

  {vehicle ? (
    <div
      className={`v2VehicleSizes ${
        manualSearchActive ? "manual-active" : ""
      }`}
    >
      <div className="v2VehicleSizeBox recommended">
        <small>RECOMMENDED SIZE</small>

        <strong>
          {vehicle?.frontTyreSize || vehicle?.tyreSize || "Not available"}
        </strong>
      </div>

      {manualSearchActive && (
        <div className="v2VehicleSizeBox manual">
          <small>CURRENTLY SEARCHING</small>
          <strong>{search}</strong>
        </div>
      )}

      {manualSearchActive && (
        <div className="v2ManualStatus">
          <span>MANUAL SEARCH ACTIVE</span>

          <p>
            You are viewing tyres for a manually entered size.
          </p>

          <button
            type="button"
            onClick={async () => {
              const recommendedSize =
                vehicle?.frontTyreSize || vehicle?.tyreSize || "";

              setManualSearchActive(false);
              setSearch(recommendedSize);
              setManualWidth("");
              setManualProfile("");
              setManualRim("");
              setVisibleCount(20);

              try {
                setLoadingTyres(true);

                const liveResults = await searchLiveTyres(recommendedSize);
                setMidasTyres(liveResults);
              } catch (error) {
                console.error("Vehicle tyre search failed:", error);
                setMidasTyres([]);
              } finally {
                setLoadingTyres(false);
              }
            }}
          >
            RETURN TO RECOMMENDED SIZE
          </button>
        </div>
      )}
    </div>
  ) : (
    <p>Search by registration or enter a tyre size manually.</p>
  )}
</div>

        <button onClick={() => navigate("/")}>CHANGE VEHICLE</button>
      </section>

      {loadingVehicle && <div className="v2Loading">Loading vehicle...</div>}
      {loadingTyres && <div className="v2Loading">Searching live stock...</div>}

      
      <section className={`v2ManualSearch ${manualSearchOpen ? "open" : ""}`}>
        <button
          type="button"
          className="v2ManualSearchToggle"
          onClick={() => setManualSearchOpen((open) => !open)}
          aria-expanded={manualSearchOpen}
        >
          <span>
            <small>KNOW YOUR TYRE SIZE?</small>
            <strong>Search manually by tyre size</strong>
          </span>
          <em>{manualSearchOpen ? "−" : "+"}</em>
        </button>

        {manualSearchOpen && (
          <div className="v2ManualSearchBody">
            <div className="v2ManualSearchHeading">
              <h2>FIND TYRES MANUALLY</h2>
              <p>Enter the width, profile and rim size shown on the side of your tyre.</p>
            </div>

            <form onSubmit={handleManualSearch} className="v2ManualSearchForm">
              <label>
                <span>Width</span>
                <input type="number" inputMode="numeric" placeholder="235" value={manualWidth} onChange={(e) => setManualWidth(e.target.value)} />
              </label>
              <strong>/</strong>
              <label>
                <span>Profile</span>
                <input type="number" inputMode="numeric" placeholder="50" value={manualProfile} onChange={(e) => setManualProfile(e.target.value)} />
              </label>
              <strong>R</strong>
              <label>
                <span>Rim</span>
                <input type="number" inputMode="numeric" placeholder="18" value={manualRim} onChange={(e) => setManualRim(e.target.value)} />
              </label>
              <button type="submit">SEARCH TYRES</button>
            </form>
          </div>
        )}
      </section>
      
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
        <TyreCard
          tyre={tyre}
          index={index}
          axle="front"
          key={`f-${index}`}
        />
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
        <TyreCard
          tyre={tyre}
          index={index}
          axle="rear"
          key={`r-${index}`}
        />
      ))}
    </section>
  </>
) : (
  <>
    {recommendedTyre && (
      <>
        <FeaturedRecommendation tyre={recommendedTyre} />

        <div className="v2OtherTyresHeading">
          <div>
            <span>COMPARE YOUR OPTIONS</span>
            <h2>OTHER TYRES AVAILABLE</h2>
          </div>

          <strong>{remainingTyres.length}</strong>
        </div>
      </>
    )}

    <section className="v2List">
      {visibleTyres.map((tyre, index) => (
        <TyreCard tyre={tyre} index={index} key={index} />
      ))}
    </section>

    {visibleCount < remainingTyres.length && (
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

      {enlargedImage && (
        <div
          className="v2ImageModal"
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged tyre image"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="v2ImageModalContent" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="v2ImageModalClose"
              onClick={() => setEnlargedImage(null)}
              aria-label="Close enlarged image"
            >
              ×
            </button>
            <img src={enlargedImage.src} alt={enlargedImage.alt} />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}