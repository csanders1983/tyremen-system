import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import heroCar from "./assets/hero-car.png";
import "./Home.css";
import Header from "./components/Header";

import tyreIcon from "./assets/icons/tyre.png";
import serviceIcon from "./assets/icons/service.png";
import brakeIcon from "./assets/icons/brake.png";
import motIcon from "./assets/icons/mot.png";
import airconIcon from "./assets/icons/aircon.png";
import clutchIcon from "./assets/icons/clutch.png";
import timingIcon from "./assets/icons/timing.png";
import diagnosticsIcon from "./assets/icons/diagnostics.png";

document.title = "Tyremen Hull | Tyres, MOT, Servicing & Repairs";
const VEHICLE_LOOKUP_URL =
  "https://vehiclelookup-tx3ipea3qa-uc.a.run.app?vrm=";

const services = [
  { title: "TYRES", text: "View tyres", icon: tyreIcon, link: "/tyres" },
  { title: "SERVICING", text: "Book a service", icon: serviceIcon, link: "/car-servicing-hull" },
  { title: "BRAKES", text: "Brake check", icon: brakeIcon, link: "/brakes-hull" },
  { title: "MOT", text: "Book an MOT", icon: motIcon, link: "/mot-hull" },
  { title: "AIR CON", text: "Regas & repair", icon: airconIcon, link: "/air-conditioning-hull" },
  { title: "CLUTCHES", text: "Fitting & repair", icon: clutchIcon, link: "/clutch-repairs-hull" },
  { title: "TIMING BELT", text: "Check & replace", icon: timingIcon, link: "/timing-belt-hull" },
  { title: "DIAGNOSTICS", text: "Vehicle diagnostics", icon: diagnosticsIcon, link: "/booking" },
];

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "") || "";
}

function formatVehicleName(vehicle) {
  if (!vehicle) return "";

  const parts = [
    vehicle.year,
    firstValue(vehicle.make, vehicle.manufacturer),
    firstValue(vehicle.model, vehicle.derivative),
  ].filter(Boolean);

  return parts.join(" ").trim();
}

export default function Home() {
  const navigate = useNavigate();

  const [registration, setRegistration] = useState(() => {
    return localStorage.getItem("tyremenVrm") || "";
  });



  const [vehicle, setVehicle] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("tyremenVehicle") || "null");
    } catch {
      return null;
    }
  });

  const [loadingVehicle, setLoadingVehicle] = useState(false);

  useEffect(() => {
    const refreshVehicleState = () => {
      setRegistration(localStorage.getItem("tyremenVrm") || "");

      try {
        setVehicle(JSON.parse(localStorage.getItem("tyremenVehicle") || "null"));
      } catch {
        setVehicle(null);
      }
    };

    window.addEventListener("tyremenVehicleUpdated", refreshVehicleState);

    return () => {
      window.removeEventListener("tyremenVehicleUpdated", refreshVehicleState);
    };
  }, []);

  async function lookupVehicle() {
    const cleanReg = registration.toUpperCase().replace(/\s/g, "");
    if (!cleanReg) {
      alert("Please enter your registration");
      return;
    }

    try {
      setLoadingVehicle(true);

      const res = await fetch(VEHICLE_LOOKUP_URL + cleanReg);
      const data = await res.json();

      console.log("VRM LOOKUP RESULT:", data);
      console.log("CACHED:", data.cached);

      if (!data.success) {
        alert("Vehicle lookup failed");
        return;
      }

      localStorage.setItem("tyremenVehicle", JSON.stringify(data.vehicle));
      localStorage.setItem("tyremenVrm", cleanReg);

      window.dispatchEvent(new Event("tyremenVehicleUpdated"));

      setVehicle(data.vehicle);
      setRegistration(cleanReg);
    } catch (err) {
      console.error(err);
      alert("Vehicle lookup failed");
    } finally {
      setLoadingVehicle(false);
    }
  }

  function clearVehicle() {
    localStorage.removeItem("tyremenVehicle");
    localStorage.removeItem("tyremenVrm");
    setVehicle(null);
    setRegistration("");
    window.dispatchEvent(new Event("tyremenVehicleUpdated"));
  }

  function goTo(path) {
    const cleanReg =
      vehicle?.vrm || registration.toUpperCase().replace(/\s/g, "");

    navigate(cleanReg ? `${path}?vrm=${cleanReg}` : path);
  }

  const cleanDisplayReg =
    vehicle?.vrm || registration.toUpperCase().replace(/\s/g, "") || "ABC123";

  const vehicleName = formatVehicleName(vehicle);
  const vehicleSubLine = [vehicle?.fuel, vehicle?.body, vehicle?.colour]
    .filter(Boolean)
    .join(" • ");

  const tyreSize = firstValue(vehicle?.tyreSize, vehicle?.frontTyreSize, vehicle?.tyres);
  const motExpiry = firstValue(vehicle?.motExpiryDate, vehicle?.motExpiry, vehicle?.motDueDate);
  const motMileage = firstValue(vehicle?.motMileage, vehicle?.lastMotMileage, vehicle?.mileage);
  const motStatus = firstValue(vehicle?.motStatus, vehicle?.lastMotStatus, "MOT info");
  
const rawWeight = firstValue(
  vehicle?.revenueWeight,
  vehicle?.grossWeight,
  vehicle?.grossVehicleWeight,
  vehicle?.gross_vehicle_weight,
  vehicle?.grossVehicleMass,
  vehicle?.grossVehicleMassKg,
  vehicle?.maxWeight,
  vehicle?.vehicleWeight,
  vehicle?.weight
);

const vehicleWeight = Number(String(rawWeight || "").replace(/[^0-9]/g, ""));

const vehicleText = [
  vehicle?.body,
  vehicle?.bodyType,
  vehicle?.vehicleType,
  vehicle?.type,
  vehicle?.make,
  vehicle?.model,
  vehicle?.derivative,
].join(" ").toLowerCase();

const looksLikeVan =
  vehicleText.includes("van") ||
  vehicleText.includes("transit") ||
  vehicleText.includes("sprinter") ||
  vehicleText.includes("crafter") ||
  vehicleText.includes("ducato") ||
  vehicleText.includes("boxer") ||
  vehicleText.includes("relay") ||
  vehicleText.includes("vivaro") ||
  vehicleText.includes("traffic") ||
  vehicleText.includes("master");

const motTitle =
  vehicleWeight >= 3000 || looksLikeVan
    ? "MOT Class 7"
    : "MOT Class 4";

const vehicleYear = Number(vehicle?.year);

const calculatedAirConGas =
  vehicleYear && vehicleYear <= 2014 ? "Likely R134A" : "Likely R1234yf";

const airConGas = firstValue(
  vehicle?.airconGas,
  vehicle?.airConGas,
  vehicle?.acGas,
  vehicle?.gasType,
  calculatedAirConGas
);

const knownMileage = Number(
  String(
    firstValue(
      vehicle?.lastMotMileage,
      vehicle?.motMileage,
      vehicle?.mileage
    )
  ).replace(/[^0-9]/g, "")
);

let serviceRecommendation = "Service plans";

if (vehicle) {
  if (!knownMileage) {
    serviceRecommendation = "Oil and Filter Service";
  } else if (knownMileage >= 80000) {
    serviceRecommendation = "Major service";
  } else if (knownMileage >= 40000) {
    serviceRecommendation = "Full service";
  } else {
    serviceRecommendation = "Interim service";
  }
}
console.log("HOME VEHICLE:", vehicle);
console.log("HOME WEIGHT:", rawWeight, vehicleWeight);
console.log("HOME VAN DETECT:", looksLikeVan);
console.log("HOME MOT:", motTitle);

  return (
    <div className="homePage">
      <Header />

      <section className={`hero ${vehicle ? "heroWithVehicle" : ""}`}>
        <div className="heroLeft">
          <div className="heroContent">
            <p>HULL'S TRUSTED GARAGE</p>

            <h1>
              MORE THAN <br />
              JUST <span>TYRES</span>
            </h1>

            <div className="heroServices">
              MOT <b>•</b> SERVICING <b>•</b> CLUTCHES <b>•</b> TIMING BELTS
            </div>

            <div className="heroTrust">
              <span>4.8 Rated Garage</span>
              <span>55+ Years Experience</span>
              <span>Trusted Across Hull</span>
            </div>
          </div>
        </div>

        <div
          className="heroRight"
          style={{ backgroundImage: `url(${heroCar})` }}
        />
      </section>

      <section className={`vehicleHudWrap ${!vehicle ? "vehicleHudInfo" : ""}`}>
    <div className="vehicleHud">
      <div className="hudBlock hudReg">
        <small>YOUR VEHICLE</small>
        <strong>{vehicle ? cleanDisplayReg : "ENTER REG"}</strong>
	<span>{vehicle ? "✓ Reg found" : "Start with your registration"}</span>
      </div>

      <div className="hudBlock hudVehicle">
        <small>VEHICLE</small>
        <strong>{vehicle ? vehicleName || "Vehicle found" : "INSTANT VEHICLE LOOKUP"}</strong>
	<span>{vehicle ? vehicleSubLine || "View vehicle details" : "Find tyres, MOT, servicing and air con gas"}</span>
        
      </div>

      <div className="hudBlock">
        <small>TYRES</small>
        <strong>{tyreSize || "View sizes"}</strong>
        <button type="button" onClick={() => goTo("/tyres")}>
          🛞 View tyre options
        </button>
      </div>

      <div className="hudBlock">
  <small>MOT</small>

  <strong>{vehicle ? `${motTitle}` : "Class 4 & 7"}</strong>

  <button
  type="button"
  onClick={() => goTo("/mot-hull")}
>
  🧾 {vehicle ? "View MOT information" : "Class 4 & Class 7 MOTs"}
</button>

  
</div>

      <div className="hudBlock">
        <small>AIR CONDITIONING</small>
        <strong>{vehicle ? airConGas.replace("Likely ", ""): "All Gas Types"}</strong>
        <button type="button" onClick={() => goTo("/air-conditioning-hull")}>
  ❄️ {vehicle ? "View air con info" : "Gas - Old & New"}
</button>
      </div>

<div className="hudBlock">
  <small>SERVICING</small>

  <strong>
    {vehicle ? serviceRecommendation : "Service Plans"}
  </strong>

  <button
    type="button"
    onClick={() => goTo("/car-servicing-hull")}
  >
    🔧 {vehicle ? "View servicing options" : "Oil • Interim • Full • Major"}
  </button>
</div>

      <button className="hudClear" type="button" onClick={clearVehicle}>
        CLEAR SEARCH
      </button>
    </div>
  </section>

{vehicle && (
  <div className="floatingOffer">
    <button
      className="floatingOfferClose"
      onClick={() =>
        document.querySelector(".floatingOffer").style.display = "none"
      }
    >
      ×
    </button>

    <small>LIMITED OFFER</small>

    <h3>MOT FOR £20.00</h3>

    <p>With selected Interim, Full or Major services.</p>

    <button
      onClick={() => navigate("/car-servicing-hull")}
    >
      VIEW SERVICES →
    </button>
  </div>
)}


      <section className="regSearch">
        <div className="regMain">
          <h3>
            FIND TYRES, SERVICE OR MOT <span>BY REG</span>
          </h3>

          <div className="plateLine">
            <div className="ukFlag"></div>

            <div className="plateRow">
              <div className="plateGb">GB</div>

              <input
  value={registration}
  onChange={(e) => setRegistration(e.target.value.toUpperCase())}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      lookupVehicle();
    }
  }}
  placeholder="ABC 123"
/>

              <button onClick={lookupVehicle} disabled={loadingVehicle}>
                {loadingVehicle ? "CHECKING..." : "FIND MY VEHICLE ✓"}
              </button>
            </div>
          </div>

          {vehicle ? (
            <div className="vehicleResult">
              <div className="vehicleImageBox">
                {vehicle.image && (
                  <img src={vehicle.image} alt={vehicle.model || "Vehicle"} />
                )}
              </div>

              <div className="vehicleInfo">
                <strong>{vehicleName || "Vehicle found"}</strong>

                <p>{vehicleSubLine}</p>

                <p>
                  {vehicle.engineCC ? `${vehicle.engineCC}cc` : ""}
                  {tyreSize ? ` • ${tyreSize}` : ""}
                </p>

                <div className="vehicleActionGrid">
                  <button onClick={() => goTo("/tyres")}>TYRES →</button>
                  <button onClick={() => goTo("/car-servicing-hull")}>
                    SERVICE →
                  </button>
                  <button onClick={() => goTo("/mot-hull")}>MOT →</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="vehiclePlaceholder">
              <div className="placeholderInner">
                <div className="placeholderReg">YOUR VEHICLE WILL APPEAR HERE</div>

                <h4>Enter your registration to begin</h4>

                <p>
                  Instantly find tyres, MOT pricing, servicing, air conditioning
                  gas type and more.
                </p>

                <div className="placeholderTags">
                  <span>✓ Tyre Sizes</span>
                  <span>✓ MOT Info</span>
                  <span>✓ Service Booking</span>
                  <span>✓ Air Con Gas</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="steps">
          <div>
            <b>1</b>
            <em>🔍</em>
            <span>ENTER REG</span>
            <small>We’ll find your vehicle</small>
          </div>

          <div>
            <b>2</b>
            <em>🛠️</em>
            <span>CHOOSE SERVICE</span>
            <small>Tyres, Service or MOT</small>
          </div>

          <div>
            <b>3</b>
            <em>🗓️</em>
            <span>BOOK ONLINE</span>
            <small>Fitted in Hull</small>
          </div>
        </div>
      </section>

      <section className="serviceGrid">
        {services.map((item) => (
          <button
            key={item.title}
            className="serviceCard"
            onClick={() => goTo(item.link)}
          >
            <div className="serviceIcon">
              <img src={item.icon} alt={item.title} />
            </div>

            <strong>{item.title}</strong>
            <span>{item.text} →</span>
          </button>
        ))}
      </section>

      <section className="midRow">
        <div
          className="motBanner"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(0,0,0,0.96), rgba(0,0,0,0.72)),
              url(${heroCar})
            `,
          }}
        >
          <h2>MOT FOR £20</h2>
          <h3>WITH SELECTED SERVICES</h3>
          <p>
            ✓ SAVE £20 &nbsp; ✓ SAME-DAY APPOINTMENTS &nbsp; ✓ LIMITED SLOTS
            PER WEEK
          </p>
          <button onClick={() => goTo("/car-servicing-hull")}>BOOK NOW →</button>
        </div>

        <div className="whyBox">
          <h3>WHY CHOOSE TYREMEN?</h3>

          <div className="whyGrid">
            <div>
              <b>55+</b>
              <strong>YEARS</strong>
              <span>Trusted locally</span>
            </div>
            <div>
              <b>★</b>
              <strong>4.8/5</strong>
              <span>Google rating</span>
            </div>
            <div>
              <b>✓</b>
              <strong>HONEST</strong>
              <span>No hidden costs</span>
            </div>
            <div>
              <b>⚙</b>
              <strong>EXPERTS</strong>
              <span>Skilled technicians</span>
            </div>
            <div>
              <b>📍</b>
              <strong>LOCAL</strong>
              <span>Hull based</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div>
          <div className="footerLogo">TYREMEN</div>
          <p>More than just a tyre shop.</p>
        </div>

        <div>
          <h4>CONTACT US</h4>
          <p>01482 328800</p>
          <p>info@tyremen.co.uk</p>
          <p>Witty Street, Hull HU3 4TX</p>
        </div>

        <button className="callBox">
          CALL NOW
          <br />
          01482 328800
        </button>
      </footer>
    </div>
  );
}
