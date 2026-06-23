import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import "./Header.css";
import Service from "../assets/header-ikons/Service.png";
import Brakes from "../assets/header-ikons/Brakes.png";
import MOT from "../assets/header-ikons/MOT.png";
import Aircon from "../assets/header-ikons/Aircon.png";
import Clutch from "../assets/header-ikons/Clutch.png";
import Timing from "../assets/header-ikons/Timing.png";
import Diagnostic from "../assets/header-ikons/Diagnostic.png";
import Alignment from "../assets/header-ikons/4way.png";
import Alloy from "../assets/header-ikons/Alloy.png";
import Spare from "../assets/header-ikons/Spare.png";
import Tyre from "../assets/header-ikons/Tyres.png";

import {
  FaRegCalendarAlt,
  FaPhoneAlt,
} from "react-icons/fa";



/* ICONS */

const PhoneIcon = () => (
  <svg viewBox="0 0 64 64" className="topIcon">
    <path
      d="M18 10c2-2 6-2 8 0l6 6c2 2 2 6 0 8l-4 4c3 6 8 11 14 14l4-4c2-2 6-2 8 0l6 6c2 2 2 6 0 8-4 4-10 6-16 4C28 52 12 36 8 20c-2-6 0-12 4-16z"
      stroke="#ffd000"
      strokeWidth="4"
      fill="none"
    />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 64 64" className="topIcon">
    <rect x="8" y="16" width="48" height="32" rx="4" stroke="#ffd000" strokeWidth="4" fill="none" />
    <path d="M8 18l24 18 24-18" stroke="#ffd000" strokeWidth="4" />
  </svg>
);

const LocationIcon = () => (
  <svg viewBox="0 0 64 64" className="topIcon">
    <path
      d="M32 8c10 0 18 8 18 18 0 14-18 30-18 30S14 40 14 26c0-10 8-18 18-18z"
      stroke="#ffd000"
      strokeWidth="4"
      fill="none"
    />
    <circle cx="32" cy="26" r="6" fill="#ffd000" />
  </svg>
);

/* HELPERS */

function readStoredVehicle() {
  try {
    return JSON.parse(localStorage.getItem("tyremenVehicle") || "null");
  } catch {
    return null;
  }
}

function getFirstValue(obj, keys) {
  if (!obj) return "";

  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
      return obj[key];
    }
  }

  return "";
}

function getTyreSize(vehicle) {
  return (
    getFirstValue(vehicle, [
      "tyreSize",
      "frontTyreSize",
      "frontTyre",
      "tyre",
      "tyres",
      "wheelSize",
      "standardTyreSize",
    ]) || "Tyre size pending"
  );
}

function getMotClass(vehicle) {
  const motClass = getFirstValue(vehicle, ["motClass", "mot_class", "class"]);
  if (motClass) return `MOT Class ${motClass}`;

  const fuel = String(getFirstValue(vehicle, ["fuelType", "fuel"]) || "").toLowerCase();
  const body = String(getFirstValue(vehicle, ["bodyType", "body"]) || "").toLowerCase();

  if (body.includes("van") || body.includes("light goods")) return "MOT Class 7";
  if (fuel.includes("motorcycle")) return "MOT Class 1/2";

  return "MOT Class 4";
}

function getAirconGas(vehicle) {
  const gas = getFirstValue(vehicle, [
    "airconGas",
    "airConGas",
    "acGas",
    "airConditioningGas",
    "refrigerant",
  ]);

  if (gas) return gas;

  const year = Number(getFirstValue(vehicle, ["yearOfManufacture", "year", "manufactureYear"]));

  if (year && year >= 2017) return "Likely R1234yf";
  if (year && year < 2017) return "Likely R134a";

  return "Aircon gas check";
}

/* COMPONENT */

export default function Header() {
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(readStoredVehicle);
  const [vrm, setVrm] = useState(localStorage.getItem("tyremenVrm") || "");

  useEffect(() => {
    const refreshVehicle = () => {
      setVehicle(readStoredVehicle());
      setVrm(localStorage.getItem("tyremenVrm") || "");
    };

    window.addEventListener("storage", refreshVehicle);
    window.addEventListener("tyremenVehicleUpdated", refreshVehicle);

    refreshVehicle();

    return () => {
      window.removeEventListener("storage", refreshVehicle);
      window.removeEventListener("tyremenVehicleUpdated", refreshVehicle);
    };
  }, []);

  const vehicleState = useMemo(
    () => ({
      vrm,
      vehicle,
      tyreSize: getTyreSize(vehicle),
      motClass: getMotClass(vehicle),
      airconGas: getAirconGas(vehicle),
    }),
    [vrm, vehicle]
  );

  const linkTo = (pathname) => ({
    pathname,
    search: vrm ? `?vrm=${encodeURIComponent(vrm)}` : "",
  });

  const navLinks = [
  { label: "TYRES", icon: Tyre, path: "/tyres" },
  { label: "SERVICING", icon: Service, path: "/car-servicing-hull" },
  { label: "MOT", icon: MOT, path: "/mot-hull" },
  { label: "BRAKES", icon: Brakes, path: "/brakes-hull" },
  { label: "AIR CON", icon: Aircon, path: "/air-conditioning-hull" },
  { label: "CLUTCHES", icon: Clutch, path: "/clutch-repairs-hull" },
  { label: "TIMING", icon: Timing, path: "/timing-belt-hull" },
  { label: "ALIGNMENT", icon: Alignment, path: "/wheel-alignment-hull" },
  { label: "ALLOY WHEELS", icon: Alloy, path: "/alloy-wheels" },
  { label: "SPARE WHEEL KIT", icon: Spare, path: "/spare-wheel" },
];

  return (
    <>
      <div className="topBar">
        <div className="topItem">
          <PhoneIcon />
          <span>01482 328800</span>
        </div>

        <div className="topItem">
          <MailIcon />
          <span>info@tyremen.co.uk</span>
        </div>

        <div className="topItem">
          <LocationIcon />
          <span>Tyremen, Witty Street, Hull HU3 4TX</span>
        </div>

        <div className="topRight">
          <span className="hoursLabel">OPENING HOURS</span>
          <span>Mon - Fri: 8:30am - 5:30pm | Sat: 8:30am - 2:00pm</span>
        </div>
      </div>

      <header className="mainHeader">
        <Link to="/" className="logoBlock">
          <div className="logoText">TYREMEN</div>
          <div className="logoSub">MORE THAN JUST TYRES</div>
        </Link>

        <nav className="iconNav">
  {navLinks.map((item) => (
    <Link
      key={item.path}
      to={linkTo(item.path)}
      state={vehicleState}
      className="navItem"
    >
      <div className="navIcon">
  <img src={item.icon} alt={`${item.label} icon`} />
</div>

<span className="navLabel">
  {item.label}</span>
    </Link>
  ))}
</nav>

        <button className="bookNow design2Button" onClick={() => navigate(linkTo("/booking"), { state: vehicleState })}>
  <FaRegCalendarAlt />
  <span>BOOK NOW</span>
</button>
      </header>
    </>
  );
}