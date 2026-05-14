import { useMemo, useState } from "react";
import Header from "./components/Header";
import "./TyreSizeCalculator.css";

export default function TyreSizeCalculator() {
  const [oldSize, setOldSize] = useState("205/55R16");
  const [newSize, setNewSize] = useState("225/45R17");

  const parseTyre = (value) => {
    const cleaned = value.toUpperCase().replace(/\s+/g, "");
    const match = cleaned.match(/^(\d{3})\/(\d{2})R?(\d{2})$/);

    if (!match) return null;

    const width = Number(match[1]);
    const profile = Number(match[2]);
    const rim = Number(match[3]);

    const sidewall = width * (profile / 100);
    const rimMm = rim * 25.4;
    const diameter = rimMm + sidewall * 2;
    const circumference = diameter * Math.PI;

    return { width, profile, rim, sidewall, rimMm, diameter, circumference };
  };

  const oldTyre = useMemo(() => parseTyre(oldSize), [oldSize]);
  const newTyre = useMemo(() => parseTyre(newSize), [newSize]);

  const comparison = useMemo(() => {
    if (!oldTyre || !newTyre) return null;

    const diameterDiff = newTyre.diameter - oldTyre.diameter;
    const diameterPercent = (diameterDiff / oldTyre.diameter) * 100;
    const circumferenceDiff = newTyre.circumference - oldTyre.circumference;
    const circumferencePercent = (circumferenceDiff / oldTyre.circumference) * 100;
    const rideHeight = diameterDiff / 2;

    return {
      diameterDiff,
      diameterPercent,
      circumferenceDiff,
      circumferencePercent,
      rideHeight,
      speedAt30: 30 * (newTyre.circumference / oldTyre.circumference),
      speedAt60: 60 * (newTyre.circumference / oldTyre.circumference),
      speedAt70: 70 * (newTyre.circumference / oldTyre.circumference),
      isSafe: Math.abs(diameterPercent) <= 2.5,
    };
  }, [oldTyre, newTyre]);

  const mm = (n) => `${n.toFixed(1)} mm`;
  const pct = (n) => `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;

  return (
    <>
      <Header />

      <div className="tyreCalcPage">
        <div className="tyreCalcWrap">
          <section className="tyreCalcHero">
            <p>Tyremen Tool</p>
            <h1>Tyre Size Calculator</h1>
            <span>
              Compare two tyre sizes and check diameter, speedometer change,
              ride height and rolling circumference.
            </span>
          </section>

          <section className="tyreCalcInputs">
            <div className="tyreInputBox">
              <label>Original tyre size</label>
              <input
                value={oldSize}
                onChange={(e) => setOldSize(e.target.value)}
                placeholder="205/55R16"
              />
              <p>Example: 205/55R16</p>
            </div>

            <div className="tyreInputBox">
              <label>New tyre size</label>
              <input
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                placeholder="225/45R17"
              />
              <p>Example: 225/45R17</p>
            </div>
          </section>

          {(!oldTyre || !newTyre) && (
            <div className="tyreWarning">
              Please enter both sizes in this format: 205/55R16
            </div>
          )}

          {oldTyre && newTyre && comparison && (
            <>
              <section className={comparison.isSafe ? "tyreSafe" : "tyreDanger"}>
                <h2>
                  {comparison.isSafe
                    ? "Usually acceptable"
                    : "Outside recommended range"}
                </h2>
                <p>
                  Diameter difference is{" "}
                  <strong>{pct(comparison.diameterPercent)}</strong>. A common
                  guide is to keep tyre diameter within about 2.5% of the original
                  size.
                </p>
              </section>

              <section className="tyreStats">
                <Stat
                  title="Diameter Difference"
                  value={mm(comparison.diameterDiff)}
                  sub={pct(comparison.diameterPercent)}
                />
                <Stat
                  title="Ride Height Change"
                  value={mm(comparison.rideHeight)}
                  sub="Half of diameter change"
                />
                <Stat
                  title="Circumference Difference"
                  value={mm(comparison.circumferenceDiff)}
                  sub={pct(comparison.circumferencePercent)}
                />
              </section>

              <section className="tyreTableBox">
                <div className="tyreTableHead">
                  <h2>Size Comparison</h2>
                </div>

                <div className="tyreTableScroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Measurement</th>
                        <th>Original</th>
                        <th>New</th>
                      </tr>
                    </thead>
                    <tbody>
                      <Row label="Width" oldValue={mm(oldTyre.width)} newValue={mm(newTyre.width)} />
                      <Row label="Profile" oldValue={`${oldTyre.profile}%`} newValue={`${newTyre.profile}%`} />
                      <Row label="Wheel Size" oldValue={`${oldTyre.rim}"`} newValue={`${newTyre.rim}"`} />
                      <Row label="Sidewall Height" oldValue={mm(oldTyre.sidewall)} newValue={mm(newTyre.sidewall)} />
                      <Row label="Overall Diameter" oldValue={mm(oldTyre.diameter)} newValue={mm(newTyre.diameter)} />
                      <Row label="Rolling Circumference" oldValue={mm(oldTyre.circumference)} newValue={mm(newTyre.circumference)} />
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="speedBox">
                <h2>Speedometer Reading</h2>
                <div className="speedGrid">
                  <Speed shown="30 mph" actual={`${comparison.speedAt30.toFixed(1)} mph`} />
                  <Speed shown="60 mph" actual={`${comparison.speedAt60.toFixed(1)} mph`} />
                  <Speed shown="70 mph" actual={`${comparison.speedAt70.toFixed(1)} mph`} />
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function Stat({ title, value, sub }) {
  return (
    <div className="tyreStatCard">
      <p>{title}</p>
      <strong>{value}</strong>
      <span>{sub}</span>
    </div>
  );
}

function Row({ label, oldValue, newValue }) {
  return (
    <tr>
      <td>{label}</td>
      <td>{oldValue}</td>
      <td>{newValue}</td>
    </tr>
  );
}

function Speed({ shown, actual }) {
  return (
    <div className="speedCard">
      <p>When speedo shows</p>
      <strong>{shown}</strong>
      <span>Actual speed approx: {actual}</span>
    </div>
  );
}