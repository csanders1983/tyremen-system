{vehicleData && tyreSize && !isTyreBooking && (
          <section className="bookingUpsellCard">
            <div>
              <span>TYRE SIZE FOUND FROM YOUR VEHICLE</span>
              <h2>Need tyres as well?</h2>
              <p>
                We found <strong>{tyreSize}</strong> for your{" "}
                {vehicleData.make} {vehicleData.model}. Add tyres to this
                booking before sending it.
              </p>

              {motAdvisories.length > 0 && (
                <small>
                  MOT advisory found — this may be worth checking before your visit.
                </small>
              )}
            </div>

            <button type="button" onClick={goToTyres}>
              View tyres for {tyreSize} →
            </button>
          </section>
        )}