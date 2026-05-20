import React from "react";
import "./TermsConditions.css";
import Header from "./components/Header";

export default function TermsConditions() {
  return (
    <>
      <Header />

      <main className="policiesPage">
        <section className="policiesHero">
          <p className="policyEyebrow">Tyremen Ltd</p>

          <h1>Business Policies</h1>

          <p>
            Terms, privacy, returns, delivery, booking, warranty and customer
            service policies for Tyremen Ltd.
          </p>
        </section>

      <section className="policiesContent">
        <Policy title="Terms & Conditions">
          <p>
            By using our website, placing an order or making a booking, you agree
            to the following terms and conditions.
          </p>
          <p>
            Tyremen Ltd supplies tyres, alloy wheels, MOTs, servicing, repairs,
            wheel alignment, air conditioning, brakes, clutches and general
            vehicle repairs.
          </p>
          <p>
            All prices shown are inclusive of VAT unless stated otherwise. Orders
            and bookings are subject to availability and confirmation.
          </p>
          <p>
            We reserve the right to cancel or refuse orders where products are
            unavailable, pricing errors occur, fraudulent activity is suspected,
            or incorrect vehicle information has been provided.
          </p>
        </Policy>

        <Policy title="Tyre Orders">
          <p>
            Customers are responsible for checking tyre size, load rating, speed
            rating and suitability before ordering. If unsure, please contact us
            before placing an order.
          </p>
        </Policy>

        <Policy title="Returns & Refunds">
          <p>
            Unused tyres and products may be returned within 14 days of delivery,
            provided they are unused, unfitted, undamaged and authorised before
            return.
          </p>
          <p>
            Unless goods are faulty or incorrectly supplied, return carriage
            costs are the responsibility of the customer.
          </p>
          <p>
            Original delivery charges paid by Tyremen Ltd may be deducted from
            refunds where applicable.
          </p>
          <p>
            We cannot accept returns for used or fitted tyres, special order
            items, custom ordered wheels or products damaged after delivery.
          </p>
        </Policy>

        <Policy title="Delivery Policy">
          <p>
            We aim to dispatch stocked items promptly. Delivery times are
            estimates only and may vary due to courier delays or stock
            availability.
          </p>
          <p>
            Customers must inspect deliveries on arrival and report any damage as
            soon as possible.
          </p>
        </Policy>

        <Policy title="Booking & Cancellation Policy">
          <p>
            Online bookings are booking requests until confirmed by Tyremen Ltd.
            Appointment times are estimated and may vary due to workshop demand.
          </p>
          <p>
            Please provide as much notice as possible if cancelling or changing a
            booking.
          </p>
        </Policy>

        <Policy title="Warranty Policy">
          <p>
            Tyre warranties cover manufacturing defects only and do not cover
            punctures, road damage, incorrect inflation, alignment issues,
            accidental damage or misuse.
          </p>
          <p>
            Mechanical parts carry manufacturer warranty where applicable.
          </p>
        </Policy>

        <Policy title="Payment Policy">
          <p>
            We accept cash, debit cards, credit cards and approved payment
            methods where available.
          </p>
          <p>
            Goods remain the property of Tyremen Ltd until paid for in full.
          </p>
        </Policy>

        <Policy title="Privacy Policy">
          <p>
            We may collect customer details including name, address, email,
            telephone number, vehicle registration, booking history and payment
            information.
          </p>
          <p>
            This information is used to process orders, manage bookings, contact
            customers, send MOT or service reminders and improve our services.
          </p>
          <p>We do not sell customer data to third parties.</p>
        </Policy>

        <Policy title="Cookie Policy">
          <p>
            Our website may use cookies to improve website performance, analyse
            traffic, save preferences and support advertising or remarketing.
          </p>
          <p>You can disable cookies through your browser settings.</p>
        </Policy>

        <Policy title="Complaints Policy">
          <p>
            If you are unhappy with any aspect of our service, please contact us
            and we will investigate your complaint fairly.
          </p>
          <p>
            <strong>Tyremen Ltd</strong>
            <br />
            Hull, East Yorkshire
            <br />
            01482 328800
          </p>
        </Policy>
      </section>
    </main>
    </>
  );
}

function Policy({ title, children }) {
  return (
    <article className="policyCard">
      <h2>{title}</h2>
      <div>{children}</div>
    </article>
  );
}

