import { useEffect, useMemo, useRef, useState } from "react";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import Header from "./components/Header";
import "./AlloyWheels.css";

const demoWheelData = [
  {
    partNumber: "19855X112ET40731BLACKBRONZE",
    brand: "STUTTGART",
    description: "STUTTGART ST2 19X8.5 5X112 ET40 73.1 BBZ",
    model: "ST2",
    diameter: 19,
    width: 8.5,
    pcd: "5X112",
    bore: 73.1,
    offset: 38,
    load: 690,
    finish: "BLACK BRONZE",
    stock: 0,
    rrp: 137.5,
    image: "https://51.89.171.49/images/Riviera/Forged/FG2%20Gloss%20Black%20Angle.jpg",
    sourceFile: "Demo data",
  },
  {
    partNumber: "ATLAS20855X12035726GB",
    brand: "RIVIERA",
    description: "RIVIERA ATLAS 20X8.5 5X120 ET35 GLOSS BLACK",
    model: "ATLAS",
    diameter: 20,
    width: 8.5,
    pcd: "5X120",
    bore: 72.6,
    offset: 35,
    load: 815,
    finish: "GLOSS BLACK",
    stock: 4,
    rrp: 207.5,
    image: "http://51.89.171.49/images/Riviera/Commercial/Atlas-Gloss-Black-Angle-Web.jpg",
    sourceFile: "Demo data",
  },
];

const vehicleData = [
  {
    make: "BMW",
    model: "3 Series F30",
    years: "2012-2019",
    pcd: "5X120",
    bore: 72.6,
    diameters: [18, 19, 20],
    bodyType: "bmw",
  },
  {
    make: "BMW",
    model: "5 Series F10",
    years: "2010-2017",
    pcd: "5X120",
    bore: 72.6,
    diameters: [18, 19, 20],
    bodyType: "bmw",
  },
  {
    make: "Audi",
    model: "A4 B8",
    years: "2008-2015",
    pcd: "5X112",
    bore: 66.6,
    diameters: [18, 19, 20],
    bodyType: "audi",
  },
  {
    make: "Volkswagen",
    model: "Golf MK7",
    years: "2013-2020",
    pcd: "5X112",
    bore: 57.1,
    diameters: [17, 18, 19],
    bodyType: "vw",
  },
  {
    make: "Mercedes",
    model: "C Class W205",
    years: "2014-2021",
    pcd: "5X112",
    bore: 66.6,
    diameters: [18, 19, 20],
    bodyType: "merc",
  },
];

function splitCSVLine(line) {
  const cells = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && next === '"') {
      cell += '"';
      i++;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += char;
    }
  }

  cells.push(cell.trim());
  return cells;
}

function cleanKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\+/g, "plus")
    .replace(/[^a-z0-9]/g, "");
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

function get(row, names) {
  for (const name of names) {
    const value = row[cleanKey(name)];
    if (value !== undefined && value !== "") return value;
  }
  return "";
}

function toNumber(value) {
  const cleaned = String(value || "").replace(/[^0-9.-]/g, "");
  return cleaned ? Number(cleaned) : 0;
}

function toMoney(value) {
  const number = toNumber(value);
  return number ? number : null;
}

function normalisePCD(value) {
  return String(value || "").toUpperCase().replace(/\s+/g, "");
}

function mapWheel(row, fileName, index) {
  return {
    partNumber:
      get(row, ["Part Number", "PartNumber", "SKU", "Code"]) ||
      `${fileName}-${index}`,
    brand: get(row, ["Brand", "Make", "Manufacturer"]) || "UNKNOWN",
    description: get(row, ["Description", "Product Description", "Name"]) || "",
    model: get(row, ["Model", "Wheel Model", "Pattern"]) || "",
    diameter: toNumber(get(row, ["Diameter", "Wheel Diameter"])),
    width: toNumber(get(row, ["Width", "Wheel Width"])),
    pcd: normalisePCD(get(row, ["PCD", "Stud Pattern", "Fitment"])),
    bore: toNumber(get(row, ["Centre Bore", "Center Bore", "Bore", "CB"])),
    offset: toNumber(get(row, ["Offset", "ET"])),
    load: toNumber(get(row, ["Load Rating", "Load"])),
    finish: get(row, ["Finish", "Colour", "Color"]) || "",
    stock: toNumber(get(row, ["Stock", "Qty", "Quantity", "Available"])),
    rrp: toMoney(get(row, ["RRP + VAT", "RRP", "Retail", "Retail Price"])),
    image: get(row, ["Image URL", "Image", "ImageURL", "Photo", "Picture"]),
    sourceFile: fileName,
  };
}

function parseCSV(text, fileName) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = splitCSVLine(lines[0]).map(cleanKey);

  return lines.slice(1).map((line, index) => {
    const values = splitCSVLine(line);
    const row = {};

    headers.forEach((header, i) => {
      row[header] = values[i] || "";
    });

    return mapWheel(row, fileName, index + 1);
  });
}

function removeDuplicates(wheels) {
  const map = new Map();

  wheels.forEach((wheel) => {
    const key = wheel.partNumber || `${wheel.brand}-${wheel.model}-${wheel.pcd}`;
    const existing = map.get(key);

    if (!existing) {
      map.set(key, wheel);
    } else {
      map.set(key, {
        ...existing,
        stock: Number(existing.stock || 0) + Number(wheel.stock || 0),
        sourceFile: `${existing.sourceFile}, ${wheel.sourceFile}`,
      });
    }
  });

  return [...map.values()];
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
  const previewRef = useRef(null);

  const [uploadedWheels, setUploadedWheels] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loadingFirebase, setLoadingFirebase] = useState(true);

  const [search, setSearch] = useState("");
  const [diameter, setDiameter] = useState("all");
  const [pcd, setPcd] = useState("all");
  const [finish, setFinish] = useState("all");
  const [stockOnly, setStockOnly] = useState(true);

  const [make, setMake] = useState("all");
  const [model, setModel] = useState("all");
  const [year, setYear] = useState("all");
  const [vehicleFilterOn, setVehicleFilterOn] = useState(false);

  const [selectedWheel, setSelectedWheel] = useState(null);
  const [previewWheel, setPreviewWheel] = useState(null);

  const wheels = uploadedWheels.length ? uploadedWheels : demoWheelData;

  async function loadWheelsFromFirebase() {
    try {
      setLoadingFirebase(true);
      const snapshot = await getDocs(collection(db, "alloyWheels"));

      const firebaseWheels = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      if (firebaseWheels.length > 0) {
        setUploadedWheels(firebaseWheels);
      }
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

  const scrollToPreview = () => {
    setTimeout(() => {
      previewRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 80);
  };

  async function saveWheelsToFirebase() {
    try {
      if (!uploadedWheels.length) {
        alert("Upload a CSV first before saving to Firebase.");
        return;
      }

      for (const wheel of uploadedWheels) {
        const id = String(
          wheel.partNumber || `${wheel.brand}-${wheel.model}-${wheel.pcd}`
        )
          .replaceAll("/", "-")
          .replaceAll(" ", "-");

        await setDoc(doc(db, "alloyWheels", id), {
          ...wheel,
          updatedAt: new Date(),
        });
      }

      alert(`${uploadedWheels.length} wheels saved to Firebase`);
    } catch (error) {
      console.error(error);
      alert("Error saving wheels to Firebase");
    }
  }

  const handleFiles = async (event) => {
    const files = [...event.target.files].filter((file) =>
      file.name.toLowerCase().endsWith(".csv")
    );

    const parsedGroups = await Promise.all(
      files.map(async (file) => {
        const text = await file.text();
        return parseCSV(text, file.name);
      })
    );

    setUploadedWheels(removeDuplicates([...uploadedWheels, ...parsedGroups.flat()]));
    setUploadedFiles((prev) => [...prev, ...files.map((file) => file.name)]);
    event.target.value = "";
  };

  const resetUploads = () => {
    setUploadedWheels([]);
    setUploadedFiles([]);
    setSelectedWheel(null);
    setPreviewWheel(null);
  };

  const vehicleOptions = useMemo(() => {
    const makes = [...new Set(vehicleData.map((v) => v.make))].sort();

    const models = vehicleData
      .filter((v) => make === "all" || v.make === make)
      .map((v) => v.model);

    const years = vehicleData
      .filter((v) => {
        const makeMatch = make === "all" || v.make === make;
        const modelMatch = model === "all" || v.model === model;
        return makeMatch && modelMatch;
      })
      .map((v) => v.years);

    return {
      makes,
      models: [...new Set(models)].sort(),
      years: [...new Set(years)].sort(),
    };
  }, [make, model]);

  const selectedVehicle = useMemo(() => {
    return vehicleData.find((v) => {
      const makeMatch = make === "all" || v.make === make;
      const modelMatch = model === "all" || v.model === model;
      const yearMatch = year === "all" || v.years === year;
      return makeMatch && modelMatch && yearMatch;
    });
  }, [make, model, year]);

  const options = useMemo(() => {
    const unique = (key) =>
      [...new Set(wheels.map((w) => w[key]).filter(Boolean))].sort();

    return {
      diameters: unique("diameter"),
      pcds: unique("pcd"),
      finishes: unique("finish"),
    };
  }, [wheels]);

  const filtered = useMemo(() => {
    return wheels.filter((wheel) => {
      const text = `${wheel.brand} ${wheel.model} ${wheel.description} ${wheel.finish} ${wheel.pcd} ${wheel.partNumber}`.toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());
      const matchesDiameter =
        diameter === "all" || Number(wheel.diameter) === Number(diameter);
      const matchesPcd = pcd === "all" || wheel.pcd === pcd;
      const matchesFinish = finish === "all" || wheel.finish === finish;
      const matchesStock = !stockOnly || Number(wheel.stock) > 0;

      let matchesVehicle = true;

      if (vehicleFilterOn && selectedVehicle) {
        const pcdOk = wheel.pcd === selectedVehicle.pcd;
        const boreOk = Number(wheel.bore) >= Number(selectedVehicle.bore);
        const diameterOk = selectedVehicle.diameters.includes(Number(wheel.diameter));
        matchesVehicle = pcdOk && boreOk && diameterOk;
      }

      return (
        matchesSearch &&
        matchesDiameter &&
        matchesPcd &&
        matchesFinish &&
        matchesStock &&
        matchesVehicle
      );
    });
  }, [
    wheels,
    search,
    diameter,
    pcd,
    finish,
    stockOnly,
    vehicleFilterOn,
    selectedVehicle,
  ]);

  const clearFilters = () => {
    setSearch("");
    setDiameter("all");
    setPcd("all");
    setFinish("all");
    setStockOnly(true);
  };

  return (
    <>
      <Header />

      <div className="alloyPage">
        <section className="alloyHero">
          <div className="alloyHeroInner">
            <p>Tyremen Alloy Wheels</p>
            <h1>Find Alloy Wheels</h1>
            <span>
              Upload supplier CSV files, search wheels, filter by vehicle and
              preview wheels on a car.
            </span>
          </div>
        </section>

        <main className="alloyWrap">
          <section className="csvBox">
            <div>
              <h2>CSV Import</h2>
              <p>Upload one or many CSV files. They merge into one searchable wheel list.</p>
            </div>

            <div className="csvButtons">
              <label>
                Add CSV Files
                <input type="file" accept=".csv" multiple onChange={handleFiles} />
              </label>

              <button onClick={resetUploads}>Reset</button>
              <button onClick={saveWheelsToFirebase}>Save To Firebase</button>
            </div>

            {loadingFirebase && (
              <div className="loadingBox">
                <h2>Loading wheels from Firebase...</h2>
              </div>
            )}

            <div className="statGrid">
              <ImportStat label="CSV files added" value={uploadedFiles.length} />
              <ImportStat label="Wheels loaded" value={wheels.length} />
              <ImportStat label="Mode" value={uploadedWheels.length ? "Live CSV" : "Demo"} />
            </div>

            {uploadedFiles.length > 0 && (
              <div className="fileTags">
                {uploadedFiles.map((file, index) => (
                  <span key={`${file}-${index}`}>{file}</span>
                ))}
              </div>
            )}
          </section>

          <section className="vehicleSearchBox" ref={previewRef}>
            <div className="vehicleSearchTop">
              <div>
                <h2>Vehicle Search</h2>
                <p>Choose make, model and year to show wheels that should suit that vehicle.</p>
              </div>

              <label className="vehicleToggle">
                <input
                  type="checkbox"
                  checked={vehicleFilterOn}
                  onChange={(e) => setVehicleFilterOn(e.target.checked)}
                />
                Use vehicle filter
              </label>
            </div>

            <div className="vehicleGrid">
              <label>
                <span>Make</span>
                <select
                  value={make}
                  onChange={(e) => {
                    setMake(e.target.value);
                    setModel("all");
                    setYear("all");
                  }}
                >
                  <option value="all">All Makes</option>
                  {vehicleOptions.makes.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label>
                <span>Model</span>
                <select
                  value={model}
                  onChange={(e) => {
                    setModel(e.target.value);
                    setYear("all");
                  }}
                >
                  <option value="all">All Models</option>
                  {vehicleOptions.models.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label>
                <span>Year</span>
                <select value={year} onChange={(e) => setYear(e.target.value)}>
                  <option value="all">All Years</option>
                  {vehicleOptions.years.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>

            {selectedVehicle && (
              <div className="vehicleResult">
                <strong>{selectedVehicle.make} {selectedVehicle.model}</strong>
                <span>Years: {selectedVehicle.years}</span>
                <span>PCD: {selectedVehicle.pcd}</span>
                <span>Bore: {selectedVehicle.bore}mm</span>
                <span>Sizes: {selectedVehicle.diameters.join(", ")} inch</span>
              </div>
            )}

            <CarPreview wheel={previewWheel} selectedVehicle={selectedVehicle} />
          </section>

          <section className="filterBox">
            <div className="filterGrid">
              <label>
                <span>Search</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search brand, model, finish, PCD or part number"
                />
              </label>

              <Select label="Diameter" value={diameter} onChange={setDiameter} options={options.diameters} suffix='"' />
              <Select label="PCD" value={pcd} onChange={setPcd} options={options.pcds} />
              <Select label="Finish" value={finish} onChange={setFinish} options={options.finishes} />

              <button onClick={clearFilters}>Clear</button>
            </div>

            <label className="stockToggle">
              <input
                type="checkbox"
                checked={stockOnly}
                onChange={(e) => setStockOnly(e.target.checked)}
              />
              Show in-stock wheels only
            </label>
          </section>

          <div className="resultTop">
            <p>Showing <strong>{filtered.length}</strong> wheels</p>
            <span>Multiple supplier CSV files supported</span>
          </div>

          <section className="wheelGrid">
            {filtered.map((wheel) => (
              <WheelCard
                key={`${wheel.partNumber}-${wheel.sourceFile}`}
                wheel={wheel}
                onSelect={() => setSelectedWheel(wheel)}
                setPreviewWheel={(wheel) => {
                  setPreviewWheel(wheel);
                  scrollToPreview();
                }}
              />
            ))}
          </section>

          {filtered.length === 0 && (
            <div className="noResults">
              <h2>No wheels found</h2>
              <p>Try turning off stock only or clearing the filters.</p>
            </div>
          )}
        </main>

        {selectedWheel && (
          <ProductModal wheel={selectedWheel} onClose={() => setSelectedWheel(null)} />
        )}
      </div>
    </>
  );
}

function WheelCard({ wheel, onSelect, setPreviewWheel }) {
  const price = wheel.rrp ? `£${Number(wheel.rrp).toFixed(2)}` : "POA";
  const inStock = Number(wheel.stock) > 0;
  const imageUrl = getWheelImage(wheel);

  return (
    <div className="wheelCard">
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
        <p className="source">Source: {wheel.sourceFile}</p>

        <div className="specGrid">
          <Spec label="Size" value={`${wheel.diameter}x${wheel.width}J`} />
          <Spec label="PCD" value={wheel.pcd} />
          <Spec label="ET" value={wheel.offset} />
          <Spec label="Bore" value={`${wheel.bore}mm`} />
        </div>

        <div className="cardBottom">
          <div>
            <span>From</span>
            <strong>{price}</strong>
          </div>

          <div className="wheelActions">
            <button onClick={onSelect}>View</button>
            <button className="whiteBtn" onClick={() => setPreviewWheel(wheel)}>
              View On Car
            </button>
          </div>
        </div>
      </div>
    </div>
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

function ProductModal({ wheel, onClose }) {
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

          <div>
            <h3>Wheel Details</h3>
            <p className="modalDesc">{wheel.description}</p>

            <div className="specGrid">
              <Spec label="Part No" value={wheel.partNumber} />
              <Spec label="Finish" value={wheel.finish} />
              <Spec label="Diameter" value={`${wheel.diameter}"`} />
              <Spec label="Width" value={`${wheel.width}J`} />
              <Spec label="PCD" value={wheel.pcd} />
              <Spec label="Offset" value={`ET${wheel.offset}`} />
              <Spec label="Centre Bore" value={`${wheel.bore}mm`} />
              <Spec label="Load Rating" value={wheel.load} />
              <Spec label="Stock" value={Number(wheel.stock) > 0 ? `${wheel.stock} available` : "Out of stock"} />
              <Spec label="RRP + VAT" value={wheel.rrp ? `£${Number(wheel.rrp).toFixed(2)}` : "POA"} />
              <Spec label="Source File" value={wheel.sourceFile} />
            </div>

            <div className="modalActions">
              <button>Enquire</button>
              <button className="whiteBtn">Build Package</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CarPreview({ wheel, selectedVehicle }) {
  const bodyType = selectedVehicle?.bodyType || "generic";
  const imageUrl = getWheelImage(wheel);

  return (
    <div className="carPreviewBox">
      <div className="carInfo">
        <h3>Wheel Configurator</h3>
        <p>
          {selectedVehicle
            ? `${selectedVehicle.make} ${selectedVehicle.model}`
            : "Select vehicle"}
        </p>
      </div>

      <div className={`digitalCar ${bodyType}`}>
        <div className="digitalGlow"></div>
        <div className="digitalBody"></div>
        <div className="digitalRoof"></div>
        <div className="digitalWindow digitalRearWindow"></div>
        <div className="digitalWindow digitalFrontWindow"></div>
        <div className="digitalBonnet"></div>
        <div className="digitalBoot"></div>
        <div className="digitalLight digitalFrontLight"></div>
        <div className="digitalLight digitalRearLight"></div>
        <div className="digitalDoor"></div>

        <div className="digitalWheel digitalRearWheel">
          {imageUrl ? <img src={imageUrl} alt="" /> : <div className="digitalFakeWheel"></div>}
        </div>

        <div className="digitalWheel digitalFrontWheel">
          {imageUrl ? <img src={imageUrl} alt="" /> : <div className="digitalFakeWheel"></div>}
        </div>

        <div className="digitalBadge">{selectedVehicle?.make || "TYREMEN"}</div>
      </div>

      {wheel && (
        <div className="previewSelected">
          Showing: <strong>{wheel.brand} {wheel.model}</strong>
        </div>
      )}
    </div>
  );
}

function ImportStat({ label, value }) {
  return (
    <div className="importStat">
      <p>{label}</p>
      <strong>{value}</strong>
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