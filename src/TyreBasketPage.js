import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./components/Header";
import { getTyreBasket, clearTyreBasket } from "./TyreBasket";
import "./TyreSearchPage.css";
import "./ServiceLandingPage.css";

export default function TyreBasketPage() {
  const navigate = useNavigate();
  const [basket, setBasket] = useState(getTyreBasket());

  const updateQty = (index, change) => {
    const updated = [...basket];
    const item = updated[index];

    const currentQty = Number(item.quantity || 1);
    const maxQty = Number(item.availableQty || item.stock || 1);

    const newQty = currentQty + change;

    if (newQty < 1) return;
    if (newQty > maxQty) return;

    item.quantity = newQty;

    localStorage.setItem("tyreBasket", JSON.stringify(updated));
    setBasket(updated);
  };

  const removeItem = (index) => {
    const updated = basket.filter((_, i) => i !== index);
    localStorage.setItem("tyreBasket", JSON.stringify(updated));
    setBasket(updated);
  };

  const total = basket.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity || 1),
    0
  );

  return (
    <div className="landingPage tyrePage">
      <Header />

      <section
        className="landingHero imageHero"
        style={{ backgroundImage: "url('/tyres-hero.jpg')" }}
      >
        <div>
          <p className="landingEyebrow">TYREMEN CHECKOUT</p>
          <h1>Your Tyre Basket</h1>
          <p className="landingIntro">
            Review your tyres, choose quantity and continue to booking.
          </p>

          <p className="heroTrust">
            ✔ Trusted Hull garage • ✔ UK delivery • ✔ Same day fitting available
          </p>
        </div>

        <div className="landingPanel">
          <h3>Tyremen Hull</h3>
          <div className="landingBullet">✓ 01482 328800</div>
          <div className="landingBullet">✓ Hull & East Yorkshire</div>
          <div className="landingBullet">✓ Tyres fitted by our local team</div>
        </div>
      </section>

      <section className="basketWrap">
        {basket.length === 0 ? (
          <div className="emptyBasket">
            <h2>Your basket is empty</h2>
            <p>Search tyres and add one to continue.</p>

            <button onClick={() => navigate("/tyres")}>SEARCH TYRES →</button>
          </div>
        ) : (
          <>
            <div className="basketList">
              {basket.map((item, index) => {
                const maxQty = Number(item.availableQty || item.stock || 1);
                const qty = Number(item.quantity || 1);

                return (
                  <div className="basketItem" key={index}>
                    <div className="basketImageBox">
                      <img src={item.image} alt={`${item.brand} ${item.model}`} />
                    </div>

                    <div className="basketInfo">
                      <span
                        className={
                          item.type === "Fitted in Hull"
                            ? "basketTypeBadge fittedBadge"
                            : "basketTypeBadge deliveryBadge"
                        }
                      >
                        {item.type === "Fitted in Hull"
                          ? "FITTED AT TYREMEN HULL"
                          : "DELIVERED UK"}
                      </span>

                      <h3>
                        {item.brand} {item.model}
                      </h3>

                      <p>{item.size}</p>

                      <div className="qtyControl">
                        <button onClick={() => updateQty(index, -1)}>-</button>

                        <strong>{qty}</strong>

                        <button
                          onClick={() => updateQty(index, 1)}
                          disabled={qty >= maxQty}
                        >
                          +
                        </button>

                        <small>{maxQty} available</small>
                      </div>

                      <button
                        className="removeBasketItem"
                        onClick={() => removeItem(index)}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="basketPrice">
                      £{(Number(item.price) * qty).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="basketAddressBox">
              <h3>Tyremen Hull Fitting Centre</h3>
              <p>
                Bring your vehicle to Tyremen for professional tyre fitting,
                balancing and advice from our Hull team.
              </p>
              <strong>Tyremen Ltd, Hull, East Yorkshire</strong>
              <a href="tel:01482328800">Call 01482 328800</a>
            </div>

            <div className="basketSummary">
              <div>
                <span>Total</span>
                <strong>£{total.toFixed(2)}</strong>
              </div>

              <button
                className="bookBtn basketCheckoutBtn"
                onClick={() => navigate("/booking")}
              >
                CONTINUE TO BOOKING →
              </button>

              <button
                className="clearBasketBtn"
                onClick={() => {
                  clearTyreBasket();
                  setBasket([]);
                }}
              >
                Clear Basket
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}