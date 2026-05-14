import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Service() {
  const navigate = useNavigate();
  const [slotsLeft] = useState(4);

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
            <span onClick={() => navigate("/service")} style={styles.menuItem}>Car Service</span>
            <span onClick={() => navigate("/service")} style={styles.menuItem}>Van Service</span>
            <span onClick={() => navigate("/booking?service=timing")} style={styles.menuItem}>Timing Belt</span>
            <span onClick={() => navigate("/booking?service=clutch")} style={styles.menuItem}>Clutch</span>
          </div>

          <div>
            <span style={styles.phone}>01482 328800</span>
          </div>
        </div>
      </div>

      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.heroBg}/>
        <div style={styles.overlay}/>
        <div style={styles.gridOverlay}/>
        <div style={styles.yellowGlow}/>

        <div style={styles.heroContent}>
          <div style={styles.badge}>PROFESSIONAL SERVICING</div>

          <h1 style={styles.title}>
            Car Servicing in <span style={styles.highlight}>Hull</span>
          </h1>

          <p style={styles.sub}>
            Keep your car running smoothly with expert servicing packages.
          </p>

          <div style={styles.googleTrust}>
            ⭐⭐⭐⭐⭐ <span style={{ color: "#ccc" }}>4.8 Google rating</span>
          </div>

          <button
            style={styles.primary}
            onClick={() => navigate("/booking?service=interim")}
          >
            Book Service →
          </button>
        </div>
      </section>

      {/* CARDS */}
      <div style={styles.floatingWrap}>
        <div style={styles.priceGrid}>

          {/* INTERIM */}
          <div style={{ ...styles.card, ...styles.popularCard }}>
            <div style={styles.popularBadge}>MOST POPULAR</div>
            <div style={styles.urgency}>⚡ Only {slotsLeft} slots left today</div>

            <h3>Interim Service</h3>
            <p>Recommended every 6 months</p>

            <div style={styles.price}>£79</div>

            <div style={styles.bundle}>FREE MOT with full service</div>

            <button
              style={styles.primary}
              onClick={() => navigate("/booking?service=interim")}
            >
              Book →
            </button>
          </div>

          {/* FULL */}
          <div style={styles.card}>
            <div style={styles.socialProof}>✔ Annual service</div>

            <h3>Full Service</h3>
            <p>Complete yearly maintenance</p>

            <div style={styles.price}>£129</div>

            <button
              style={styles.primary}
              onClick={() => navigate("/booking?service=interim")}
            >
              Book →
            </button>
          </div>

          {/* MAJOR */}
          <div style={styles.card}>
            <div style={styles.socialProof}>✔ Maximum protection</div>

            <h3>Major Service</h3>
            <p>Deep inspection & replacement</p>

            <div style={styles.price}>£189</div>

            <button
              style={styles.primary}
              onClick={() => navigate("/booking?service=interim")}
            >
              Book →
            </button>
          </div>

          {/* OIL */}
          <div style={styles.card}>
            <div style={styles.socialProof}>✔ Quick maintenance</div>

            <h3>Oil & Filter</h3>
            <p>Essential service</p>

            <div style={styles.price}>£59</div>

            <button
              style={styles.primary}
              onClick={() => navigate("/booking?service=interim")}
            >
              Book →
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}

/* STYLES (MATCH MOT) */
const styles = {
  page:{ background:"#000", color:"#fff", fontFamily:"Inter" },

  header:{ position:"fixed", top:0, width:"100%", zIndex:100, background:"rgba(0,0,0,0.7)" },
  headerInner:{ maxWidth:"1200px", margin:"0 auto", display:"flex", justifyContent:"space-between", padding:"12px 60px", alignItems:"center" },
  headerLeft:{ display:"flex", gap:"14px", alignItems:"center" },
  headerLogo:{ height:"34px", cursor:"pointer" },
  address:{ color:"#ccc" },
  menu:{ display:"flex", gap:"18px" },
  menuItem:{ cursor:"pointer" },
  phone:{ color:"#facc15" },

  hero:{ position:"relative", height:"60vh", display:"flex", justifyContent:"center", alignItems:"center", paddingTop:"60px" },
  heroBg:{ position:"absolute", inset:0, backgroundImage:"url('/hero-wheel.png')", backgroundSize:"cover" },
  overlay:{ position:"absolute", inset:0, background:"rgba(0,0,0,0.75)" },
  gridOverlay:{ position:"absolute", inset:0, backgroundSize:"60px 60px", backgroundImage:"linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)" },
  yellowGlow:{ position:"absolute", width:"500px", height:"500px", background:"radial-gradient(circle, rgba(250,204,21,0.25), transparent)", filter:"blur(100px)" },

  heroContent:{ position:"relative", zIndex:3, textAlign:"center" },
  badge:{ background:"#facc15", color:"#000", padding:"6px 12px", marginBottom:"10px" },
  title:{ fontSize:"48px", fontWeight:"900" },
  highlight:{ color:"#facc15" },
  sub:{ color:"#ccc" },
  googleTrust:{ marginTop:"10px" },

  primary:{ background:"#facc15", padding:"12px 20px", border:"none", cursor:"pointer", borderRadius:"8px", fontWeight:"700", marginTop:"10px" },

  floatingWrap:{ marginTop:"-120px", position:"relative", zIndex:5 },
  priceGrid:{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:"20px", maxWidth:"900px", margin:"0 auto" },

  card:{ background:"#111", padding:"25px", borderRadius:"16px", textAlign:"center", position:"relative" },
  popularCard:{ border:"1px solid #facc15" },
  popularBadge:{ position:"absolute", top:"-10px", left:"50%", transform:"translateX(-50%)", background:"#facc15", color:"#000", padding:"4px 10px", borderRadius:"6px", fontSize:"12px" },

  price:{ fontSize:"36px", color:"#facc15" },
  urgency:{ fontSize:"12px", color:"#facc15", marginBottom:"6px" },
  bundle:{ fontSize:"12px", color:"#22c55e", marginTop:"5px" },
  socialProof:{ fontSize:"11px", color:"#888", marginBottom:"6px" }
};