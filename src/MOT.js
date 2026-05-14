import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function MOT() {
  const navigate = useNavigate();
  const [slotsLeft] = useState(3);

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.headerLeft}>
            <img
              src="/logo.png"
              alt="Tyremen"
              style={styles.headerLogo}
              onClick={() => navigate("/")}
            />
            <span style={styles.address}>Witty Street, Hull HU3 4TX</span>
          </div>

          <div style={styles.menu}>
            <span onClick={() => navigate("/tyres")} style={styles.menuItem}>Tyres</span>
            <span onClick={() => navigate("/mot")} style={styles.menuItem}>MOT</span>
            <span onClick={() => navigate("/service")} style={styles.menuItem}>Car service</span>
            <span onClick={() => navigate("/service")} style={styles.menuItem}>Van service</span>
            <span onClick={() => navigate("/Timing")} style={styles.menuItem}>Timing Belt</span>
            <span onClick={() => navigate("/Clutch")} style={styles.menuItem}>Clutch Repair</span>
          </div>

          <div style={styles.headerRight}>
            <span style={styles.phone}>01482 328800</span>
          </div>
        </div>
      </div>

      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.heroBg} />
        <div style={styles.overlay} />
        <div style={styles.gridOverlay} />
        <div style={styles.yellowGlow} />

        <div style={styles.heroContent}>
          <div style={styles.badge}>DVSA APPROVED TEST CENTRE</div>

          <h1 style={styles.title}>
            MOT Testing in <span style={styles.highlight}>Hull</span>
          </h1>

          <p style={styles.sub}>
            Same-day MOTs available. Fast, honest testing with no hidden costs.
          </p>

          <div style={styles.googleTrust}>
            ⭐⭐⭐⭐⭐ <span style={{ color: "#ccc" }}>4.8 Google rating (300+ reviews)</span>
          </div>

          <button
            style={styles.primary}
            onClick={() => navigate("/booking")}
          >
            Book Service & Get FREE MOT
          </button>
        </div>
      </section>

      {/* MOT CARDS */}
      <div style={styles.floatingWrap}>
        <div style={styles.priceGrid}>

          <div style={{ ...styles.card, ...styles.popularCard }}>
            <div style={styles.popularBadge}>MOST POPULAR</div>
            <div style={styles.urgency}>Only {slotsLeft} slots left today</div>

            <h3>Class 4 MOT</h3>
            <p>Cars</p>

            <div style={styles.price}>£40.00</div>

            <div style={styles.bundle}>Save £10 with a service</div>

            <button
              style={styles.primary}
              onClick={() => navigate("/booking?service=mot")}
            >
              Book
            </button>
          </div>

          <div style={styles.card}>
            <div style={styles.socialProof}>Popular choice</div>

            <h3>Class 7 MOT</h3>
            <p>Vans</p>

            <div style={styles.price}>£45.00</div>

            <button
              style={styles.primary}
              onClick={() => navigate("/summary?service=mot")}
            >
              Book
            </button>
          </div>

        </div>
      </div>

      {/* CROSS SELL */}
      <div style={styles.crossWrap}>
        <h2 style={styles.crossTitle}>Upgrade Your Booking</h2>

        <div style={styles.priceGrid}>
          <div style={styles.card}>
            <h3>Oil & Filter</h3>
            <button style={styles.primary} onClick={() => navigate("/summary?service=mot&extras=oil")}>Add</button>
          </div>

          <div style={styles.card}>
            <h3>Interim Service</h3>
            <button style={styles.primary} onClick={() => navigate("/summary?service=mot&extras=interim")}>Add</button>
          </div>

          <div style={styles.card}>
            <h3>Full Service</h3>
            <button style={styles.primary} onClick={() => navigate("/summary?service=mot&extras=full")}>Add</button>
          </div>

          <div style={styles.card}>
            <h3>Major Service</h3>
            <button style={styles.primary} onClick={() => navigate("/summary?service=mot&extras=major")}>Add</button>
          </div>
        </div>
      </div>

    </div>
  );
}

/* STYLES */
const styles = {
  page: { background: "#000", color: "#fff", fontFamily: "Inter" },

  header: { position: "fixed", top: 0, width: "100%", zIndex: 100, background: "rgba(0,0,0,0.7)" },

  headerInner: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 60px",
    alignItems: "center"
  },

  headerLeft: { display: "flex", gap: "14px", alignItems: "center" },
  headerLogo: { height: "34px", cursor: "pointer" },
  address: { color: "#ccc" },

  menu: { display: "flex", gap: "18px" },
  menuItem: { cursor: "pointer" },

  headerRight: { display: "flex" },
  phone: { color: "#facc15" },

  hero: {
    position: "relative",
    height: "65vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: "60px",
    overflow: "hidden"
  },

  heroBg: {
    position: "absolute",
    inset: 0,
    backgroundImage: "url('/hero-wheel.png')",
    backgroundSize: "cover"
  },

  overlay: { position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)" },

  gridOverlay: {
    position: "absolute",
    inset: 0,
    backgroundSize: "60px 60px",
    backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)"
  },

  yellowGlow: {
    position: "absolute",
    width: "500px",
    height: "500px",
    background: "radial-gradient(circle, rgba(250,204,21,0.25), transparent)",
    filter: "blur(100px)"
  },

  heroContent: { position: "relative", zIndex: 3, textAlign: "center" },

  badge: { background: "#facc15", color: "#000", padding: "6px 12px", marginBottom: "10px" },

  title: { fontSize: "50px", fontWeight: "900" },
  highlight: { color: "#facc15" },
  sub: { color: "#ccc" },

  googleTrust: { marginTop: "10px", fontSize: "14px" },

  primary: {
    background: "#facc15",
    padding: "12px 20px",
    border: "none",
    cursor: "pointer",
    marginTop: "10px",
    borderRadius: "8px",
    fontWeight: "700"
  },

  floatingWrap: {
    marginTop: "-180px",
    position: "relative",
    zIndex: 5
  },

  priceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
    gap: "20px",
    maxWidth: "900px",
    margin: "0 auto"
  },

  card: {
    background: "#111",
    padding: "25px",
    borderRadius: "16px",
    textAlign: "center",
    position: "relative"
  },

  popularCard: { border: "1px solid #facc15" },

  popularBadge: {
    position: "absolute",
    top: "-10px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#facc15",
    color: "#000",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "12px"
  },

  price: { fontSize: "36px", color: "#facc15" },

  urgency: { fontSize: "12px", color: "#facc15", marginBottom: "6px" },
  bundle: { fontSize: "12px", color: "#22c55e", marginTop: "5px" },
  socialProof: { fontSize: "11px", color: "#888", marginBottom: "6px" },

  crossWrap: { marginTop: "60px", textAlign: "center" },
  crossTitle: { marginBottom: "20px" }
};