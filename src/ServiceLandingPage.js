
import Header from "./components/Header";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import servicePages from "./servicePages";
import "./ServiceLandingPage.css";
import { saveBasket } from "./Basket";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";



const VEHICLE_LOOKUP_URL =
  "https://vehiclelookup-tx3ipea3qa-uc.a.run.app?vrm=";

export default function ServiceLandingPage({ pageKey }) {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [registration, setRegistration] = useState("");
  const [description, setDescription] = useState("");
  const [sent, setSent] = useState(false);

  const [serviceReg, setServiceReg] = useState(() => {
    return localStorage.getItem("tyremenVrm") || "";
  });

  const [serviceVehicle, setServiceVehicle] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("tyremenVehicle") || "null");
    } catch {
      return null;
    }
  });

  const [pricingLoading, setPricingLoading] = useState(false);
  const [addMotOffer, setAddMotOffer] = useState(false);
  const [openService, setOpenService] = useState(null);

  const [motPrices, setMotPrices] = useState({
    class4: 40,
    class7: 45,
  });

  const [servicePricing, setServicePricing] = useState({
    oil: 120,
    interim: 128.5,
    full: 155,
    major: 180,
  });

  const page = servicePages[pageKey];

  const heroImages = {
    tyresHull: "/tyres-hero.jpg",
    motHull: "/mot-hero.jpg",
    servicingHull: "/service-hero.jpg",
    brakesHull: "/brakes-hero.jpg",
    airconHull: "/aircon-hero.jpg",
    alignmentHull: "/alignment-hero.jpg",
    clutchHull: "/clutch.jpg",
    timingHull: "/timing-belt.jpg",
  };

  const serviceMap = {
    timingHull: "Timing Belt",
    clutchHull: "Clutch",
    airconHull: "Air Conditioning",
  };

  const sourceMap = {
    timingHull: "Timing Belt Page",
    clutchHull: "Clutch Page",
    airconHull: "Air Con Page",
  };

  const getMatrixPrice = async (serviceType, engineCC) => {
    const q = query(
      collection(db, "servicePricingMatrix"),
      where("serviceType", "==", serviceType)
    );

    const snapshot = await getDocs(q);

    const rows = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    const match = rows.find(
      (row) =>
        Number(engineCC) >= Number(row.minCC) &&
        Number(engineCC) <= Number(row.maxCC)
    );

    return Number(match?.priceIncVat || 0);
  };

  const loadServicePricesForVehicle = async (vehicle) => {
    if (!vehicle?.engineCC) return;

    const engineCC = Number(vehicle.engineCC || 0);

    const oil = await getMatrixPrice("oil", engineCC);
    const interim = await getMatrixPrice("interim", engineCC);
    const full = await getMatrixPrice("full", engineCC);
    const major = await getMatrixPrice("major", engineCC);

    setServicePricing({
      oil: oil || 120,
      interim: interim || 128.5,
      full: full || 155,
      major: major || 180,
    });
  };

  useEffect(() => {
    if (page) {
      document.title = page.title;
    }
  }, [page]);

  useEffect(() => {
    const unsubClass4 = onSnapshot(doc(db, "motPricing", "class4"), (snap) => {
      if (snap.exists()) {
        setMotPrices((prev) => ({
          ...prev,
          class4: snap.data().price || 40,
        }));
      }
    });

    const unsubClass7 = onSnapshot(doc(db, "motPricing", "class7"), (snap) => {
      if (snap.exists()) {
        setMotPrices((prev) => ({
          ...prev,
          class7: snap.data().price || 45,
        }));
      }
    });

    return () => {
      unsubClass4();
      unsubClass7();
    };
  }, []);

  useEffect(() => {
    if (pageKey !== "servicingHull") return;
    if (!serviceVehicle?.engineCC) return;

    loadServicePricesForVehicle(serviceVehicle);
  }, [pageKey, serviceVehicle]);

  if (!page) return null;

  const airconType =
    Number(serviceVehicle?.year || 0) >= 2015 ? "r1234yf" : "r134a";

  const lookupServicePricing = async () => {
  if (!serviceReg.trim()) {
    alert("Please enter your registration.");
    return;
  }

  try {
    setPricingLoading(true);

    const cleanReg = serviceReg.toUpperCase().replace(/\s/g, "");

    const res = await fetch(VEHICLE_LOOKUP_URL + encodeURIComponent(cleanReg));
    const data = await res.json();

    if (!data.success) {
      alert("Vehicle lookup failed. Please check the registration.");
      return;
    }

    const vehicle = data.vehicle;

    localStorage.setItem("tyremenVehicle", JSON.stringify(vehicle));
    localStorage.setItem("tyremenVrm", vehicle.vrm || cleanReg);

    setServiceReg(vehicle.vrm || cleanReg);
    setServiceVehicle(vehicle);

    if (vehicle.engineCC) {
      await loadServicePricesForVehicle(vehicle);
    }
  } catch (err) {
    console.error(err);
    alert("Could not load vehicle details.");
  } finally {
    setPricingLoading(false);
  }
};

const addToBasket = (serviceName, type, price) => {
  const basketItem = {
    service: serviceName,
    type,
    price: Number(price || 0),
    vehicle: serviceVehicle || null,
    extras: "",
    icon:
      type === "Service"
        ? "🔧"
        : type === "Air Con"
        ? "❄️"
        : type === "Alignment"
        ? "📐"
        : "🚗",
  };

  saveBasket(basketItem);

  navigate(`/summary?service=${encodeURIComponent(serviceName)}`, {
    state: basketItem,
  });
};

  const submitQuote = async () => {
    if (!name || !phone || !email || !registration || !description) {
      alert("Please complete all fields");
      return;
    }

    try {
      await addDoc(collection(db, "quotes"), {
        name,
        phone,
        email,
        registration,
        description,
        service: serviceMap[pageKey] || "General Enquiry",
        sourcePage: sourceMap[pageKey] || "Website",
        status: "new",
        priority: "normal",
        createdAt: new Date(),
      });

      alert("Quote request sent. We will contact you shortly.");

      setName("");
      setPhone("");
      setEmail("");
      setRegistration("");
      setDescription("");
      setSent(true);
    } catch (error) {
      console.error("Quote submit failed:", error);
      alert("Quote failed to send. Check Firebase setup/rules.");
    }
  };

  const serviceCards = [
    {
      key: "oil",
      title: "OIL & FILTER",
      text: "Essential engine maintenance only",
      price: servicePricing.oil,
      included: [
        "Replace engine oil",
        "Replace oil filter",
        "Check oil level",
        "Check for oil leaks",
        "Reset service light where possible",
      ],
    },
    {
      key: "interim",
      title: "INTERIM SERVICE",
      text: "Best for 6,000 miles / 6 months",
      price: servicePricing.interim,
      included: [
        "Engine oil and filter change",
        "Brake inspection",
        "Tyre tread and pressure check",
        "Fluid level checks and top-ups",
        "Lights, battery and exhaust checks",
        "Steering and suspension inspection",
        "Service light reset",
      ],
    },
    {
      key: "full",
      title: "FULL SERVICE",
      text: "Best for 12,000 miles / 12 months",
      price: servicePricing.full,
      included: [
        "Oil and filter change",
        "Brake, tyre and suspension checks",
        "Battery and charging checks",
        "Coolant, brake fluid and screen wash check",
        "Wipers, lights and safety checks",
        "Full under-vehicle inspection",
        "Service book / digital record update",
      ],
    },
    {
      key: "major",
      title: "MAJOR SERVICE",
      text: "Best for 24,000 miles / 24 months",
      price: servicePricing.major,
      included: [
        "Full service checks included",
        "Air filter replacement",
        "Cabin filter check/replacement",
        "Spark plug/fuel filter check where applicable",
        "Full safety inspection",
        "Service book / digital record update",
      ],
    },
  ];

  return (
    <div className="landingPage">
      <Header />

      <section
        className={`landingHero ${heroImages[pageKey] ? "imageHero" : ""} ${
          pageKey === "airconHull" ? "airconHero" : ""
        }`}
        style={{
          backgroundImage: heroImages[pageKey]
            ? `url('${heroImages[pageKey]}')`
            : undefined,
        }}
      >
        <div>
          <p className="landingEyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p className="landingIntro">{page.intro}</p>

          <p className="heroTrust">
            ✔ Over 55 years experience • ✔ Trusted Hull garage • ✔ Same day
            availability
          </p>

          {pageKey === "servicingHull" ? (
            <div className="serviceHeroOffer">
              <div className="offerIcon">▣</div>

              <div className="offerMain">
                <span>GET MOT</span>
                <strong>FROM £20.00</strong>
              </div>

              <div className="offerDivider" />

              <div className="offerText">
                WHEN BOOKED WITH
                <br />A <b>SELECTED SERVICE</b>
              </div>

              <div className="offerSave">
                SAVE
                <strong>£20</strong>
                <small>ON YOUR MOT</small>
              </div>
            </div>
          ) : (
            <div className="landingButtons">
              <button onClick={() => navigate("/booking")}>
                {page.ctaPrimary}
              </button>

              <button className="outline" onClick={() => navigate("/booking")}>
                {page.ctaSecondary}
              </button>
            </div>
          )}
        </div>

        <div className="landingPanel">
          <h3>{page.highlight}</h3>

          {page.bullets.map((item) => (
            <div key={item} className="landingBullet">
              ✓ {item}
            </div>
          ))}
        </div>
      </section>

      {pageKey === "servicingHull" && (
        <section className="motDealStrip salesMot serviceOnlyStrip">
          <div className="motDealText serviceIntroPanel">
            <span>CAR SERVICING HULL</span>

            <h2>Book Your Service Today</h2>

            <p>
              Enter your registration to show the correct service price based on
              your engine size. Choose Interim, Full or Major service and add an
              MOT for only £20.00.
            </p>

            <div className="serviceVrmBox">
              <input
                placeholder="ENTER REG"
                value={serviceReg}
                onChange={(e) => setServiceReg(e.target.value.toUpperCase())}
              />

              <button type="button" onClick={lookupServicePricing}>
                {pricingLoading ? "CHECKING..." : "GET PRICES"}
              </button>
            </div>

            {serviceVehicle && (
              <div className="serviceVehicleResult">
                <strong>
                  {serviceVehicle.vrm} — {serviceVehicle.year}{" "}
                  {serviceVehicle.make} {serviceVehicle.model}
                </strong>

                <span>
                  ENGINE: {serviceVehicle.engineCC || "Unknown"}cc
                  {serviceVehicle.engineLitres
                    ? ` / ${serviceVehicle.engineLitres}L`
                    : ""}
                </span>
              </div>
            )}

            {serviceVehicle?.image && (
              <div className="serviceVehicleImageBox">
                <img
                  src={serviceVehicle.image}
                  alt={serviceVehicle.model || "Vehicle"}
                />
              </div>
            )}

            <div className="serviceMotToggle">
              <div>
                <strong>Add MOT for £20.00</strong>
                <span>Interim, Full or Major only</span>
              </div>

              <button
                type="button"
                className={addMotOffer ? "active" : ""}
                onClick={() => setAddMotOffer((prev) => !prev)}
              >
                {addMotOffer ? "MOT ADDED ✓" : "ADD MOT +£20"}
              </button>
            </div>
          </div>

          <div className="motDealCards serviceSalesCards serviceCardsLive">
            {serviceCards.map((card, index) => {
              const motBlocked = addMotOffer && card.key === "oil";

              const totalPrice =
                addMotOffer && card.key !== "oil"
                  ? Number(card.price || 0) + 20
                  : Number(card.price || 0);

              const isOpen = openService === card.key;

              return (
                <div
                  className={`motCard serviceOptionCard ${
                    index === 1 ? "featured" : ""
                  } ${motBlocked ? "serviceDisabled" : ""}`}
                  key={card.key}
                >
                  <div className="motTag">SERVICE OPTION</div>

                  {addMotOffer && card.key !== "oil" && (
                    <div className="serviceMotAdded">MOT ADDED +£20</div>
                  )}

                  <h3>{card.title}</h3>
                  <p>{card.text}</p>

                  <div className="servicePriceWrap">
                    {serviceVehicle?.vrm && (
                      <div className="serviceCardReg">
                        {serviceVehicle.vrm}
                      </div>
                    )}

                    <div className="servicePrice">
                      £{Number(totalPrice || 0).toFixed(2)}
                    </div>
                  </div>

                  <div className="serviceButtonsWrap">
                    <button
                      type="button"
                      className={`includesToggle modernBtn ${
                        isOpen ? "activeToggle" : ""
                      }`}
                      onClick={() =>
                        setOpenService(isOpen ? null : card.key)
                      }
                    >
                      <span className="btnIcon">{isOpen ? "−" : "+"}</span>

                      <span className="btnText">
                        {isOpen ? "HIDE INCLUDED" : "WHAT’S INCLUDED"}
                      </span>

                      <span className={`btnArrow ${isOpen ? "rotate" : ""}`}>
                        ▾
                      </span>
                    </button>

                    <div
                      className={`includesContent ${isOpen ? "open" : ""}`}
                    >
                      <ul>
                        {card.included.map((item) => (
                          <li key={item}>✓ {item}</li>
                        ))}
                      </ul>
                    </div>

                    <button
                      className="bookNowModern"
                      disabled={motBlocked}
                      onClick={() =>
                        addToBasket(
                          addMotOffer && card.key !== "oil"
                            ? `${card.title} + MOT`
                            : card.title,
                          "Service",
                          Number(totalPrice || 0)
                        )
                      }
                    >
                      <span className="btnIcon calendarIcon">🗓</span>

                      <span className="btnText">
                        {motBlocked ? "NOT AVAILABLE WITH MOT" : "BOOK NOW"}
                      </span>

                      <span className="bookArrow">→</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {pageKey === "motHull" &&
        (() => {
          const recommendedMotClass =
            Number(serviceVehicle?.grossWeightKg || 0) > 3000
              ? "class7"
              : "class4";

          return (
            <section className="motDealStrip salesMot motOnlyStrip">
              <div className="motDealText">
                <span>MOT TESTING HULL</span>

                <h2>Book Your MOT Today — Class 4 & Class 7 Available</h2>

                <p>
                  Fast MOT testing in Hull with clear advice, fair pricing and
                  repairs available if needed.
                </p>

                {serviceVehicle && (
                  <div className="serviceVehicleResult motVehicleResult">
                    <strong>
                      {serviceVehicle.vrm} — {serviceVehicle.year}{" "}
                      {serviceVehicle.make} {serviceVehicle.model}
                    </strong>

                    <span>
                      RECOMMENDED MOT:{" "}
                      {recommendedMotClass === "class7"
                        ? "CLASS 7"
                        : "CLASS 4"}
                    </span>
                  </div>
                )}

                {serviceVehicle?.image && (
                  <div className="motVehicleImageBox">
                    <img
                      src={serviceVehicle.image}
                      alt={serviceVehicle.model || "Vehicle"}
                    />
                  </div>
                )}
              </div>

              <div className="motDealCards">
                <div
                  className={`motCard ${
                    recommendedMotClass === "class4"
                      ? "recommendedMot"
                      : "notRecommendedMot"
                  }`}
                >
                  {recommendedMotClass === "class4" && (
                    <div className="motRecommendedTag">RECOMMENDED</div>
                  )}

                  {recommendedMotClass === "class4" &&
                    serviceVehicle?.vrm && (
                      <div className="motRegTag">{serviceVehicle.vrm}</div>
                    )}

                  <h3>CLASS 4 MOT</h3>

                  <div className="motTag">MOST CARS</div>

                  <p>Cars, small vans and passenger vehicles.</p>

                  <div className="motPrice">
                    £{Number(motPrices.class4).toFixed(2)}
                  </div>

                  <ul>
                    <li>✔ Ideal for cars & small vans</li>
                    <li>✔ Clear pass/fail advice</li>
                    <li>✔ Repairs available if needed</li>
                  </ul>

                  <button onClick={() => navigate("/booking")}>
                    BOOK CLASS 4 MOT →
                  </button>
                </div>

                <div
                  className={`motCard ${
                    recommendedMotClass === "class7"
                      ? "recommendedMot"
                      : "notRecommendedMot"
                  }`}
                >
                  {recommendedMotClass === "class7" && (
                    <div className="motRecommendedTag">RECOMMENDED</div>
                  )}

                  {recommendedMotClass === "class7" &&
                    serviceVehicle?.vrm && (
                      <div className="motRegTag">{serviceVehicle.vrm}</div>
                    )}

                  <div className="motTag">VANS & COMMERCIALS</div>

                  <h3>CLASS 7 MOT</h3>

                  <p>For larger vans and light commercial vehicles.</p>

                  <div className="motPrice">
                    £{Number(motPrices.class7).toFixed(2)}
                  </div>

                  <ul>
                    <li>✔ Class 7 MOT testing</li>
                    <li>✔ Great for business vans</li>
                    <li>✔ Hull garage you can trust</li>
                  </ul>

                  <button
                    disabled={recommendedMotClass !== "class7"}
                    onClick={() => navigate("/booking")}
                  >
                    BOOK CLASS 7 MOT →
                  </button>
                </div>
              </div>
            </section>
          );
        })()}

      {pageKey === "airconHull" && (
        <section className="motDealStrip salesMot airconOnlyStrip">
          <div className="motDealText airconIntroPanel">
            <span>AIR CONDITIONING HULL</span>

            <h2>Air Con Regas & Leak Testing</h2>

            <p>
              Choose the correct air con service for your vehicle. We offer
              R134a gas, R1234yf gas and leak testing at Tyremen Hull.
            </p>

            {serviceVehicle && (
              <div className="airconVehicleResult">
                <div className="airconVehicleIcon">🧊</div>

                <div className="airconVehicleTop">
                  <strong>
                    {serviceVehicle.vrm} — {serviceVehicle.year}{" "}
                    {serviceVehicle.make} {serviceVehicle.model}
                  </strong>

                  <span>
                    {serviceVehicle.engineLitres
                      ? `${serviceVehicle.engineLitres}L`
                      : ""}
                    {serviceVehicle.fuel ? ` ${serviceVehicle.fuel}` : ""}{" "}
                    {serviceVehicle.transmission || ""}{" "}
                    {serviceVehicle.bodyType || ""}
                  </span>
                </div>

                <div className="airconRecommendedGas">
                  <b>RECOMMENDED GAS:</b>
                  <em>{airconType === "r1234yf" ? "R1234yf" : "R134a"}</em>
                </div>
              </div>
            )}

            {serviceVehicle?.image && (
              <div className="airconVehicleImageBox">
                <img
                  src={serviceVehicle.image}
                  alt={serviceVehicle.model || "Vehicle"}
                />
              </div>
            )}
          </div>

          <div className="motDealCards airconSalesCards">
            {[
              {
                key: "r134a",
                title: "R134a GAS",
                text: "Vehicles up to 2014",
                price: 64.99,
                tag:
                  airconType === "r134a"
                    ? "RECOMMENDED"
                    : "AIR CON OPTION",
                serviceName: "Air Con R134a Regas",
              },
              {
                key: "r1234yf",
                title: "R1234yf GAS",
                text: "Vehicles 2015 onwards",
                price: 124.99,
                tag:
                  airconType === "r1234yf"
                    ? "RECOMMENDED"
                    : "NEWER VEHICLES",
                serviceName: "Air Con R1234yf Regas",
              },
              {
                key: "leak",
                title: "LEAK TEST",
                text: "Air con leak detection",
                price: 40,
                tag: "AIR CON OPTION",
                serviceName: "Air Con Leak Test",
              },
            ].map((card) => {
              const isRecommended = card.key === airconType;

              return (
                <div
                  className={`motCard airconCard ${
                    isRecommended ? "featured airconRecommended" : ""
                  }`}
                  key={card.key}
                >
                  <div className="motTag">{card.tag}</div>

                                           {isRecommended && serviceVehicle?.vrm && (
  		<div className="airconRegTag">{serviceVehicle.vrm}</div>
		)}

                  <h3>{card.title}</h3>

                  <p>{card.text}</p>

                  <div className="airconPrice">
                    £{Number(card.price).toFixed(2)}
                  </div>

                  <ul>
                    <li>✔ Clear pricing</li>
                    <li>✔ Trusted Hull garage</li>
                    <li>✔ Book online today</li>
                  </ul>

                  <button
                    className="airconBookBtn"
                    onClick={() =>
                      addToBasket(card.serviceName, "Air Con", card.price)
                    }
                  >
                    BOOK NOW →
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {pageKey === "alignmentHull" && (
        <section className="motDealStrip salesMot">
          <div className="motDealText">
            <span>WHEEL ALIGNMENT HULL</span>
            <h2>Precision Wheel Alignment</h2>
            <p>
              Improve tyre life, handling and fuel efficiency with professional
              wheel alignment at Tyremen Hull.
            </p>

            <div className="motOfferBanner">
              <div>
                <strong>DRIVE STRAIGHT</strong>
                <span>Stop uneven tyre wear today</span>
              </div>

              <button onClick={() => navigate("/booking")}>
                BOOK ALIGNMENT →
              </button>
            </div>
          </div>

          <div className="motDealCards">
            {[
              [
                "CAR ALIGNMENT",
                "Standard front alignment",
                "£35.95",
                "Wheel Alignment Car",
                35.95,
              ],
              [
                "VAN ALIGNMENT",
                "Larger vehicle alignment",
                "£43.00",
                "Wheel Alignment Van",
                43,
              ],
              [
                "4 WHEEL ALIGNMENT",
                "Full computer alignment",
                "£95.00",
                "4 Wheel Alignment",
                95,
              ],
            ].map(([title, text, price, serviceName, basketPrice], index) => (
              <div
                className={`motCard ${index === 2 ? "featured" : ""}`}
                key={title}
              >
                <div className="motTag">
                  {index === 2 ? "FULL SETUP" : "ALIGNMENT"}
                </div>

                <h3>{title}</h3>
                <p>{text}</p>
                <div className="motPrice">{price}</div>

                <ul>
                  <li>✔ Prevent uneven tyre wear</li>
                  <li>✔ Improve fuel efficiency</li>
                  <li>✔ Better handling & safety</li>
                </ul>

                <button
                  onClick={() =>
                    addToBasket(serviceName, "Alignment", basketPrice)
                  }
                >
                  BOOK NOW →
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {(pageKey === "timingHull" || pageKey === "clutchHull") && (
        <section className="quoteConvertStrip">
          <div className="quoteConvertText">
            <span>
              {pageKey === "timingHull"
                ? "TIMING BELT QUOTES"
                : "CLUTCH REPAIR QUOTES"}
            </span>

            <p className="quoteSource">
              Request from:{" "}
              <strong>
                {pageKey === "timingHull" ? "Timing Belt Page" : "Clutch Page"}
              </strong>
            </p>

            <h2>
              {pageKey === "timingHull"
                ? "Need a Timing Belt Quote?"
                : "Need a Clutch Replacement Quote?"}
            </h2>

            <p>
              Prices vary depending on vehicle make, model, engine size and
              parts required. Fill out the form and our Hull team will contact
              you with a clear quote.
            </p>

            <div className="quoteChecklist">
              <div>✔ Fast quote response</div>
              <div>✔ Trusted Hull garage</div>
              <div>✔ No hidden work without approval</div>
            </div>
          </div>

          <div className="quoteForm">
            <h3>Request a Quote</h3>
            <p>Fill this out and we’ll get back to you quickly.</p>

            <input
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              placeholder="Contact Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              placeholder="Vehicle Registration"
              value={registration}
              onChange={(e) => setRegistration(e.target.value.toUpperCase())}
            />

            <textarea
              placeholder="Describe the issue or work needed"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <button type="button" onClick={submitQuote}>
              GET QUOTE →
            </button>

            {sent && (
              <p className="quoteSentMessage">
                Thanks, your quote request has been sent.
              </p>
            )}

            <div className="quoteContactOptions">
              <a href="tel:01482328800">Call 01482 328800</a>
              <a href="mailto:info@tyremen.co.uk">
                Email info@tyremen.co.uk
              </a>
            </div>
          </div>
        </section>
      )}

      {pageKey === "tyresHull" && (
        <section className="tyreDealStrip">
          <div className="tyreDealText">
            <span>POPULAR TYRE OPTIONS</span>
            <h2>Budget, Mid-Range & Premium Tyres Fitted in Hull</h2>
            <p>
              Choose from great-value everyday tyres through to premium brands,
              all fitted by our Hull team.
            </p>
          </div>

          <div className="tyreDealCards">
            <div className="tyreDealCard">
              <h3>BUDGET</h3>
              <p>Great value tyres for everyday driving.</p>
              <strong>From £45 fitted</strong>
            </div>

            <div className="tyreDealCard featured">
              <h3>MID-RANGE</h3>
              <p>Popular balance of price, grip and comfort.</p>
              <strong>Best seller</strong>
            </div>

            <div className="tyreDealCard">
              <h3>PREMIUM</h3>
              <p>Top brands for performance and safety.</p>
              <strong>Michelin • Goodyear • Pirelli</strong>
            </div>
          </div>
        </section>
      )}

      <section className="landingContent">
        {page.sections.map((section) => (
          <div className="contentCard" key={section.heading}>
            <h2>{section.heading}</h2>

            <p>
              {section.text} We also offer{" "}
              <Link to="/brakes-hull">brake repairs in Hull</Link>,{" "}
              <Link to="/car-servicing-hull">car servicing</Link> and{" "}
              <Link to="/mot-hull">MOT testing</Link>.
            </p>
          </div>
        ))}
      </section>

      <section className="faqSection">
        <h2>Frequently Asked Questions</h2>

        <div className="faqGrid">
          {page.faqs.map(([q, a]) => (
            <div className="faqCard" key={q}>
              <h3>{q}</h3>
              <p>{a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landingCTA">
        <h2>Ready to book with Tyremen?</h2>
        <p>Book online or call our Hull team today.</p>
        <button onClick={() => navigate("/booking")}>Book Now</button>
      </section>
    </div>
  );
}