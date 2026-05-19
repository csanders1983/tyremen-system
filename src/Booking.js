import { useEffect, useState } from "react";
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
  const params = new URLSearchParams(window.location.search);
  const urlVrm = params.get("vrm") || "";

  const tyreBasket = getBasket();
  const isTyreBooking = Array.isArray(tyreBasket) && tyreBasket.length > 0;

  const basketVehicle =
    tyreBasket.find((item) => item.vehicle)?.vehicle || passed.vehicle || null;

  const [vehicleData, setVehicleData] = useState(basketVehicle);
  const [loadingVehicle, setLoadingVehicle] = useState(false);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [registration, setRegistration] = useState(
    basketVehicle?.vrm || passed.registration || urlVrm || ""
  );

  const [confirm, setConfirm] = useState(false);
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

  useEffect(() => {
    async function loadVehicle() {
      if (!registration) return;

      try {
        setLoadingVehicle(true);

        const res = await fetch(
          `https://vehiclelookup-tx3ipea3qa-uc.a.run.app?vrm=${registration}`
        );

        const data = await res.json();

        if (data.success && data.vehicle) {
          setVehicleData(data.vehicle);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingVehicle(false);
      }
    }

    loadVehicle();
  }, [registration]);

  const tyreSize =
    vehicleData?.frontTyreSize ||
    vehicleData?.tyreSize ||
    passed.tyreSize ||
    "";

  const rearTyreSize = vehicleData?.rearTyreSize || "";

  const motExpiry =
    vehicleData?.motExpiryDate ||
    vehicleData?.motExpiry ||
    vehicleData?.motDueDate ||
    vehicleData?.motDate ||
    passed.motExpiry ||
    "";

  const motResult =
    vehicleData?.lastMotResult || vehicleData?.motResult || passed.motResult || "PASS";

  const motAdvisories =
    vehicleData?.motAdvisories || vehicleData?.advisories || passed.advisories || [];

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

  const goToTyres = () => {
    const vrm = registration || vehicleData?.vrm || "";

    if (!vrm) {
      navigate("/tyres");
      return;
    }

    navigate(`/tyres?vrm=${vrm}`, {
      state: {
        vehicle: vehicleData,
        tyreSize,
        registration: vrm,
      },
    });
  };

  const submitBooking = async () => {
    if (!date || !time || !name || !phone || !email || !registration) {
      alert("Please complete date, time and all customer details.");
      return;
    }

    if (!confirm) {
      alert("Please confirm the details are correct.");
      return;
    }

    setSubmitting(true);

    try {
      await addDoc(collection(db, "jobs"), {
        name,
        phone,
        email,
        registration: registration.toUpperCase(),

        vehicle: vehicleData || null,

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
            <h1>
              Book Your <em>Fitting</em>
            </h1>
            <p>
              Choose your preferred date and time and send your booking straight
              to Tyremen Hull.
            </p>
          </div>

          <div className="bookingHeroTrust">
            <div>
              <b>£</b>
              <span>
                Clear pricing
                <br />
                <small>No hidden costs</small>
              </span>
            </div>

            <div>
              <b>✓</b>
              <span>
                Local trusted garage
                <br />
                <small>Serving Hull for years</small>
              </span>
            </div>

            <div>
              <b>⏱</b>
              <span>
                Quick & easy
                <br />
                <small>Takes less than 2 mins</small>
              </span>
            </div>
          </div>
        </section>

        <section className="bookingSteps">
          <div>⌕ 1. Search</div>
          <div>◎ 2. Choose Tyre</div>
          <div>▣ 3. Basket</div>
          <div className="active">▣ 4. Book Fitting</div>
        </section>

        {loadingVehicle && (
          <div className="bookingVehicleLoading">Loading vehicle data...</div>
        )}

        {vehicleData && (
          <section className="bookingVehicleCardPro">
            <div className="vehicleImageBox">
              {vehicleData.image && (
                <img src={vehicleData.image} alt={vehicleData.model || "Vehicle"} />
              )}
            </div>

            <div className="vehicleMainText">
              <div className="bookingReg">
                {vehicleData.vrm || registration}
              </div>

              <h2>
                {vehicleData.make} {vehicleData.model}
              </h2>

              <p>
                {vehicleData.year && (
                  <>
                    {vehicleData.year} <span>•</span>{" "}
                  </>
                )}

                {vehicleData.fuel && (
                  <>
                    {vehicleData.fuel} <span>•</span>{" "}
                  </>
                )}

                Tyre size: <strong>{tyreSize || "Check vehicle"}</strong>
              </p>
            </div>

            <div className="vehicleDataGrid">
              <div>
                <small>MOT EXPIRY</small>
                <strong>{motExpiry || "Not found"}</strong>
              </div>

              <div>
                <small>LAST MOT RESULT</small>
                <strong>{motResult}</strong>
              </div>

              <div>
                <small>TYRE SIZE</small>
                <strong>
                  {rearTyreSize && rearTyreSize !== tyreSize
                    ? `${tyreSize} / ${rearTyreSize}`
                    : tyreSize || "Check vehicle"}
                </strong>
              </div>
            </div>

            <div className="advisoryStrip">
              <span>{motAdvisories.length ? "!" : "✓"}</span>
              {motAdvisories.length
                ? `${motAdvisories.length} MOT advisories found`
                : "No advisories on last MOT"}
            </div>
          </section>
        )}

        {vehicleData && tyreSize && !isTyreBooking && (
          <section className="bookingUpsellCard">
            <div>
              <span>TYRE SIZE FOUND FROM YOUR VEHICLE</span>
              <h2>Need tyres as well?</h2>
              <p>
                We found <strong>{tyreSize}</strong> for your{" "}
                {vehicleData.make} {vehicleData.model}. Add tyres to this
                booking before sending it.
              </p>

              {motAdvisories.length > 0 && (
                <small>
                  MOT advisory found — this may be worth checking before your visit.
                </small>
              )}
            </div>

            <button type="button" onClick={goToTyres}>
              View tyres for {tyreSize} →
            </button>
          </section>
        )}

        <section className="bookingMainGrid">
          <aside className="bookingSummaryCard">
            <h2>You’re Booking</h2>

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
                  </div>
                ))}
              </div>
            ) : (
              <div className="serviceMiniBox">
                <span>Service / MOT</span>
                <b>{serviceName}</b>
                <strong>£{totalPrice.toFixed(2)}</strong>
              </div>
            )}

            <div className="bookingHelpBox">
              <span>Need help?</span>
              <strong>01482 328800</strong>
              <small>Call us and we’ll help with your booking.</small>
            </div>
          </aside>

          <section className="bookingFormSplit">
            <div className="bookingFormCard">
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

              <div className="durationBox">
                <b>
                  ⏱ Estimated appointment duration: <span>45 minutes</span>
                </b>
                <small>
                  You’ll be notified by email once we receive your booking.
                </small>
              </div>
            </div>

            <div className="bookingFormCard">
              <h2>Your Details</h2>

              <label>
                Full name *
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </label>

              <label>
                Phone number *
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                />
              </label>

              <label>
                Email address *
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                />
              </label>

              <label>
                Vehicle registration *
                <input
                  value={registration}
                  onChange={(e) =>
                    setRegistration(e.target.value.toUpperCase())
                  }
                />
              </label>

              <label className="confirmBox">
                <input
                  type="checkbox"
                  checked={confirm}
                  onChange={(e) => setConfirm(e.target.checked)}
                />
                I confirm the details above are correct
              </label>
            </div>

            <button
              className="continueBtn"
              onClick={submitBooking}
              disabled={submitting}
            >
              <span>{submitting ? "Sending Booking..." : "Submit Booking"}</span>
              <b>→</b>
            </button>
          </section>
        </section>
      </main>
    </div>
  );
}