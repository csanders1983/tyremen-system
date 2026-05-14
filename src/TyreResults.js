import { useEffect, useState } from "react";

const tyres = [
  {
    brand: "Linglong",
    model: "Sport Master",
    price: 59.99,
    category: "budget",
    rating: "A",
    fuel: "C",
    stock: 12,
  },
  {
    brand: "Hankook",
    model: "Ventus Prime",
    price: 89.99,
    category: "mid",
    rating: "B",
    fuel: "B",
    stock: 8,
  },
  {
    brand: "Michelin",
    model: "Pilot Sport 5",
    price: 129.99,
    category: "premium",
    rating: "A",
    fuel: "A",
    stock: 5,
  },
];

export default function TyreResults() {
  const [filter, setFilter] = useState("all");
  const [vehicle, setVehicle] = useState(null);
  const [loadingVehicle, setLoadingVehicle] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const vrm = params.get("vrm");

  useEffect(() => {
    if (!vrm) return;

    const loadVehicle = async () => {
      try {
        setLoadingVehicle(true);

        const res = await fetch(
          `https://vehiclelookup-tx3ipea3qa-uc.a.run.app?vrm=${vrm}`
        );

        const data = await res.json();

        if (data.success) {
          setVehicle(data.vehicle);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoadingVehicle(false);
      }
    };

    loadVehicle();
  }, [vrm]);

  const filteredTyres =
    filter === "all"
      ? tyres
      : tyres.filter((t) => t.category === filter);

  return (
    <div
      style={{
        background: "#f5f5f5",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      {/* VEHICLE */}
      {loadingVehicle && (
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto 20px",
            background: "#111",
            color: "#fff",
            padding: "20px",
            borderRadius: "12px",
          }}
        >
          Loading vehicle...
        </div>
      )}

      {vehicle && (
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto 20px",
            background: "#111",
            color: "#fff",
            border: "2px solid #facc15",
            borderRadius: "14px",
            padding: "18px",
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          {vehicle.image && (
            <img
              src={vehicle.image}
              alt={vehicle.model}
              style={{
                width: "170px",
                background: "#fff",
                borderRadius: "10px",
                padding: "8px",
              }}
            />
          )}

          <div>
            <div
              style={{
                background: "#facc15",
                color: "#000",
                display: "inline-block",
                padding: "6px 14px",
                borderRadius: "6px",
                fontWeight: "bold",
                marginBottom: "12px",
                fontSize: "22px",
                letterSpacing: "2px",
              }}
            >
              {vehicle.vrm}
            </div>

            <h2 style={{ margin: 0 }}>
              {vehicle.make} {vehicle.model}
            </h2>

            <p style={{ marginTop: "8px", color: "#ccc" }}>
              {vehicle.year} • {vehicle.fuel} • {vehicle.body}
            </p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <h1 style={{ textAlign: "center" }}>
        Select Your Tyres
      </h1>

      {/* FILTERS */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          margin: "20px 0",
        }}
      >
        {["all", "budget", "mid", "premium"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: "10px 15px",
              borderRadius: "20px",
              border: "none",
              fontWeight: "bold",
              background: filter === cat ? "#facc15" : "#ddd",
              cursor: "pointer",
            }}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* TYRES */}
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {filteredTyres.map((tyre, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "white",
              padding: "20px",
              borderRadius: "10px",
              marginBottom: "15px",
              boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
            }}
          >
            <div>
              <h3 style={{ margin: 0 }}>
                {tyre.brand} {tyre.model}
              </h3>

              <p
                style={{
                  margin: "5px 0",
                  color: "#555",
                }}
              >
                Wet Grip: {tyre.rating} | Fuel: {tyre.fuel}
              </p>

              <p
                style={{
                  color:
                    tyre.stock > 0 ? "green" : "red",
                }}
              >
                {tyre.stock > 0
                  ? "In Stock"
                  : "Out of Stock"}
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <h2
                style={{
                  margin: 0,
                  color: "#facc15",
                }}
              >
                £{tyre.price}
              </h2>

              <p
                style={{
                  fontSize: "12px",
                  color: "#555",
                }}
              >
                fitted price
              </p>

              <button
                onClick={() =>
                  window.location.href =
                    `/booking?tyre=${tyre.brand}-${tyre.model}&price=${tyre.price}`
                }
                style={{
                  marginTop: "10px",
                  background: "#facc15",
                  color: "black",
                  padding: "10px 15px",
                  borderRadius: "6px",
                  border: "none",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Select & Continue
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}