import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { db } from "./firebase";
import { getBasket, saveBasket, servicePrices, clearBasket, getStockNumber } from "./Basket";
import "./Booking.css";

export default function Booking() {
  const navigate = useNavigate();
  const location = useLocation();

  const passed = location.state || {};
  const params = new URLSearchParams(window.location.search);
  const urlVrm = params.get("vrm") || "";

  const tyreBasket = getBasket();
  const isTyreBooking =
  Array.isArray(tyreBasket) &&
  tyreBasket.some((item) => item.type === "tyre");

  const latestBasketVehicle =
  [...tyreBasket].reverse().find((item) => item.vehicle)?.vehicle || null;

const basketVehicle =
  passed.vehicle || latestBasketVehicle || null;

  const [vehicleData, setVehicleData] = useState(basketVehicle);
  const [loadingVehicle, setLoadingVehicle] = useState(false);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [registration, setRegistration] = useState(
  passed.registration ||
    passed.vehicle?.vrm ||
    latestBasketVehicle?.vrm ||
    urlVrm ||
    ""
);

  const currentBasketVrm =
  tyreBasket.find((item) => item.vehicle?.vrm)?.vehicle?.vrm || "";

useEffect(() => {
  if (!registration || !currentBasketVrm) return;

  if (
    registration.toUpperCase().replace(/\s/g, "") !==
    currentBasketVrm.toUpperCase().replace(/\s/g, "")
  ) {
    
  }
}, [registration, currentBasketVrm]);

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
    "16:00",
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
  ? tyreBasket
      .filter((item) => item.type === "tyre")
      .map((tyre) => ({
        id: tyre.id,
        name: makeTyreName(tyre),
        qty: Number(tyre.qty || 1),
        price: Number(tyre.price || 0),
        type: "tyre",
        category: tyre.category || "Tyre",
        axle: tyre.axle || "",
        stockNumber: getStockNumber(tyre),
        size: tyre.size || "",
        brand: tyre.brand || "",
        pattern: tyre.pattern || "",
        loadIndex: tyre.loadIndex || "",
        speedRating: tyre.speedRating || "",
        runflat: tyre.runflat || "",
        registration: tyre.registration || tyre.vehicle?.vrm || "",
        vehicle: tyre.vehicle || null,
      }))
    : [];

  const tyreTotal = tyreItems.reduce((sum, item) => {
    return sum + Number(item.price || 0) * Number(item.qty || 1);
  }, 0);

  const serviceKey = passed.serviceKey || passed.key || passed.type || "mot";

  

  

  const hasPassedService =
  (!Array.isArray(tyreBasket) || tyreBasket.length === 0) &&
  (passed.service ||
    passed.name ||
    passed.title ||
    passed.serviceName ||
    passed.serviceKey ||
    passed.key ||
    passed.type);
  

const serviceItem = hasPassedService
  ? {
      name:
        passed.service ||
        passed.name ||
        passed.title ||
        passed.serviceName ||
        "Service / MOT",
      qty: 1,
      price: Number(
        passed.price ||
          passed.total ||
          passed.servicePrice ||
          servicePrices[serviceKey] ||
          0
      ),
      type: "service",
    }
  : null;

const basketServiceItems = Array.isArray(tyreBasket)
  ? tyreBasket
      .filter((item) => item.type === "service")
      .map((item) => ({
        ...item,
        name: item.name || item.service || item.serviceName || "Service / MOT",
        qty: Number(item.qty || 1),
        price: Number(item.price || 0),
        type: "service",
      }))
  : [];

const items = [
  ...tyreItems,
  ...basketServiceItems,
  ...(serviceItem ? [serviceItem] : []),
];

const totalPrice = items.reduce((sum, item) => {
  return sum + Number(item.price || 0) * Number(item.qty || 1);
}, 0);

const serviceName = items
  .map((item) => {
    const name =
      item.name ||
      item.service ||
      item.serviceName ||
      item.title ||
      item.category ||
      "Booking Item";

    return `${item.qty || 1} x ${name}`;
  })
  .join(", ");

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

  const updateItemQty = (id, qty) => {
  const updated = tyreBasket.map((item) =>
    item.id === id ? { ...item, qty: Math.max(1, Number(qty || 1)) } : item
  );

  saveBasket(updated);
  window.location.reload();
};

const removeItem = (id) => {
  const updated = tyreBasket.filter((item) => item.id !== id);

  saveBasket(updated);
  window.location.reload();
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
const estimatedMinutes = tyreBasket.reduce((total, item) => {
  const name = (item.name || "").toLowerCase();

  if (name.includes("class 4 mot")) return total + 60;
  if (name.includes("class 7 mot")) return total + 60;

  if (name.includes("oil")) return total + 45;
  if (name.includes("interim")) return total + 60;
  if (name.includes("full service")) return total + 70;
  if (name.includes("major service")) return total + 90;

  if (name.includes("air con")) return total + 45;
  if (name.includes("alignment")) return total + 45;

  return total;
}, 0);
  return (
    <div className="bookingPage">
      

      <main className="bookingWrapPro">
        <section className="bookingHeroPro">
          <div>
            <span>BOOK ONLINE</span>
            <h1>
              Book Your <em>Service</em>
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
          <div>◎ 2. Choose Job</div>
          <div className="active">▣ 3. Book Fitting</div>
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

        

        <section className="bookingMainGrid">
          <aside className="bookingSummaryCard">
            <h2>You’re Booking</h2>

            <div className="bookingPriceBox">
              <span>{isTyreBooking ? "Total fitted price" : "Booking total"}</span>
<strong>£{totalPrice.toFixed(2)}</strong>
<small>
  {isTyreBooking
    ? "Includes fitting, valve, balance and VAT."
    : "All prices include VAT. No payment is taken online."}
</small>
            </div>

            <div className="miniTyreList">
  {items.map((item, index) => {
    const itemName =
      item.name ||
      item.service ||
      item.serviceName ||
      item.title ||
      "Service / MOT";

    return (
      <div className="miniTyreItem" key={item.id || index}>
        {item.type === "tyre" && item.axle && (
          <span className="miniAxleTag">
            {item.axle.toUpperCase()} AXLE
          </span>
        )}

        <strong className="bookingItemTitle">
  {item.type !== "tyre" && item.icon && <span>{item.icon}</span>}

  {item.type === "tyre"
    ? `${item.qty} x ${item.size} ${item.loadIndex}${item.speedRating}`
    : itemName}
</strong>


{(item.registration || item.vehicle?.vrm) && (
  <small className="bookingItemReg">
    Reg: {item.registration || item.vehicle?.vrm}
  </small>
)}


<div className="bookingItemMeta">
  Qty: {item.qty || 1}
</div>

        {item.type === "tyre" ? (
          <p>
            {item.brand} {item.pattern}
          </p>
        ) : (
          <p>
  {item.category === "Service" && "Vehicle Service"}
  {item.category === "MOT" && "MOT Test"}
  {item.category === "Air Con" && "Air Conditioning"}
  {item.category === "Alignment" && "Wheel Alignment"}
  {!item.category && "Booking Item"}
</p>
        )}

        {item.stockNumber && <small>Stock No: {item.stockNumber}</small>}

        <b>
          £{(Number(item.price || 0) * Number(item.qty || 1)).toFixed(2)}
        </b>
        <div className="bookingItemControls">
  <button
    type="button"
    onClick={() => updateItemQty(item.id, Number(item.qty || 1) - 1)}
  >
    −
  </button>

  <span>{item.qty || 1}</span>

  <button
    type="button"
    onClick={() => updateItemQty(item.id, Number(item.qty || 1) + 1)}
  >
    +
  </button>

  <button
    type="button"
    className="deleteItemBtn"
    onClick={() => removeItem(item.id)}
  >
    ×
  </button>
</div>
      </div>
    );
  })}
</div>
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
                                   ⏱ Estimated appointment duration:{" "}
                               <span>
                              {estimatedMinutes > 0
                             ? `${estimatedMinutes} minutes`
                            : "To be confirmed"}
                          </span>
                       </b>
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
<div className="bookingReassurance">
  <span>✓ No payment taken online</span>
  <span>✓ Booking confirmed by our team</span>
  <span>✓ Pay when work is completed</span>
</div>
            <button
              className="continueBtn"
              onClick={submitBooking}
              disabled={submitting}
            >
              <span>{submitting ? "Sending Booking..." : "Make Booking"}</span>
              <b>→</b>
            </button>
          </section>
        </section>
      </main>
      <Footer />
    </div>
  );
}