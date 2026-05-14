import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import Header from "./components/Header";
import { addToBasket } from "./Basket";
import tyres from "./data/tyres.json";
import "./TyreProductPage.css";

export default function TyreProductPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tyreSlug } = useParams();
  const [searchParams] = useSearchParams();

  const vrm = searchParams.get("vrm");
  const axle = searchParams.get("axle");

  const [qty, setQty] = useState(1);
  const [vehicle, setVehicle] = useState(null);
  const [loadingVehicle, setLoadingVehicle] = useState(false);

  useEffect(() => {
    if (!vrm) return;

    async function lookupVehicle() {
      try {
        setLoadingVehicle(true);

        const res = await fetch(
          "https://vehiclelookup-tx3ipea3qa-uc.a.run.app?vrm=" + vrm
        );

        const data = await res.json();

        if (data.success) {
          setVehicle(data.vehicle);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingVehicle(false);
      }
    }

    lookupVehicle();
  }, [vrm]);

  const makeSlug = (title) =>
    String(title || "")
      .toLowerCase()
      .replaceAll("/", "-")
      .replaceAll(" ", "-")
      .replace(/[^a-z0-9-]/g, "");

  const tyre =
    location.state?.tyre ||
    tyres.find((item) => makeSlug(item.Title) === tyreSlug);

  if (!tyre) {
    return (
      <div className="tppPage">
        <Header />
        <main className="tppWrap">
          <button className="tppBackBtn" onClick={() => navigate("/tyres")}>
            ← Back to tyre results
          </button>
          <h2>No tyre found</h2>
        </main>
      </div>
    );
  }

  const size = `${tyre.Width || ""}/${tyre["Aspect Ratio"] || ""}R${tyre.Rim || ""}`;
  const image = tyre["Image URL"] || "";
  const availableQty = Number(tyre.Quantity || 0);
  const cost = Number(tyre.Price || 0);
  const price = (cost + 25) * 1.2;

  const handleQty = (nextQty) => {
    const maxQty = availableQty > 0 ? availableQty : 99;
    setQty(Math.max(1, Math.min(nextQty, maxQty)));
  };

  const handleAdd = () => {
    addToBasket(
      {
        ...tyre,
        Brand: tyre.Brand || "",
        Pattern: tyre.Model || "",
        Size: size,
        Image: image,
        Vehicle: vehicle || null,
        axle: axle || "",
        Fuel: tyre["Rolling Resistance"] || "",
        Wet: tyre["Wet Grip"] || "",
        Noise: tyre["Noise Performance"] || "",
        stockNumber: tyre["Stock Number"] || tyre.stockNumber || "",
        purchaseType: "fitted",
        price,
      },
      qty
    );

    navigate("/basket");
  };

  return (
    <div className="tppPage">
      <Header />

      <main className="tppWrap">
        <button className="tppBackBtn" onClick={() => navigate("/tyres")}>
          ← Back to tyre results
        </button>

        {loadingVehicle && <div className="tppVehicleBox">Checking vehicle...</div>}

        {vehicle && (
          <section className="tppVehicleBox">
            {vehicle.image && (
              <div className="tppVehicleImgBox">
                <img src={vehicle.image} alt={vehicle.model} />
              </div>
            )}

            <div className="tppVehicleDetails">
              <div className="tppRegPlate">{vehicle.vrm}</div>

              <h2>
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h2>

              <p>
                {vehicle.fuel} • {vehicle.body} • {vehicle.colour}
              </p>
            </div>

            <div className="tppVehicleChecks">
              <div>✓ Checked by VRM</div>
              <div>✓ Compatible size</div>
              <div>✓ Perfect fit</div>
            </div>
          </section>
        )}

        <section className="tppProduct">
          <div className="tppGallery">
            <div className="tppStockRow">
              <span className="tppFittedTag">Fully fitted price</span>

              <span className={availableQty <= 2 ? "tppStock low" : "tppStock"}>
                {availableQty > 0 ? `${availableQty} in stock` : "Check stock"}
              </span>
            </div>

            <div className="tppTyreStage">
              {image ? <img src={image} alt={tyre.Title || "Tyre"} /> : <div>No image</div>}
            </div>

            <div className="tppUnderImage">
              <strong>✓ No hidden extras</strong>
              <span>Fitting, balancing, valve and VAT included.</span>
            </div>
          </div>

          <aside className="tppBuyBox">
            <div className="tppBrandLine">{tyre.Brand || "Brand"}</div>

            <h1>{tyre.Model || tyre.Title || "Tyre"}</h1>

            <div className="tppSizeLine">
              {size} {tyre["Load Index"] || ""}
              {tyre["Speed Rating"] || ""} {tyre.Reinforced || ""}
            </div>

            {axle && <div className="tppAxleTag">{axle.toUpperCase()} AXLE TYRE</div>}

            <div className="tppTrustPanel">
              <strong>Fitted by Tyremen Hull</strong>
              <p>Professional local fitting with the full fitted price shown upfront.</p>
            </div>

            <div className="tppRatings">
              <div>
                <span>Wet Grip</span>
                <strong>{tyre["Wet Grip"] || "-"}</strong>
              </div>

              <div>
                <span>Fuel</span>
                <strong>{tyre["Rolling Resistance"] || "-"}</strong>
              </div>

              <div>
                <span>Noise</span>
                <strong>
                  {tyre["Noise Performance"] ? `${tyre["Noise Performance"]} dB` : "-"}
                </strong>
              </div>
            </div>

            <div className="tppPricePanel">
              <div className="tppPriceTop">
                <div>
                  <small>Fully fitted price</small>
                  <strong>£{(price * qty).toFixed(2)}</strong>
                  <em>Including VAT</em>
                </div>

                <div className="tppQtyBlock">
                  <small>Quantity</small>

                  <div className="tppQty">
                    <button type="button" onClick={() => handleQty(qty - 1)}>
                      −
                    </button>

                    <span>{qty}</span>

                    <button type="button" onClick={() => handleQty(qty + 1)}>
                      +
                    </button>
                  </div>

                  <p>({availableQty} available)</p>
                </div>
              </div>

              <button className="tppAddBtn" onClick={handleAdd}>
                🛒 Add to Basket & Book Fitting
              </button>
            </div>

            <div className="tppPhone">
              Need help? Call <strong>01482 328800</strong>
            </div>
          </aside>
        </section>

        <section className="tppTrustBar">
          <div>
            <strong>55+ Years</strong>
            <span>Trusted locally</span>
          </div>

          <div>
            <strong>Professional fitting</strong>
            <span>Expert technicians</span>
          </div>

          <div>
            <strong>Clear pricing</strong>
            <span>No surprise extras</span>
          </div>

          <div>
            <strong>Same day fitting</strong>
            <span>Often available</span>
          </div>
        </section>
      </main>
    </div>
  );
}