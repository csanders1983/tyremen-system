import { useState } from "react";
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

const services = [
  { title: "TYRES", text: "Find tyres", icon: tyreIcon, link: "/tyres" },
  { title: "SERVICING", text: "Book a service", icon: serviceIcon, link: "/car-servicing-hull" },
  { title: "BRAKES", text: "Brake check", icon: brakeIcon, link: "/brakes-hull" },
  { title: "MOT", text: "Book an MOT", icon: motIcon, link: "/mot-hull" },
  { title: "AIR CON", text: "Regas & repair", icon: airconIcon, link: "/air-conditioning-hull" },
  { title: "CLUTCHES", text: "Fitting & repair", icon: clutchIcon, link: "/clutch-repairs-hull" },
  { title: "TIMING BELT", text: "Check & replace", icon: timingIcon, link: "/timing-belt-hull" },
  { title: "DIAGNOSTICS", text: "Vehicle diagnostics", icon: diagnosticsIcon, link: "/booking" },
];

const SameDayIcon = () => (
  <svg viewBox="0 0 64 64" className="trustIcon">
    <rect x="10" y="16" width="44" height="36" rx="6" stroke="currentColor" strokeWidth="5" fill="none" />
    <line x1="10" y1="26" x2="54" y2="26" stroke="currentColor" strokeWidth="5" />
    <circle cx="32" cy="38" r="6" fill="#ffd000" />
  </svg>
);

const PriceIcon = () => (
  <svg viewBox="0 0 64 64" className="trustIcon">
    <path d="M32 6l20 8v14c0 14-10 24-20 30C22 52 12 42 12 28V14l20-8z" stroke="currentColor" strokeWidth="5" fill="none" />
    <path d="M24 32l6 6 10-10" stroke="#ffd000" strokeWidth="5" fill="none" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 64 64" className="trustIcon">
    <polygon points="32,6 40,24 60,24 44,36 50,56 32,44 14,56 20,36 4,24 24,24" stroke="currentColor" strokeWidth="5" fill="none" />
    <circle cx="32" cy="32" r="4" fill="#ffd000" />
  </svg>
);

export default function Home() {
  const navigate = useNavigate();

  const [registration, setRegistration] = useState("");
  const [vehicle, setVehicle] = useState(null);
  const [loadingVehicle, setLoadingVehicle] = useState(false);

  async function lookupVehicle() {
    const cleanReg = registration.toUpperCase().replace(/\s/g, "");

    if (!cleanReg) {
      alert("Please enter your registration");
      return;
    }

    try {
      setLoadingVehicle(true);

      const res = await fetch(
        "https://vehiclelookup-tx3ipea3qa-uc.a.run.app?vrm=" + cleanReg
      );

      const data = await res.json();

      if (!data.success) {
        alert("Vehicle lookup failed");
        return;
      }

      setVehicle(data.vehicle);
    } catch (err) {
      console.error(err);
      alert("Vehicle lookup failed");
    } finally {
      setLoadingVehicle(false);
    }
  }

  function continueToTyres() {
    const cleanReg = registration.toUpperCase().replace(/\s/g, "");

    if (cleanReg) {
      navigate(`/tyres?vrm=${cleanReg}`);
    } else {
      navigate("/tyres");
    }
  }

  return (
    <div className="homePage">
      <Header />

      <section className="hero">
        <div className="heroLeft">
          <div className="heroContent">
            <p>HULL'S TRUSTED GARAGE</p>

            <h1>
              MORE THAN <br />
              JUST <span>TYRES</span>
            </h1>

            <div className="heroServices">
              TYRES <b>•</b> SERVICING <b>•</b> MOT <b>•</b> REPAIRS
            </div>

            <div className="trustBadges">
              <div>
                <SameDayIcon />
                <span>SAME DAY<br />Appointments</span>
              </div>

              <div>
                <PriceIcon />
                <span>PRICE MATCH<br />Guarantee</span>
              </div>

              <div>
                <StarIcon />
                <span>4.8/5<br />Google Rating</span>
              </div>
            </div>

            <div className="heroButtons">
              <button onClick={() => navigate("/tyres")}>
                FIND TYRES →
              </button>

              <button className="outlineBtn" onClick={() => navigate("/booking")}>
                BOOK SERVICE / MOT →
              </button>
            </div>
          </div>
        </div>

        <div
          className="heroRight"
          style={{ backgroundImage: `url(${heroCar})` }}
        />
      </section>

      <section className="regSearch">
        <div className="gbBox">GB</div>

        <div className="regMain">
          <h3>
            FIND THE <span>RIGHT TYRES</span> FOR YOUR VEHICLE
          </h3>

          <div className="regInputRow">
            <input
              value={registration}
              onChange={(e) => setRegistration(e.target.value.toUpperCase())}
              placeholder="ENTER REGISTRATION"
            />

            <button onClick={lookupVehicle}>
              {loadingVehicle ? "CHECKING..." : "FIND MY VEHICLE →"}
            </button>
          </div>

          {vehicle && (
            <div className="vehicleResult">
              {vehicle.image && (
                <img src={vehicle.image} alt={vehicle.model} />
              )}

              <div>
                <strong>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </strong>

                <p>
                  {vehicle.fuel} • {vehicle.body} • {vehicle.colour}
                </p>

                <button onClick={continueToTyres}>
                  CONTINUE TO TYRES →
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="steps">
          <div><b>1</b><span>ENTER YOUR REG<br /><small>We'll find your vehicle</small></span></div>
          <div><b>2</b><span>CHOOSE TYRES<br /><small>From our best prices</small></span></div>
          <div><b>3</b><span>BOOK ONLINE<br /><small>Fitted in Hull</small></span></div>
        </div>
      </section>

      <section className="serviceGrid">
        {services.map((item) => (
          <button
            key={item.title}
            className="serviceCard"
            onClick={() => navigate(item.link)}
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
          <h2>FREE MOT</h2>
          <h3>WITH ANY SERVICE</h3>
          <p>✓ SAVE £40 &nbsp; ✓ SAME-DAY APPOINTMENTS &nbsp; ✓ LIMITED SLOTS PER WEEK</p>
          <button onClick={() => navigate("/booking")}>BOOK NOW →</button>
        </div>

        <div className="whyBox">
          <h3>WHY CHOOSE TYREMEN?</h3>

          <div className="whyGrid">
            <div><b>55+</b><strong>YEARS</strong><span>Trusted locally</span></div>
            <div><b>★</b><strong>4.8/5</strong><span>Google rating</span></div>
            <div><b>✓</b><strong>HONEST</strong><span>No hidden costs</span></div>
            <div><b>⚙</b><strong>EXPERTS</strong><span>Skilled technicians</span></div>
            <div><b>📍</b><strong>LOCAL</strong><span>Hull based</span></div>
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

        <button className="callBox">CALL NOW<br />01482 328800</button>
      </footer>
    </div>
  );
}