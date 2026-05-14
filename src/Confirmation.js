import { useLocation, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import "./Confirmation.css";
import { getBasket } from "./Basket";

export default function Confirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  
const data = location.state || {};
const basket = getBasket() || {};

const service = data.service || basket.service || "Booking";
const date = data.date || basket.date || "Selected date";
const time = data.time || basket.time || "Selected time";
const name = data.name || "";

  return (
    <div className="confirmationPage">
      <Header />

      <section className="confirmationHero">
        <div className="confirmationCard">
          <div className="successBadge">✓ Booking Received</div>

          <h1>You’re Booked In</h1>

          <p className="confirmationSub">
            Thanks{name ? `, ${name}` : ""}. We’ve received your booking request.
            Our team will confirm it by phone or text.
          </p>

          <div className="confirmationSummary">
            <div>
              <span>Service</span>
              <strong>{service}</strong>
            </div>

            <div>
              <span>Date</span>
              <strong>{date}</strong>
            </div>

            <div>
              <span>Preferred time</span>
              <strong>{time}</strong>
            </div>

{basket.price && (
  <div className="confirmationPrice">
    From £{Number(basket.price).toFixed(2)}
  </div>
)}

          </div>

          <div className="confirmationNotice">
            <strong>Important:</strong> Your booking is not fully confirmed until
            a member of the Tyremen team contacts you.
          </div>

          <div className="locationBox">
            <h3>Where to come</h3>
            <p>Tyremen, Witty Street, Hull HU3 4TX</p>
            <a
              href="https://www.google.com/maps?q=Witty+Street+Hull+HU3+4TX"
              target="_blank"
              rel="noreferrer"
            >
              Open in Google Maps →
            </a>
          </div>

          <div className="confirmationActions">
            <button onClick={() => navigate("/")}>Back to Home</button>
            <button className="darkBtn" onClick={() => navigate("/booking")}>
              Make Another Booking
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}