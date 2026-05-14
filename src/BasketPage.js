import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./components/Header";
import { getBasket, saveBasket } from "./Basket";
import "./TyreFlow.css";

export default function BasketPage() {
  const navigate = useNavigate();
  const [basket, setBasket] = useState([]);
  const [fittingOption, setFittingOption] = useState("AM drop-off");

  useEffect(() => {
    setBasket(getBasket());
  }, []);

  const updateQty = (id, qty) => {
    const updated = basket.map((item) =>
      item.id === id ? { ...item, qty: Math.max(1, qty) } : item
    );

    setBasket(updated);
    saveBasket(updated);
  };

  const removeItem = (id) => {
    const updated = basket.filter((item) => item.id !== id);
    setBasket(updated);
    saveBasket(updated);
  };

  const total = basket.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
    0
  );

  const vehicle = basket.find((item) => item.vehicle)?.vehicle || null;

  const continueBooking = () => {
    localStorage.removeItem("tyremenFittingOption");
    navigate("/booking");
  };

  return (
    <div className="tyreFlowPage">
      <Header />

      <main className="basketProWrap">
        <section className="basketProHero">
          <div>
            <span>TYREMEN BASKET</span>
            <h1>Your Basket</h1>
            <p>Review your tyres before booking fitting at Tyremen Hull.</p>
          </div>

          <div className="basketProTrust">
            <div>Secure checkout</div>
            <div>Expert fitting</div>
            <div>VAT included</div>
          </div>
        </section>

        <div className="flowSteps">
          <div>1. Search</div>
          <div>2. Choose Tyre</div>
          <div className="active">3. Basket</div>
          <div>4. Book Fitting</div>
        </div>

        {basket.length === 0 ? (
          <div className="emptyCard">
            <h2>Your basket is empty</h2>
            <p>Search tyres and add them to your basket.</p>

            <button className="yellowBtn" onClick={() => navigate("/tyres")}>
              Find Tyres
            </button>
          </div>
        ) : (
          <section className="basketProGrid">
            <div className="basketProLeft">
              {vehicle && (
                <div className="basketVehicleCard">
                  {vehicle.image && (
                    <img src={vehicle.image} alt={vehicle.model} />
                  )}

                  <div>
                    <div className="basketRegPlate">{vehicle.vrm}</div>
                    <h3>
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    <p>
                      {vehicle.fuel} • {vehicle.body} • {vehicle.colour}
                    </p>
                  </div>
                </div>
              )}

              <div className="basketProCard">
                <div className="basketProCardHead">
                  <h2>Basket Summary</h2>
                  <span>{basket.length} item(s)</span>
                </div>

                {basket.map((item) => (
                  <div className="basketProItem" key={item.id}>
                    <div className="basketProImage">
                      <img src={item.image} alt={item.brand} />
                    </div>

                    <div className="basketProDetails">
                      {item.axle && (
                        <div className="basketAxleTag">
                          {item.axle.toUpperCase()} AXLE
                        </div>
                      )}

                      <h3>
                        {item.brand} {item.pattern}
                      </h3>

                      <strong>{item.size}</strong>

                      <div className="basketSpecs">
                        <span>Load {item.loadIndex || "-"}</span>
                        <span>Speed {item.speedRating || "-"}</span>
                        <span>Wet {item.wet || "-"}</span>
                        <span>Fuel {item.fuel || "-"}</span>
                      </div>

                      <button
                        className="removeBtn"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="basketProControls">
                      <div className="basketQty">
                        <button onClick={() => updateQty(item.id, item.qty - 1)}>
                          −
                        </button>
                        <span>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.qty + 1)}>
                          +
                        </button>
                      </div>

                      <div className="basketPrice">
                        £{(Number(item.price || 0) * item.qty).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="basketTotalCard pro">
              <h2>Order Summary</h2>

              <div className="summaryLine">
                <span>Tyres</span>
                <strong>£{total.toFixed(2)}</strong>
              </div>

              <div className="summaryLine">
                <span>Fitting, valve, balance</span>
                <strong>Included</strong>
              </div>

              <div className="basketTotalPrice">
                <span>Total fitted price</span>
                <strong>£{total.toFixed(2)}</strong>
                <small>Includes fitting, standard valve, balance and VAT.</small>
              </div>

              <button className="yellowBtn fullWidth" onClick={continueBooking}>
                Proceed to Checkout
              </button>

              <button
                className="blackBtn fullWidth"
                onClick={() => navigate("/tyres")}
              >
                Add More Tyres
              </button>

              <div className="basketHelp">
                Need help? Call <strong>01482 328800</strong>
              </div>
            </aside>
          </section>
        )}
      </main>
    </div>
  );
}