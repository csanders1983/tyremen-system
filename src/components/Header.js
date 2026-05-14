import { Link, useNavigate } from "react-router-dom";
import "./Header.css";

/* ICONS */

const PhoneIcon = () => (
  <svg viewBox="0 0 64 64" className="topIcon">
    <path d="M18 10c2-2 6-2 8 0l6 6c2 2 2 6 0 8l-4 4c3 6 8 11 14 14l4-4c2-2 6-2 8 0l6 6c2 2 2 6 0 8-4 4-10 6-16 4C28 52 12 36 8 20c-2-6 0-12 4-16z"
      stroke="#ffd000" strokeWidth="4" fill="none"/>
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 64 64" className="topIcon">
    <rect x="8" y="16" width="48" height="32" rx="4" stroke="#ffd000" strokeWidth="4" fill="none"/>
    <path d="M8 18l24 18 24-18" stroke="#ffd000" strokeWidth="4"/>
  </svg>
);

const LocationIcon = () => (
  <svg viewBox="0 0 64 64" className="topIcon">
    <path d="M32 8c10 0 18 8 18 18 0 14-18 30-18 30S14 40 14 26c0-10 8-18 18-18z"
      stroke="#ffd000" strokeWidth="4" fill="none"/>
    <circle cx="32" cy="26" r="6" fill="#ffd000"/>
  </svg>
);

/* COMPONENT */

export default function Header() {
  const navigate = useNavigate();

  return (
    <>
      {/* TOP BAR */}
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
          <span>Mon - Fri: 8:00am - 5:30pm | Sat: 8:00am - 1:00pm</span>
        </div>
      </div>

      {/* MAIN HEADER */}
      <header className="mainHeader">
        <Link to="/" className="logoBlock">
        <div className="logoText">TYREMEN</div>
        <div className="logoSub">MORE THAN JUST TYRES</div>
      </Link>

        <nav>
          <Link to="/tyres">TYRES</Link>
          <Link to="/car-servicing-hull">SERVICING</Link>
          <Link to="/mot-hull">MOT</Link>
          <Link to="/brakes-hull">BRAKES</Link>
          <Link to="/air-conditioning-hull">AIR CON</Link>
          <Link to="/clutch-repairs-hull">CLUTCHES</Link>
          <Link to="/timing-belt-hull">TIMING</Link>
          <Link to="/wheel-alignment-hull">ALIGNMENT</Link>
          <Link to="/alloy-wheels">ALLOY WHEELS</Link>
          <Link to="/tyre-size-calculator">TYRES SIZE CALCULATOR</Link>
        </nav>

        <button className="bookNow" onClick={() => navigate("/booking")}>
          BOOK NOW
        </button>
      </header>
    </>
  );
}