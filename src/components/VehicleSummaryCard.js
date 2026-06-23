export default function VehicleSummaryCard({ vehicle, type = "service" }) {
  if (!vehicle) return null;

  const motDate = vehicle.motDue
    ? new Date(vehicle.motDue).toLocaleDateString("en-GB")
    : "Not found";

  const tyreSize =
    vehicle.tyreSize || vehicle.frontTyreSize || vehicle.rearTyreSize || "Not found";

  const isVan =
    (vehicle.body || vehicle.bodyType || vehicle.vehicleType || "")
      .toLowerCase()
      .includes("van") ||
    Number(vehicle.grossWeightKg || 0) > 3000;

  const recommendedMot = isVan ? "Class 7" : "Class 4";
  const recommendedAlignment = isVan ? "Van Alignment" : "Car Alignment";

  return (
    <div className="smartVehicleCard">
      <div className="smartReg">{vehicle.vrm}</div>

      <h3>
        {vehicle.year} {vehicle.make} {vehicle.model}
      </h3>

      <p>
        {vehicle.body || vehicle.bodyType || vehicle.vehicleType || "Vehicle"} •{" "}
        {vehicle.engineLitres ? `${vehicle.engineLitres}L` : ""}
        {vehicle.fuel ? ` ${vehicle.fuel}` : ""}
      </p>

      <div className="smartVehicleGrid">
        <div>
          <span>TYRE SIZE</span>
          <strong>{tyreSize}</strong>
        </div>

        <div>
          <span>MOT DUE</span>
          <strong>{motDate}</strong>
        </div>

        <div>
          <span>WEIGHT</span>
          <strong>
            {vehicle.grossWeightKg ? `${vehicle.grossWeightKg}kg` : "Not found"}
          </strong>
        </div>

        <div>
          <span>
            {type === "mot"
              ? "RECOMMENDED MOT"
              : type === "alignment"
              ? "RECOMMENDED ALIGNMENT"
              : "ADVISORIES"}
          </span>

          <strong>
            {type === "mot"
              ? recommendedMot
              : type === "alignment"
              ? recommendedAlignment
              : vehicle.motAdvisories?.length || 0}
          </strong>
        </div>
      </div>

      {vehicle.motAdvisories?.length > 0 && (
        <div className="smartAdvisories">
          <span>Current MOT Advisories</span>

          {vehicle.motAdvisories.slice(0, 2).map((item, index) => (
            <p key={index}>⚠ {item.Text}</p>
          ))}
        </div>
      )}
    </div>
  );
}