import { useEffect, useState } from "react";
import Header from "./components/Header";
import "./SpareWheel.css";

const VEHICLE_LOOKUP_URL =
  "https://vehiclelookup-tx3ipea3qa-uc.a.run.app?vrm=";

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function parseCSV(text) {
  const rows = text.split(/\r?\n/).filter(Boolean);
  const headers = parseCSVLine(rows[0]).map((h) => h.trim());

  return rows.slice(1).map((row) => {
    const values = parseCSVLine(row);
    const item = {};

    headers.forEach((header, index) => {
      item[header] = values[index] || "";
    });

    return item;
  });
}

function clean(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/-/g, " ")
    .replace(/[^a-z0-9. ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasWord(text, word) {
  return clean(text).split(" ").includes(clean(word));
}

function getYear(vehicle) {
  return Number(
    vehicle.year ||
      vehicle.registrationYear ||
      String(vehicle.dateOfFirstRegistration || "").slice(0, 4)
  );
}

function getEngineCode(model) {
  const found = clean(model).match(/\b\d{3}[a-z]{0,2}\b/);
  return found ? found[0] : "";
}

function getSeriesModel(vehicle) {
  const make = clean(vehicle.make);
  const model = clean(vehicle.model);
  const body = clean(vehicle.body);
  const code = getEngineCode(model);

  if (make === "bmw") {
    if (code.startsWith("1")) return "1 series";
    if (code.startsWith("2")) {
      if (body.includes("coupe")) return "2 series coupe";
      if (body.includes("tourer")) return "2 series active tourer";
      return "2 series";
    }
    if (code.startsWith("3")) return "3 series";
    if (code.startsWith("4")) return "4 series";
    if (code.startsWith("5")) return "5 series";
  }

  return model;
}

function scoreItem(vehicle, item) {
  const make = clean(vehicle.make);
  const model = clean(vehicle.model);
  const body = clean(vehicle.body);
  const year = getYear(vehicle);

  const csvMake = clean(item["Manufacturer"]);
  const csvModel = clean(item["Model"]);
  const csvNick = clean(item["Nickname"]);
  const engine = clean(item["Engine Size"]);

  const start = Number(item["Year Start"] || 0);
  const end = Number(item["Year End"] || 2099);

  if (csvMake !== make) return -99999;
  if (year && (year < start || year > end)) return -99999;

  let score = 0;

  const wantedModel = getSeriesModel(vehicle);
  const engineCode = getEngineCode(model);

  if (csvModel === wantedModel) score += 2000;
  if (wantedModel.includes(csvModel)) score += 1000;
  if (csvModel.includes(wantedModel)) score += 1000;
  if (model.includes(csvModel)) score += 700;
  if (body && csvModel.includes(body)) score += 300;
  if (csvNick && model.includes(csvNick)) score += 200;

  if (engineCode && engine.includes(engineCode)) score += 3000;

  const vehicleIsST = hasWord(model, "st");
  const rowIsST = hasWord(engine, "st");

  if (vehicleIsST && rowIsST) score += 5000;
  if (vehicleIsST && !rowIsST) score -= 5000;

  if (model.includes("st line") && engine.includes("st")) score += 1500;
  if (model.includes("m sport") && engine.includes("m")) score += 800;
  if (model.includes("s line") && engine.includes("s line")) score += 1000;
  if (model.includes("r line") && engine.includes("r line")) score += 1000;
  if (hasWord(model, "gt") && hasWord(engine, "gt")) score += 1000;
  if (hasWord(model, "fr") && hasWord(engine, "fr")) score += 1000;
  if (hasWord(model, "rs") && hasWord(engine, "rs")) score += 1000;
  if (model.includes("sport") && engine.includes("sport")) score += 700;

  return score;
}

export default function SpareWheel() {
  const [vrm, setVrm] = useState("");
  const [vehicle, setVehicle] = useState(null);
  const [kits, setKits] = useState([]);
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/data/roadhero.csv")
      .then((res) => res.text())
      .then((text) => setKits(parseCSV(text)))
      .catch(() => setMessage("Could not load Road Hero CSV."));
  }, []);

  const searchVehicle = async () => {
    if (!vrm.trim()) return;

    setLoading(true);
    setVehicle(null);
    setMatch(null);
    setMessage("");

    try {
      const res = await fetch(
        `${VEHICLE_LOOKUP_URL}${vrm.replace(/\s/g, "")}`
      );

      const data = await res.json();
      const v = data.vehicle || data;

      setVehicle(v);

      const scored = kits
        .map((item) => ({
          item,
          score: scoreItem(v, item),
        }))
        .filter((row) => row.score > 0)
        .sort((a, b) => b.score - a.score);

      const found = scored[0]?.item || null;

      if (!found) {
        setMessage("No Road Hero kit found for this vehicle.");
      }

      setMatch(found);
    } catch (err) {
      console.log(err);
      setMessage("Vehicle lookup failed.");
    }

    setLoading(false);
  };

    return (
    <>
      <Header />

      <div className="sparePage">
        <div className="spareHero">
          <h1>ROAD HERO SPACE SAVER</h1>
          <p>Emergency spare wheel kits matched to your vehicle</p>

          <div className="vrmBox">
            <input
              value={vrm}
              onChange={(e) => setVrm(e.target.value.toUpperCase())}
              placeholder="ENTER REG"
            />

            <button onClick={searchVehicle}>
              {loading ? "SEARCHING..." : "FIND KIT"}
            </button>
          </div>

          {message && <div className="spareMessage">{message}</div>}
        </div>

        {vehicle && (
          <div className="vehicleCard">
            <span>Your vehicle</span>
            <h2>
              {vehicle.make} {vehicle.model}
            </h2>
            <p>
              {getYear(vehicle)} {vehicle.fuel && `• ${vehicle.fuel}`}{" "}
              {vehicle.body && `• ${vehicle.body}`}
            </p>
          </div>
        )}

        {match && (
          <div className="kitCard">
            <div className="kitImage kitGallery">
              <img src="/roadhero/kit-main.webp" alt="Road Hero kit" />
              <img src="/roadhero/kit-open.webp" alt="Road Hero wheel" />
              <img
                src="/roadhero/kit-accessories.webp"
                alt="Road Hero accessories"
              />
            </div>

            <div className="kitInfo">
              <span className="kitBadge">FITS YOUR VEHICLE</span>

              <h2>ROAD HERO KIT</h2>

              <ul>
                <li>Space saver wheel</li>
                <li>Tyre fitted</li>
                <li>Jack and wheel brace</li>
                <li>Accessory kit</li>
                <li>Storage bag</li>
              </ul>

              <div className="specs">
                <div>
                  <strong>Wheel Size</strong>
                  <span>{match["Wheel Size"]}</span>
                </div>

                <div>
                  <strong>Tyre Size</strong>
                  <span>{match["Tyre Size"]}</span>
                </div>

                <div>
                  <strong>Part Code</strong>
                  <span>{match["Part code"]}</span>
                </div>
              </div>

              <div className="priceRow">
                <h3>£{match["Sell Inc Vat"]}</h3>
                <button>ADD TO BASKET</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}