import "../admin-pages.css";
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  engineBands,
  serviceTypes,
  calculateIncVat,
} from "../utils/servicePricing";

const defaultPrices = {
  oil: [79, 79, 89, 89, 109, 109],
  interim: [100, 100, 114.17, 114.17, 137.5, 137.5],
  full: [149, 149, 169, 169, 199, 199],
  major: [199, 199, 229, 229, 269, 269],
};

export default function Services() {
  const [matrix, setMatrix] = useState([]);
  const [activeType, setActiveType] = useState("oil");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "servicePricingMatrix"),
      orderBy("serviceType", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const rows = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setMatrix(rows);
    });

    return () => unsub();
  }, []);

  const getRow = (serviceType, bandIndex) => {
    const band = engineBands[bandIndex];

    return (
      matrix.find(
        (row) =>
          row.serviceType === serviceType &&
          Number(row.minCC) === Number(band.minCC) &&
          Number(row.maxCC) === Number(band.maxCC)
      ) || {
        serviceType,
        bandLabel: band.label,
        minCC: band.minCC,
        maxCC: band.maxCC,
        priceExVat: defaultPrices[serviceType]?.[bandIndex] || 0,
      }
    );
  };

  const updatePrice = async (serviceType, bandIndex, value) => {
    const band = engineBands[bandIndex];
    const id = `${serviceType}-${band.minCC}-${band.maxCC}`;
    const priceExVat = Number(value || 0);

    setSaving(true);

    await setDoc(
      doc(db, "servicePricingMatrix", id),
      {
        serviceType,
        bandLabel: band.label,
        minCC: band.minCC,
        maxCC: band.maxCC,
        priceExVat,
        priceIncVat: calculateIncVat(priceExVat),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    setSaving(false);
  };

  const seedDefaults = async () => {
    setSaving(true);

    for (const service of serviceTypes) {
      for (let i = 0; i < engineBands.length; i += 1) {
        const band = engineBands[i];
        const id = `${service.key}-${band.minCC}-${band.maxCC}`;
        const priceExVat = defaultPrices[service.key]?.[i] || 0;

        await setDoc(
          doc(db, "servicePricingMatrix", id),
          {
            serviceType: service.key,
            bandLabel: band.label,
            minCC: band.minCC,
            maxCC: band.maxCC,
            priceExVat,
            priceIncVat: calculateIncVat(priceExVat),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
    }

    setSaving(false);
    alert("Default service matrix saved.");
  };

  const activeService = serviceTypes.find((item) => item.key === activeType);

  return (
    <section className="adminPage">
      <div className="adminHero">
        <span>SERVICE MATRIX</span>
        <h2>Service Prices</h2>
        <p>
          Set Oil & Filter, Interim, Full and Major service prices by engine
          size. Prices are ex. VAT — 20% VAT is added automatically.
        </p>
      </div>

      <div className="adminStats">
        <div className="adminStat">
          <span>Service Types</span>
          <strong>{serviceTypes.length}</strong>
        </div>

        <div className="adminStat">
          <span>Engine Bands</span>
          <strong>{engineBands.length}</strong>
        </div>

        <div className="adminStat">
          <span>Status</span>
          <strong>{saving ? "Saving" : "Live"}</strong>
        </div>
      </div>

      <div className="adminGrid">
        <div className="adminPanel">
          <h3>Service Type</h3>

          <div className="adminList">
            {serviceTypes.map((service) => (
              <button
                key={service.key}
                type="button"
                className={
                  activeType === service.key ? "adminCard active" : "adminCard"
                }
                onClick={() => setActiveType(service.key)}
              >
                <h4>{service.label}</h4>
                <p>Matrix pricing by engine CC</p>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="adminBtn"
            onClick={seedDefaults}
            style={{ marginTop: 18 }}
          >
            Load Default Prices
          </button>
        </div>

        <div className="adminPanel">
          <div className="adminEditHeader">
            <div>
              <h3>{activeService?.label}</h3>
              <p>Editable engine size pricing matrix</p>
            </div>
          </div>

          <div className="matrixTable">
            <div className="matrixHead">
              <span>Engine Size</span>
              <span>CC Range</span>
              <span>Sell Price ex. VAT</span>
              <span>Inc. VAT</span>
            </div>

            {engineBands.map((band, index) => {
              const row = getRow(activeType, index);
              const exVat = Number(row.priceExVat || 0);
              const incVat = calculateIncVat(exVat);

              return (
                <div className="matrixRow" key={band.label}>
                  <strong>{band.label}</strong>

                  <span>
                    {band.minCC} - {band.maxCC} cc
                  </span>

                  <label className="moneyInput">
                    £
                    <input
                      type="number"
                      value={exVat}
                      onChange={(e) =>
                        updatePrice(activeType, index, e.target.value)
                      }
                    />
                  </label>

                  <b>£{incVat.toFixed(2)}</b>
                </div>
              );
            })}
          </div>

          <div className="adminInfoBox">
            <strong>How this works:</strong> When a customer enters their VRM,
            the system can use the vehicle engine size to find the matching CC
            band and automatically price the selected service.
          </div>
        </div>
      </div>
    </section>
  );
}