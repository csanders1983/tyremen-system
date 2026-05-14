const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const API_KEY = "PASTE_NEW_KEY_HERE";
const PACKAGE_NAME = "VDICheck";
const ENDPOINT = "https://uk.api.vehicledataglobal.com/r2/lookup";

exports.vehicleLookup = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).send("");

  try {
    const vrm = String(req.body.vrm || req.query.vrm || "")
      .toUpperCase()
      .replace(/\s/g, "");

    if (!vrm) {
      return res.status(400).json({ success: false, error: "No registration entered" });
    }

    const savedRef = db.collection("vehicleLookups").doc(vrm);
    const savedSnap = await savedRef.get();

    if (savedSnap.exists) {
      const saved = savedSnap.data();
      const ageMs = Date.now() - saved.updatedAt.toMillis();
      const oneDayMs = 24 * 60 * 60 * 1000;

      if (ageMs < oneDayMs) {
        return res.json({ success: true, cached: true, vehicle: saved.vehicle });
      }
    }

    const url =
      `${ENDPOINT}?apiKey=${API_KEY}` +
      `&packageName=${PACKAGE_NAME}` +
      `&vrm=${encodeURIComponent(vrm)}`;

    const apiRes = await fetch(url);
    const raw = await apiRes.json();

    if (!raw.ResponseInformation?.IsSuccessStatusCode) {
      return res.status(400).json({
        success: false,
        error: raw.ResponseInformation?.StatusMessage || "Vehicle lookup failed",
      });
    }

    const r = raw.Results || {};
    const vehicleDetails = r.VehicleDetails || {};
    const modelDetails = r.ModelDetails || {};
    const mot = r.MotHistoryDetails || {};
    const image = r.VehicleImageDetails?.VehicleImageList?.[0]?.ImageUrl || null;

    const currentMake = vehicleDetails.VehicleIdentification?.DvlaMake || "";
    const currentModel = vehicleDetails.VehicleIdentification?.DvlaModel || "";

    const motMatchesVehicle =
      mot.Make &&
      currentMake &&
      mot.Make.toLowerCase().includes(currentMake.toLowerCase().split(" ")[0]);

    const vehicle = {
      vrm,
      make: modelDetails.ModelIdentification?.Make || currentMake || "",
      model: modelDetails.ModelIdentification?.Model || currentModel || "",
      dvlaModel: currentModel,
      year: vehicleDetails.VehicleIdentification?.YearOfManufacture || null,
      fuel:
        modelDetails.Powertrain?.FuelType ||
        vehicleDetails.VehicleIdentification?.DvlaFuelType ||
        "",
      body:
        modelDetails.BodyDetails?.BodyStyle ||
        vehicleDetails.VehicleIdentification?.DvlaBodyType ||
        "",
      engineCc:
        modelDetails.Powertrain?.IceDetails?.EngineCapacityCc ||
        vehicleDetails.DvlaTechnicalDetails?.EngineCapacityCc ||
        null,
      engineLitres:
        modelDetails.Powertrain?.IceDetails?.EngineCapacityLitres || null,
      transmission: modelDetails.Powertrain?.Transmission?.TransmissionType || "",
      colour: vehicleDetails.VehicleHistory?.ColourDetails?.CurrentColour || "",
      motDueDate: motMatchesVehicle ? mot.MotDueDate : null,
      motWarning: motMatchesVehicle
        ? null
        : "MOT data may relate to a previous vehicle on this private plate.",
      image,
    };

    await savedRef.set({
      vrm,
      vehicle,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.json({ success: true, cached: false, vehicle });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Server error during vehicle lookup",
    });
  }
});