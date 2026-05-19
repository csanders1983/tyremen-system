import { useLocation, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import "./Summary.css";
import { getBasket } from "./Basket";

function readStoredVehicle() {
  try {
    return JSON.parse(localStorage.getItem("tyremenVehicle") || "null");
  } catch {
    return null;
  }
}

function safePrice(value) {
  if (value === undefined || value === null || value === "") return null;

  const number = Number(value);
  return Number.isNaN(number) ? null : number;
}

export default function Summary() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const service = params.get("service") || location.state?.service || "Service";
  const extras = params.get("extras") || location.state?.extras || "";

  const savedBasket = getBasket();

  const selected =
    location.state && Object.keys(location.state).length > 0
      ? location.state
      : savedBasket || {
          service,
          type: "Service",
          price: null,
          extras: "",
          icon: "🚗",
        };

  const vehicle =
    selected.vehicle ||
    savedBasket?.vehicle ||
    readStoredVehicle() ||
    null;

  const displayService =
    selected.service ||
    selected.title ||
    selected.type ||
    service;

  const total = safePrice(
    selected.price ??
      selected.total ??
      selected.amount ??
      savedBasket?.price
  );

  const priceText = total !== null ? `£${total.toFixed(2)}` : "POA";
  const totalText = total !== null ? `£${total.toFixed(2)}` : "Price on request";

  const vehicleName = vehicle
    ? `${vehicle.year || vehicle.yearOfManufacture || ""} ${vehicle.make || ""} ${
        vehicle.model || ""
      }`.trim()
    : "";

  const vehicleSubLine = vehicle
    ? [
        vehicle.fuel || vehicle.fuelType,
        vehicle.body || vehicle.bodyType,
        vehicle.colour || vehicle.color,
        vehicle.tyreSize,
      ]
        .filter(Boolean)
        .join(" • ")
    : "";

  const vrm =
    vehicle?.vrm ||
    vehicle?.registration ||
    localStorage.getItem("tyremenVrm") ||
    "";

  return (
    <div className="summaryPage">
      <Header />

      <section className="summaryHero">
        <div>
          <p>BOOKING BASKET</p>
          <h1>Review Your Booking</h1>
          <span>Check your selected service before choosing a date and time.</span>
        </div>
      </section>

      <section className="summaryMain">
        <div className="summaryCard">
          <h2>Your Booking Basket</h2>

          {vehicle && (
            <div className="summaryVehicle">
              <strong>{vrm}</strong>
              <span>{vehicleName}</span>
              <small>{vehicleSubLine}</small>
            </div>
          )}

          <div className="basketLine">
            <div className="basketIcon">{selected.icon || "🚗"}</div>

            <div>
              <span>SERVICE</span>
              <strong>{displayService}</strong>
              {extras && <small>{extras}</small>}
            </div>

            <div className="basketPrice">{priceText}</div>
          </div>

          <div className="summaryTotal">
            <span>Estimated total from</span>
            <strong>{totalText}</strong>
          </div>

          <div className="summaryNotice">
            Final price may vary depending on vehicle, oil type, parts and
            inspection. We’ll confirm before carrying out any work.
          </div>

          <button
            className="summaryContinue"
            onClick={() =>
              navigate(
                `/booking?service=${encodeURIComponent(
                  displayService
                )}&extras=${encodeURIComponent(extras)}`,
                {
                  state: {
                    ...selected,
                    service: displayService,
                    price: total,
                    extras,
                    vehicle,
                  },
                }
              )
            }
          >
            Continue to booking →
          </button>
        </div>
      </section>
    </div>
  );
}