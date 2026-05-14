import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import Header from "./components/Header";
import { db } from "./firebase";
import { getBasket, servicePrices, clearBasket, getStockNumber } from "./Basket";
import "./Booking.css";

export default function Booking() {
  const navigate = useNavigate();
  const location = useLocation();

  const passed = location.state || {};
  const tyreBasket = getBasket();
  const isTyreBooking = Array.isArray(tyreBasket) && tyreBasket.length > 0;
  const vehicle = tyreBasket.find((item) => item.vehicle)?.vehicle || null;

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [registration, setRegistration] = useState(vehicle?.vrm || "");
  const [submitting, setSubmitting] = useState(false);

  const times = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
  ];

  const makeTyreName = (tyre) => {
    return [
      tyre.axle ? `${tyre.axle.toUpperCase()} AXLE` : "",
      tyre.size,
      tyre.loadIndex && tyre.speedRating
        ? `${tyre.loadIndex}${tyre.speedRating}`
        : "",
      tyre.brand,
      tyre.pattern,
    ]
      .filter(Boolean)
      .join(" ");
  };

  const tyreItems = isTyreBooking
    ? tyreBasket.map((tyre) => ({
        name: makeTyreName(tyre),
        qty: Number(tyre.qty || 1),
        price: Number(tyre.price || 0),
        type: "tyre",
        axle: tyre.axle || "",
        stockNumber: getStockNumber(tyre),
        size: tyre.size || "",
        brand: tyre.brand || "",
        pattern: tyre.pattern || "",
        loadIndex: tyre.loadIndex || "",
        speedRating: tyre.speedRating || "",
        runflat: tyre.runflat || "",
      }))
    : [];

  const tyreTotal = tyreItems.reduce((sum, item) => {
    return sum + Number(item.price || 0) * Number(item.qty || 1);
  }, 0);

  const serviceKey = passed.serviceKey || passed.key || passed.type || "mot";

  const serviceName = isTyreBooking
    ? tyreItems.map((item) => `${item.qty} x ${item.name}`).join(", ")
    : passed.service ||
      passed.name ||
      passed.title ||
      passed.serviceName ||
      "Service / MOT";

  const totalPrice = isTyreBooking
    ? tyreTotal
    : Number(
        passed.price ||
          passed.total ||
          passed.servicePrice ||
          servicePrices[serviceKey] ||
          0
      );

  const items = isTyreBooking
    ? tyreItems
    : [
        {
          name: serviceName,
          qty: 1,
          price: totalPrice,
          type: "service",
        },
      ];

  const submitBooking = async () => {
    if (!date || !time || !name || !phone || !email || !registration) {
      alert("Please complete date, time and all customer details.");
      return;
    }

    setSubmitting(true);

    try {
      await addDoc(collection(db, "jobs"), {
        name,
        phone,
        email,
        registration: registration.toUpperCase(),

        vehicle: vehicle || null,

        service: serviceName,
        serviceKey: isTyreBooking ? "tyres" : serviceKey,
        type: isTyreBooking ? "tyres" : "service",

        tyres: tyreItems,
        items,

        date,
        time,
        price: totalPrice,
        total: totalPrice,

        status: "New",
        source: "Website",

        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),

        originalBasket: {
          tyreBasket,
          passed,
        },
      });

      clearBasket();
      alert("Booking sent successfully.");
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Booking failed. Please try again.");
    }

    setSubmitting(false);
  };

  return (
    <div className="bookingPage">
      <Header />

      <main className="bookingWrapPro">
        <section className="bookingHeroPro">
          <div>
            <span>BOOK ONLINE</span>
            <h1>Book Your Fitting</h1>
            <p>
              Choose your preferred drop-off time and send your booking straight
              to Tyremen Hull.
            </p>
          </div>

          <div className="bookingHeroBadges">
            <div>Clear pricing</div>
            <div>No hidden costs</div>
            <div>Local trusted garage</div>
          </div>
        </section>

        <section className="bookingSteps">
          <div>1. Search</div>
          <div>2. Choose Tyre</div>
          <div>3. Basket</div>
          <div className="active">4. Book Fitting</div>
        </section>

        {vehicle && (
          <section className="bookingVehicleCard">
            {vehicle.image && <img src={vehicle.image} alt={vehicle.model} />}

            <div>
              <div className="bookingReg">{vehicle.vrm}</div>
              <h2>
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h2>
              <p>
                {vehicle.fuel} • {vehicle.body} • {vehicle.colour}
              </p>
            </div>
          </section>
        )}

        <section className="bookingMainGrid">
          <aside className="bookingSummaryCard">
            <h2>You’re booking</h2>

            <div className="bookingPriceBox">
              <span>Total fitted price</span>
              <strong>£{totalPrice.toFixed(2)}</strong>
              <small>Includes fitting, valve, balance and VAT.</small>
            </div>

            {isTyreBooking ? (
              <div className="miniTyreList">
                {tyreItems.map((tyre, index) => (
                  <div className="miniTyreItem" key={index}>
                    {tyre.axle && (
                      <span className="miniAxleTag">
                        {tyre.axle.toUpperCase()} AXLE
                      </span>
                    )}

                    <strong>
                      {tyre.qty} x {tyre.size} {tyre.loadIndex}
                      {tyre.speedRating}
                    </strong>

                    <p>
                      {tyre.brand} {tyre.pattern}
                    </p>

                    {tyre.stockNumber && (
                      <small>Stock No: {tyre.stockNumber}</small>
                    )}

                    <b>
                      £
                      {(
                        Number(tyre.price || 0) * Number(tyre.qty || 1)
                      ).toFixed(2)} 
                      </b>
                      &nbsp;Total Inc VAT 
                    
                  </div>
                ))}
              </div>
            ) : (
              <div className="serviceMiniBox">{serviceName}</div>
            )}

            

            <div className="bookingHelpBox">
              <span>Need help?</span>
              <strong>01482 328800</strong>
            </div>
          </aside>

          <section className="bookingFormCard">
            <h2>Select Date & Time</h2>

            <label>
              Preferred date
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>

            <label>Preferred drop-off time</label>

            <div className="timeGrid">
              {times.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  className={time === slot ? "timeBtn active" : "timeBtn"}
                  onClick={() => setTime(slot)}
                >
                  {slot}
                </button>
              ))}
            </div>

            <h2 className="detailsTitle">Your Details</h2>

            <div className="bookingFormGrid">
              <label>
                Name
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </label>

              <label>
                Phone
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>

              <label>
                Email
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <label>
                Registration
                <input
                  value={registration}
                  onChange={(e) => setRegistration(e.target.value)}
                />
              </label>
            </div>

            <button
              className="continueBtn"
              onClick={submitBooking}
              disabled={submitting}
            >
              {submitting ? "Sending Booking..." : "Send Booking →"}
            </button>
          </section>
        </section>
      </main>
    </div>
  );
}