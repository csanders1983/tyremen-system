import Header from "./components/Header";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import servicePages from "./servicePages";
import "./ServiceLandingPage.css";
import { saveBasket, servicePrices } from "./Basket";
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";

export default function ServiceLandingPage({ pageKey }) {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [registration, setRegistration] = useState("");
  const [description, setDescription] = useState("");
  const [sent, setSent] = useState(false);

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

  useEffect(() => {
    if (page) {
      document.title = page.title;
    }
  }, [page]);

  if (!page) return null;

  const addToBasket = (service, type, price) => {
    saveBasket({
      service,
      type,
      price,
      extras: "",
    });

    navigate(`/summary?service=${encodeURIComponent(service)}`);
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

          <div className="landingButtons">
            <button onClick={() => navigate("/tyres")}>
              {page.ctaPrimary}
            </button>

            <button className="outline" onClick={() => navigate("/booking")}>
              {page.ctaSecondary}
            </button>
          </div>
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

      {pageKey === "airconHull" && (
        <section className="motDealStrip salesMot">
          <div className="motDealText">
            <span>AIR CONDITIONING HULL</span>
            <h2>Air Con Regas & Leak Testing</h2>

            <p>
              Choose the correct air con service for your vehicle. We offer R134a
              gas, R1234yf gas and leak testing at Tyremen Hull.
            </p>
          </div>

          <div className="motDealCards airconSalesCards">
            {[
              [
                "R134a GAS",
                "Vehicles up to 2014",
                "£64.99",
                "Air Con R134a Regas",
                64.99,
              ],
              [
                "R1234yf GAS",
                "Vehicles 2015 onwards",
                "£124.99",
                "Air Con R1234yf Regas",
                124.99,
              ],
              [
                "LEAK TEST",
                "Air con leak detection",
                "£40.00",
                "Air Con Leak Test",
                40,
              ],
            ].map(([title, text, price, serviceName, basketPrice], index) => (
              <div
                className={`motCard ${index === 1 ? "featured" : ""}`}
                key={title}
              >
                <div className="motTag">
                  {index === 1 ? "NEWER VEHICLES" : "AIR CON OPTION"}
                </div>

                <h3>{title}</h3>
                <p>{text}</p>
                <div className="motPrice">{price}</div>

                <ul>
                  <li>✔ Clear pricing</li>
                  <li>✔ Trusted Hull garage</li>
                  <li>✔ Book online today</li>
                </ul>

                <button
                  onClick={() =>
                    addToBasket(serviceName, "Air Con", basketPrice)
                  }
                >
                  BOOK NOW →
                </button>
              </div>
            ))}
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

      {pageKey === "servicingHull" && (
        <section className="motDealStrip salesMot">
          <div className="motDealText">
            <span>CAR SERVICING HULL</span>
            <h2>Book Your Service Today — Free MOT with Selected Services</h2>

            <p>
              Choose from Oil & Filter, Interim, Full or Major Service with
              clear prices and trusted local technicians.
            </p>

            <div className="motOfferBanner">
              <div>
                <strong>FREE MOT</strong>
                <span>when booked with selected services</span>
              </div>

              <button onClick={() => navigate("/booking")}>
                BOOK SERVICE →
              </button>
            </div>
          </div>

          <div className="motDealCards serviceSalesCards">
            {[
              ["OIL & FILTER", "Essential engine maintenance", "FROM £120.00"],
              ["INTERIM SERVICE", "Ideal between annual services", "FROM £128.50"],
              ["FULL SERVICE", "Annual service for most vehicles", "FROM £155.00"],
              ["MAJOR SERVICE", "Complete service check", "FROM £180.00"],
            ].map(([title, text, price]) => (
              <div className="motCard" key={title}>
                <div className="motTag">SERVICE OPTION</div>
                <h3>{title}</h3>
                <p>{text}</p>
                <div className="motPrice">{price}</div>

                <ul>
                  <li>✔ Clear pricing</li>
                  <li>✔ Trusted Hull garage</li>
                  <li>✔ Book online today</li>
                </ul>

                <button
                  onClick={() => {
                    const item = servicePrices[title] || {
                      price: null,
                      type: "Service",
                    };

                    addToBasket(title, item.type, item.price);
                  }}
                >
                  BOOK NOW →
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {pageKey === "motHull" && (
        <section className="motDealStrip salesMot">
          <div className="motDealText">
            <span>MOT TESTING HULL</span>
            <h2>Book Your MOT Today — Class 4 & Class 7 Available</h2>

            <p>
              Fast MOT testing in Hull with clear advice, fair pricing and
              repairs available if needed. Book online today and keep your
              vehicle road legal.
            </p>

            <div className="motOfferBadge">FREE MOT with selected servicing</div>
          </div>

          <div className="motDealCards">
            <div className="motCard">
              <div className="motTag">MOST CARS</div>
              <h3>CLASS 4 MOT</h3>
              <p>Cars, small vans and passenger vehicles.</p>
              <div className="motPrice">£40</div>

              <ul>
                <li>✔ Ideal for cars & small vans</li>
                <li>✔ Clear pass/fail advice</li>
                <li>✔ Repairs available if needed</li>
              </ul>

              <button onClick={() => navigate("/booking")}>
                BOOK CLASS 4 MOT →
              </button>
            </div>

            <div className="motCard featured">
              <div className="motTag">VANS & COMMERCIALS</div>
              <h3>CLASS 7 MOT</h3>
              <p>For larger vans and light commercial vehicles.</p>
              <div className="motPrice">£45.00</div>

              <ul>
                <li>✔ Class 7 MOT testing</li>
                <li>✔ Great for business vans</li>
                <li>✔ Hull garage you can trust</li>
              </ul>

              <button onClick={() => navigate("/booking")}>
                BOOK CLASS 7 MOT →
              </button>
            </div>
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