const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

const API_KEY = "57F43D54-AD7D-4E48-8120-36F12EC3A150";

const VEHICLE_PACKAGE = "VDICheck";
const TYRE_PACKAGE = "TyreDetails";

exports.vehicleLookup = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");

  try {
    const vrm = String(req.query.vrm || "")
      .toUpperCase()
      .replace(/\s/g, "");

    if (!vrm) {
      return res.status(400).json({
        success: false,
        error: "Missing VRM",
      });
    }

    const cached = await db.collection("vehicleCache").doc(vrm).get();

    if (cached.exists) {
      return res.json({
        success: true,
        cached: true,
        vehicle: cached.data(),
      });
    }

    const vehicleUrl =
      "https://uk.api.vehicledataglobal.com/r2/lookup" +
      `?apiKey=${API_KEY}` +
      `&packageName=${VEHICLE_PACKAGE}` +
      `&vrm=${vrm}`;

    const tyreUrl =
      "https://uk.api.vehicledataglobal.com/r2/lookup" +
      `?apiKey=${API_KEY}` +
      `&packageName=${TYRE_PACKAGE}` +
      `&vrm=${vrm}`;

    const vehicleRes = await fetch(vehicleUrl);
    const tyreRes = await fetch(tyreUrl);

    const data = await vehicleRes.json();
    const tyreData = await tyreRes.json();
    console.log(
  "TYRE API RESPONSE:",
  JSON.stringify(tyreData, null, 2)
);

    if (!data.ResponseInformation?.IsSuccessStatusCode) {
      return res.status(400).json({
        success: false,
        error: data.ResponseInformation?.StatusMessage,
      });
    }

    const tyreDetailsList =
      tyreData.Results?.TyreDetails?.TyreDetailsList ||
      tyreData.Results?.TyreDetails?.tyreDetailsList ||
      [];

    const firstStandard =
      tyreDetailsList.find((item) => item.IsStandardFitmentForVehicle) ||
      tyreDetailsList.find((item) => item.isStandardFitmentForVehicle) ||
      tyreDetailsList[0];

    const frontTyre =
      firstStandard?.Front?.Tyre ||
      firstStandard?.front?.tyre ||
      null;

    const rearTyre =
      firstStandard?.Rear?.Tyre ||
      firstStandard?.rear?.tyre ||
      null;

    const frontSize =
      frontTyre?.SizeDescription ||
      frontTyre?.sizeDescription ||
      "";

    const rearSize =
      rearTyre?.SizeDescription ||
      rearTyre?.sizeDescription ||
      "";

    const tyreSize = frontSize || rearSize || "";

    const vehicle = {
      vrm,
      make: data.Results?.ModelDetails?.ModelIdentification?.Make || "",
      model: data.Results?.ModelDetails?.ModelIdentification?.Model || "",
      year:
        data.Results?.VehicleDetails?.VehicleIdentification
          ?.YearOfManufacture || "",
      fuel: data.Results?.ModelDetails?.Powertrain?.FuelType || "",
      body: data.Results?.ModelDetails?.BodyDetails?.BodyStyle || "",
      colour:
        data.Results?.VehicleDetails?.VehicleHistory?.ColourDetails
          ?.CurrentColour || "",
      motDue: data.Results?.MotHistoryDetails?.MotDueDate || null,
      image:
        data.Results?.VehicleImageDetails?.VehicleImageList?.[0]
          ?.ImageUrl || null,

      tyreSize,
      frontTyreSize: frontSize,
      rearTyreSize: rearSize,
      tyreDetails: tyreDetailsList,
    };

    await db.collection("vehicleCache").doc(vrm).set(vehicle);

    return res.json({
      success: true,
      cached: false,
      vehicle,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});