import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import Header from "./components/Header";
import "./AlloyWheels.css";
import Footer from "./components/Footer";


const VEHICLE_LOOKUP_URL =
  "https://vehiclelookup-tx3ipea3qa-uc.a.run.app?vrm=";
document.title = "Alloy Wheel Specialist Hull - Car,van & Motorhome";

function clean(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/-/g, " ")
    .replace(/[^a-z0-9. /]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanFileName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/%20/g, "-")
    .replace(/\+/g, "plus")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function toNumber(value) {
  const cleaned = String(value || "").replace(/[^0-9.-]/g, "");
  return cleaned ? Number(cleaned) : 0;
}

function normalisePCD(value) {
  return String(value || "").toUpperCase().replace(/\s+/g, "");
}

function normaliseTyreSize(value) {
  const text = String(value || "")
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/ZR/g, "R")
    .replace(/RF/g, "R")
    .replace(/XL/g, "");

  let found = text.match(/(\d{3})\/(\d{2})R(\d{2})/);

  if (!found) {
    found = text.match(/(\d{3})\/(\d{2})\/(\d{2})/);
  }

  if (!found) return "";

  return `${found[1]}/${found[2]}R${found[3]}`;
}

function getTyreRim(size) {
  const found = normaliseTyreSize(size).match(/R(\d{2})/);
  return found ? Number(found[1]) : 0;
}

function findDeepValue(obj, keys) {
  const targets = keys.map((k) => clean(k));

  function scan(value) {
    if (!value || typeof value !== "object") return "";

    for (const key of Object.keys(value)) {
      const cleanedKey = clean(key);

      if (targets.some((target) => cleanedKey.includes(target))) {
        if (typeof value[key] !== "object") return value[key];
      }

      const nested = scan(value[key]);
      if (nested) return nested;
    }

    return "";
  }

  return scan(obj);
}

function findOriginalTyreSize(vehicle) {
  const possibleValues = [
    vehicle?.tyreSize,
    vehicle?.tyre_size,
    vehicle?.frontTyreSize,
    vehicle?.front_tyre_size,
    vehicle?.tyres,
    vehicle?.tyre,
    vehicle?.standardTyreSize,
    vehicle?.vehicleTyreSize,
    vehicle?.tyreDetails?.front,
    vehicle?.tyreDetails?.frontTyre,
    vehicle?.tyreDetails?.frontTyreSize,
    vehicle?.tyreDetails?.standard,
    vehicle?.tyreDetails?.standardTyreSize,
    vehicle?.tyreDetails?.size,
  ];

  for (const value of possibleValues) {
    const size = normaliseTyreSize(value);
    if (size) return size;
  }

  return normaliseTyreSize(JSON.stringify(vehicle || {}));
}

function getYear(vehicle) {
  return Number(
    vehicle?.year ||
      vehicle?.registrationYear ||
      String(vehicle?.dateOfFirstRegistration || "").slice(0, 4)
  );
}

function getVehicleImage(vehicle) {
  return (
    vehicle?.image ||
    vehicle?.vehicleImage ||
    vehicle?.imageUrl ||
    vehicle?.vehicleImageUrl ||
    vehicle?.picture ||
    vehicle?.photo ||
    findDeepValue(vehicle, ["image", "vehicle image", "image url", "photo"]) ||
    ""
  );
}

function getVehicleFitment(vehicle) {
  const tyreSize = findOriginalTyreSize(vehicle);
  const rim = getTyreRim(tyreSize);

  const pcd =
    normalisePCD(vehicle?.pcd) ||
    normalisePCD(vehicle?.wheelPcd) ||
    normalisePCD(vehicle?.studPattern) ||
    normalisePCD(vehicle?.fitment?.pcd) ||
    normalisePCD(findDeepValue(vehicle, ["pcd", "stud pattern"]));

  const bore =
    toNumber(vehicle?.cb) ||
    toNumber(vehicle?.centreBore) ||
    toNumber(vehicle?.centerBore) ||
    toNumber(vehicle?.bore) ||
    toNumber(vehicle?.fitment?.cb) ||
    toNumber(vehicle?.fitment?.centreBore) ||
    toNumber(vehicle?.fitment?.centerBore) ||
    toNumber(findDeepValue(vehicle, ["cb", "centre bore", "center bore", "bore"]));

  const diameters = rim
    ? [...new Set([rim, rim + 1, rim + 2].filter((n) => n >= 15 && n <= 24))]
    : [];

  return {
    tyreSize,
    rim,
    pcd,
    bore,
    diameters,
    image: getVehicleImage(vehicle),
  };
}

function getWheelImage(wheel) {
  const image = wheel?.image || "";
  if (!image) return "";

  if (image.startsWith("/alloy-wheels/")) return image;

  if (image.includes("51.89.171.49")) {
    const brand = cleanFileName(wheel.brand || "wheel");
    const model = cleanFileName(wheel.model || "model");
    const finish = cleanFileName(wheel.finish || "finish");

    let ext = ".jpg";

    try {
      const cleanUrl = decodeURIComponent(image).split("?")[0];
      const foundExt = cleanUrl.match(/\.(jpg|jpeg|png|webp)$/i);
      if (foundExt) ext = foundExt[0].toLowerCase();
    } catch {
      ext = ".jpg";
    }

    return `/alloy-wheels/${brand}-${model}-${finish}${ext}`;
  }

  return image;
}

export default function AlloyWheels() {
  const location = useLocation();
  const carriedVrm = location.state?.vrm || "";

  const [vrm, setVrm] = useState(carriedVrm);
  const [vehicle, setVehicle] = useState(null);
  const [loadingVehicle, setLoadingVehicle] = useState(false);
  const [vehicleMessage, setVehicleMessage] = useState("");

  const [wheels, setWheels] = useState([]);
  const [loadingFirebase, setLoadingFirebase] = useState(true);

  const [search, setSearch] = useState("");
  const [diameter, setDiameter] = useState("all");
  const [finish, setFinish] = useState("all");
  const [stockOnly, setStockOnly] = useState(true);
  const [selectedWheel, setSelectedWheel] = useState(null);

  async function loadWheelsFromFirebase() {
    try {
      setLoadingFirebase(true);

      const snapshot = await getDocs(collection(db, "alloyWheels"));

      const firebaseWheels = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setWheels(firebaseWheels);
    } catch (error) {
      console.error(error);
      alert("Could not load wheels from Firebase");
    } finally {
      setLoadingFirebase(false);
    }
  }

  useEffect(() => {
    loadWheelsFromFirebase();
  }, []);

  async function searchVehicle() {
    if (!vrm.trim()) return;

    setLoadingVehicle(true);
    setVehicle(null);
    setVehicleMessage("");

    try {
      const res = await fetch(`${VEHICLE_LOOKUP_URL}${vrm.replace(/\s/g, "")}`);
      const data = await res.json();
      const v = data.vehicle || data;

      setVehicle(v);

      const fitment = getVehicleFitment(v);

      if (fitment.rim) {
        setDiameter(String(fitment.rim));
      }

      setSearch("");
    } catch (error) {
      console.error(error);
      setVehicleMessage("Vehicle lookup failed. Please check the registration.");
    } finally {
      setLoadingVehicle(false);
    }
  }

  useEffect(() => {
    if (carriedVrm) {
      searchVehicle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const vehicleFitment = vehicle ? getVehicleFitment(vehicle) : null;

  const options = useMemo(() => {
    const unique = (key) =>
      [...new Set(wheels.map((w) => w[key]).filter(Boolean))].sort();

    return {
      diameters: unique("diameter"),
      finishes: unique("finish"),
    };
  }, [wheels]);

  const filtered = useMemo(() => {
    return wheels.filter((wheel) => {
      const text = `${wheel.brand} ${wheel.model} ${wheel.description} ${wheel.finish} ${wheel.pcd} ${wheel.partNumber}`.toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());
      const matchesDiameter =
        diameter === "all" || Number(wheel.diameter) === Number(diameter);
      const matchesFinish = finish === "all" || wheel.finish === finish;
      const matchesStock = !stockOnly || Number(wheel.stock) > 0;

      let matchesVehicle = true;

      if (vehicleFitment) {
        const diameterOk =
          !vehicleFitment.diameters.length ||
          vehicleFitment.diameters.includes(Number(wheel.diameter));

        const pcdOk =
          !vehicleFitment.pcd ||
          normalisePCD(wheel.pcd) === normalisePCD(vehicleFitment.pcd);

        const boreOk =
          !vehicleFitment.bore ||
          !wheel.bore ||
          Number(wheel.bore) >= Number(vehicleFitment.bore);

        matchesVehicle = diameterOk && pcdOk && boreOk;
      }

      return (
        matchesSearch &&
        matchesDiameter &&
        matchesFinish &&
        matchesStock &&
        matchesVehicle
      );
    });
  }, [wheels, search, diameter, finish, stockOnly, vehicleFitment]);

  const clearFilters = () => {
    setSearch("");
    setDiameter(vehicleFitment?.rim ? String(vehicleFitment.rim) : "all");
    setFinish("all");
    setStockOnly(true);
  };

  return (
    <>
     

      <div className="alloyPage">
        <section className="alloyHero">
          <div className="alloyHeroShade"></div>

          <div className="alloyHeroInner">
            <div className="alloyHeroContent">
              <div className="heroHeading">
  <p className="eyebrow">TYREMEN ALLOY WHEELS</p>

  <h1>
    FIND ALLOY
    <br />
    WHEELS <span>BY REG</span>
  </h1>

  <p className="heroText">
    Enter your registration and we’ll instantly show alloy wheels
    matched to your vehicle fitment and sizing.
  </p>
</div>

              <div className="alloyVrmBox">
                <div className="plateFlag">GB</div>

                <input
                  value={vrm}
                  onChange={(e) => setVrm(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") searchVehicle();
                  }}
                  placeholder="ENTER REG"
                />

                <button onClick={searchVehicle}>
  {loadingVehicle ? "SEARCHING..." : "FIND WHEELS"}
</button>
              </div>

              {vehicleMessage && (
                <div className="alloyMessage">{vehicleMessage}</div>
              )}
            </div>
          </div>
        </section>

        <main className="alloyWrap">
          {loadingFirebase && (
            <div className="loadingBox">
              <h2>Loading wheels from Firebase...</h2>
            </div>
          )}

          {vehicle && (
            <section className="vehicleVrmResult">
              <div className="vehicleImagePanel">
                {vehicleFitment?.image ? (
                  <img
                    src={vehicleFitment.image}
                    alt={`${vehicle.make || ""} ${vehicle.model || ""}`}
                  />
                ) : (
                  <div className="vehicleImageFallback">TYREMEN</div>
                )}
              </div>

              <div className="vehicleInfoPanel">
                <div className="vehicleSearchTop">
                  <div>
                    <p className="vehicleMatched">Vehicle matched</p>

                    <h2>
                      {vehicle.make} {vehicle.model}
                    </h2>

                    <p className="vehicleSub">
                      {getYear(vehicle) || ""}
                      {vehicle.fuel && ` • ${vehicle.fuel}`}
                      {vehicle.body && ` • ${vehicle.body}`}
                    </p>
                  </div>

                  <button onClick={() => setVehicle(null)}>Change Vehicle</button>
                </div>

                <div className="vehicleResult">
                  <span>
                    Original tyre: <strong>{vehicleFitment?.tyreSize || "Not found"}</strong>
                  </span>

                  <span>
                    Wheel diameter:{" "}
                    <strong>
                      {vehicleFitment?.rim ? `${vehicleFitment.rim}"` : "Not found"}
                    </strong>
                  </span>

                  <span>
                    Suggested:{" "}
                    <strong>
                      {vehicleFitment?.diameters?.length
                        ? vehicleFitment.diameters.map((d) => `${d}"`).join(", ")
                        : "Use filters"}
                    </strong>
                  </span>

                  <span>
                    PCD: <strong>{vehicleFitment?.pcd || "Not supplied"}</strong>
                  </span>

                  <span>
                    Bore:{" "}
                    <strong>
                      {vehicleFitment?.bore
                        ? `${vehicleFitment.bore}mm`
                        : "Not supplied"}
                    </strong>
                  </span>
                </div>
              </div>
            </section>
          )}

          {!vehicle && (
            <section className="alloyIntroBox">
              <div>
                <p className="eyebrow">Simple wheel search</p>
                <h2>TYREMENS SMART WHEEL SEARCH.</h2>
                <p>
                  Start with the vehicle registration. Once we know the car, this
                  page can show tyre size, wheel diameter, fitment information and
                  matching alloy wheel options.
                </p>
              </div>

              <div className="alloyIntroGrid">
                <div>
                  <strong>✓ VRM matched</strong>
                  <span>Make, model, year, body and tyre data</span>
                </div>

                <div>
                  <strong>✓ Wheel-size led</strong>
                  <span>Uses original rim size and sensible upgrade sizes</span>
                </div>

                <div>
                  <strong>✓ Real stock</strong>
                  <span>Loaded directly from your Firebase alloy database</span>
                </div>
              </div>
            </section>
          )}

          <section className="filterBox">
            <div className="filterGrid">
              <label>
                <span>Search</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search brand, model, finish, PCD or part number..."
                />
              </label>

              <Select
                label="Diameter"
                value={diameter}
                onChange={setDiameter}
                options={options.diameters}
                suffix='"'
              />

              <Select
                label="Finish"
                value={finish}
                onChange={setFinish}
                options={options.finishes}
              />

              <label className="stockToggle">
                <input
                  type="checkbox"
                  checked={stockOnly}
                  onChange={(e) => setStockOnly(e.target.checked)}
                />
                <span>In-stock only</span>
              </label>

              <button className="clearBtn" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </section>

          <div className="resultTop">
            <p>
              <strong>{filtered.length}</strong> wheels found
            </p>

            <span>
              {vehicle
                ? "Filtered using VRM vehicle data"
                : "Enter a reg to match wheels to your vehicle"}
            </span>
          </div>

          <section className="wheelGrid">
            {filtered.map((wheel) => (
              <WheelCard
                key={`${wheel.partNumber}-${wheel.id}`}
                wheel={wheel}
                onSelect={() => setSelectedWheel(wheel)}
              />
            ))}
          </section>

          {filtered.length === 0 && !loadingFirebase && (
            <div className="noResults">
              <h2>No wheels found</h2>
              <p>
                Try clearing filters, turning off stock only, or searching a
                different diameter.
              </p>
            </div>
          )}
        </main>

        {selectedWheel && (
          <ProductModal
            wheel={selectedWheel}
            vehicle={vehicle}
            onClose={() => setSelectedWheel(null)}
          />
        )}
      </div>
     <Footer />
    </>
  );
}

function WheelCard({ wheel, onSelect }) {
  const price = wheel.rrp ? `£${Number(wheel.rrp).toFixed(2)}` : "POA";
  const inStock = Number(wheel.stock) > 0;
  const imageUrl = getWheelImage(wheel);

  return (
    <article className="wheelCard">
      <div className="wheelImageBox">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={wheel.description || wheel.model || "Alloy wheel"}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <WheelPlaceholder brand={wheel.brand} model={wheel.model} />
        )}
      </div>

      <div className="wheelInfo">
        <div className="wheelHead">
          <div>
            <p>{wheel.brand}</p>
            <h2>{wheel.model || "Alloy Wheel"}</h2>
          </div>

          <span className={inStock ? "stock in" : "stock out"}>
            {inStock ? `${wheel.stock} in stock` : "Out"}
          </span>
        </div>

        <p className="desc">{wheel.description}</p>

        <div className="quickSpecRow">
          <span>{wheel.diameter ? `${wheel.diameter}"` : "-"}</span>
          <span>{wheel.width ? `${wheel.width}J` : "-"}</span>
          <span>{wheel.pcd || "-"}</span>
          <span>{wheel.finish || "-"}</span>
        </div>

        <div className="cardBottom">
          <div>
            <span>From</span>
            <strong>{price}</strong>
          </div>

          <button onClick={onSelect}>
            View Wheel <span>→</span>
          </button>
        </div>
      </div>
    </article>
  );
}

function WheelPlaceholder({ brand, model }) {
  return (
    <div className="wheelPlaceholder">
      <div className="fakeAlloy">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <p>{brand}</p>
      <small>{model}</small>
    </div>
  );
}

function ProductModal({ wheel, vehicle, onClose }) {
  const imageUrl = getWheelImage(wheel);

  return (
    <div className="modalOverlay">
      <div className="modalBox">
        <div className="modalHead">
          <div>
            <p>{wheel.brand}</p>
            <h2>{wheel.model || "Alloy Wheel"}</h2>
          </div>

          <button onClick={onClose}>Close</button>
        </div>

        <div className="modalGrid">
          <div className="modalImage">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={wheel.description || wheel.model || "Alloy wheel"}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <WheelPlaceholder brand={wheel.brand} model={wheel.model} />
            )}
          </div>

          <div className="modalInfo">
            {vehicle && (
              <p className="modalMatched">
                Matched for: {vehicle.make} {vehicle.model}
              </p>
            )}

            <p className="modalDesc">{wheel.description}</p>

            <div className="specGrid">
              <Spec label="Part No" value={wheel.partNumber} />
              <Spec label="Finish" value={wheel.finish} />
              <Spec label="Diameter" value={wheel.diameter ? `${wheel.diameter}"` : "-"} />
              <Spec label="Width" value={wheel.width ? `${wheel.width}J` : "-"} />
              <Spec label="PCD" value={wheel.pcd} />
              <Spec label="Offset" value={wheel.offset ? `ET${wheel.offset}` : "-"} />
              <Spec label="Centre Bore" value={wheel.bore ? `${wheel.bore}mm` : "-"} />
              <Spec label="Load Rating" value={wheel.load} />
              <Spec
                label="Stock"
                value={
                  Number(wheel.stock) > 0
                    ? `${wheel.stock} available`
                    : "Out of stock"
                }
              />
              <Spec
                label="RRP + VAT"
                value={wheel.rrp ? `£${Number(wheel.rrp).toFixed(2)}` : "POA"}
              />
            </div>

            <div className="modalActions">
              <button>Enquire</button>
              <button className="whiteBtn">Build Wheel & Tyre Package</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options, suffix = "" }) {
  return (
    <label>
      <span>{label}</span>

      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="all">All</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
            {suffix}
          </option>
        ))}
      </select>
    </label>
  );
}

function Spec({ label, value }) {
  return (
    <div className="specBox">
      <p>{label}</p>
      <strong>{value || "-"}</strong>
    </div>
  );
}

