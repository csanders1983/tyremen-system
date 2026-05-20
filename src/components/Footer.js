import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="siteFooter">
      <div className="footerTop">
        <div className="footerBrand">
          <h2>TYREMEN</h2>
          <p>More than just a tyre shop.</p>
          <span>Tyres • MOT • Servicing • Brakes • Alignment</span>
        </div>

        <div className="footerLinks">
          <div>
            <h4>Services</h4>
            <a href="/tyres">Tyres</a>
            <a href="/service">Servicing</a>
            <a href="/mot">MOT</a>
            <a href="/wheel-alignment">Wheel Alignment</a>
          </div>

          <div>
            <h4>Customer Care</h4>
            <a href="/terms-conditions">Business Policies</a>
            <a href="/contact">Contact Us</a>
            <a href="/booking">Book Online</a>
            <a href="tel:01482328800">01482 328800</a>
          </div>

          <div>
            <h4>Visit Us</h4>
            <p>Tyremen Ltd</p>
            <p>Hull & East Yorkshire</p>
            <p>Open Monday to Saturday</p>
          </div>
        </div>
      </div>

      <div className="footerTrust">
        <span>55+ Years Experience</span>
        <span>Local Hull Garage</span>
        <span>Online Booking</span>
        <span>Trusted Tyre Experts</span>
      </div>

      <div className="footerBottom">
        <p>© {new Date().getFullYear()} Tyremen Ltd. All rights reserved.</p>
        <p>Website by Chris Sanders</p>
      </div>
    </footer>
  );
}