import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import Header from "./components/Header";
import { getBasket } from "./Basket";
import "./Checkout.css";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const savedBasket = getBasket();
  const routeBasket = location.state || {};

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [registration, setRegistration] = useState("");
  const [email, setEmail] = useState("");

  const makeTyreName = (tyre) => {
    return [
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

  const tyreItems =
    Array.isArray(routeBasket.tyres) && routeBasket.tyres.length > 0
      ? routeBasket.tyres.map((tyre) => ({
          name: makeTyreName(tyre),
          qty: Number(tyre.qty || 1),
          price: Number(tyre.price || 0),
          type: "tyre",
          size: tyre.size || "",
          brand: tyre.brand || "",
          pattern: tyre.pattern || "",
          loadIndex: tyre.loadIndex || "",
          speedRating: tyre.speedRating || "",
          runflat: tyre.runflat || "",
        }))
      : Array.isArray(savedBasket)
      ? savedBasket.map((tyre) => ({
          name: makeTyreName(tyre),
          qty: Number(tyre.qty || 1),
          price: Number(tyre.price || 0),
          type: "tyre",
          size: tyre.size || "",
          brand: tyre.brand || "",
          pattern: tyre.pattern || "",
          loadIndex: tyre.loadIndex || "",
          speedRating: tyre.speedRating || "",
          runflat: tyre.runflat || "",
        }))
      : [];

  const isTyreBooking = tyreItems.length > 0;

  const tyresTotal = tyreItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
    0
  );

  const service = isTyreBooking
    ? tyreItems.map((item) => `${item.qty} x ${item.name}`).join(", ")
    : routeBasket.service ||
      routeBasket.job ||
      routeBasket.title ||
      routeBasket.name ||
      "Service";

  const date =
    routeBasket.date ||
    routeBasket.bookingDate ||
    routeBasket.selectedDate ||
    "";

  const time =
    routeBasket.time ||
    routeBasket.bookingTime ||
    routeBasket.selectedTime ||
    "";

  const price = isTyreBooking
    ? tyresTotal
    : Number(routeBasket.price || routeBasket.total || routeBasket.servicePrice || 0);

  const submitBooking = async () => {
    if (!name || !phone || !registration || !email) {
      alert("Please complete all required fields.");
      return;
    }

    await addDoc(collection(db, "jobs"), {
      name,
      phone,
      email,
      registration: registration.toUpperCase(),

      service,
      tyres: tyreItems,
      extras: "",
      date,
      time,
      price,
      total: price,

      items: isTyreBooking
        ? tyreItems
        : [{ name: service, qty: 1, price, type: "service" }],

      status: "New",
      source: "Website",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      originalBasket: {
        savedBasket,
        routeBasket,
      },
    });

    alert("Booking sent successfully.");
    navigate("/");
  };

  return (
    <div className="checkoutPage">
      <Header />

      <section className="checkoutHero">
        <h1>Complete Your Booking</h1>
        <p>Check your details and send your booking to Tyremen.</p>
      </section>

      <main className="checkoutWrap">
        <div className="checkoutSummary">
          <h2>Booking Summary</h2>

          <div className="summaryRow">
            <span>Service&nbsp;</span>
            <strong>{service}</strong>
          </div>

          <div className="summaryRow">
            <span>Date&nbsp;</span>
            <strong>{date || "Not selected"}</strong>
          </div>

          <div className="summaryRow">
            <span>Time&nbsp;</span>
            <strong>{time || "Not selected"}</strong>
          </div>

          {isTyreBooking && (
            <div className="checkoutTyreList">
              <span></span>

              {tyreItems.map((tyre, index) => (
                <div className="checkoutTyreItem" key={index}>
                 
                    <span>Tyres&nbsp;</span><strong>{tyre.qty} - {tyre.name}
                  </strong>
                  <b>
                    &nbsp;
                    £
                    {(
                      Number(tyre.price || 0) * Number(tyre.qty || 1)
                    ).toFixed(2)}
                  </b>
                </div>
              ))}
            </div>
          )}

          <div className="summaryRow total">
            <span>Total&nbsp;</span>
            <strong>£{price.toFixed(2)}</strong>
          </div>
        </div>

        <div className="checkoutForm">
          <h2>Your Details</h2>

          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>

          <label>
            Phone
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>

          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>

          <label>
            Registration
            <input
              value={registration}
              onChange={(e) => setRegistration(e.target.value)}
            />
          </label>

          <button onClick={submitBooking}>Send Booking</button>
        </div>
      </main>
    </div>
  );
}