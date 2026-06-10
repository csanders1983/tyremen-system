import Header from "./components/Header";
import Footer from "./components/Footer";
import "./Contact.css";

document.title = "Contact Tyremen Hull | Tyres, MOT, Servicing & Repairs";

export default function Contact() {
  return (
    <>
      <div className="contactPage">

        <section className="contactHero">
          <div className="contactHeroContent">
            <p className="eyebrow">CONTACT TYREMEN</p>

            <h1>
              GET IN <span>TOUCH</span>
            </h1>

            <p>
              Need tyres, an MOT, servicing, wheel alignment or vehicle repairs?
              Our team is here to help.
            </p>
          </div>
        </section>

        <section className="contactGrid">

          <div className="contactCard">
            <h2>Contact Information</h2>

            <div className="contactItem">
              <strong>📞 Telephone</strong>
              <a href="tel:01482328800">01482 328800</a>
            </div>

            <div className="contactItem">
              <strong>✉️ Email</strong>
              <a href="mailto:info@tyremen.co.uk">
                info@tyremen.co.uk
              </a>
            </div>

            <div className="contactItem">
              <strong>📍 Address</strong>
              <p>
                Tyremen Ltd<br />
                Witty Street<br />
                Hull<br />
                HU3 4TX
              </p>
            </div>

            <div className="contactItem">
              <strong>🕒 Opening Hours</strong>
              <p>
                Monday - Friday: 8:30am - 5:30pm
                <br />
                Saturday: 8:30am - 4:00pm
                <br />
                Sunday: Closed
              </p>
            </div>

            <a className="callNowBtn" href="tel:01482328800">
              CALL NOW - 01482 328800
            </a>
          </div>

          <div className="contactCard">
            <h2>Send Us A Message</h2>

            <form className="contactForm">
              <input type="text" placeholder="Your Name" />
              <input type="email" placeholder="Email Address" />
              <input type="tel" placeholder="Telephone Number" />
              <input type="text" placeholder="Vehicle Registration (Optional)" />

              <textarea
                rows="6"
                placeholder="How can we help?"
              ></textarea>

              <button type="submit">
                SEND MESSAGE
              </button>
            </form>
          </div>

        </section>

        <section className="servicesSection">
          <h2>Services We Offer</h2>

          <div className="servicesGrid">
            <div>Tyres</div>
            <div>MOT Class 4 & 7</div>
            <div>Servicing</div>
            <div>Brakes</div>
            <div>Wheel Alignment</div>
            <div>Air Conditioning</div>
            <div>Clutches</div>
            <div>Timing Belts</div>
            <div>Diagnostics</div>
            <div>Motorhome Servicing</div>
            <div>Van Repairs</div>
            <div>General Repairs</div>
          </div>
        </section>

        <section className="mapSection">
          <h2>Find Us</h2>

          <iframe
            title="Tyremen Location"
            src="https://www.google.com/maps?q=Witty+Street+Hull+HU3+4TX&output=embed"
            loading="lazy"
            allowFullScreen
          ></iframe>
        </section>

      </div>

      <Footer />
    </>
  );
}