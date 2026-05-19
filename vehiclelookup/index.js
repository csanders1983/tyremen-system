const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

const API_KEY = "57F43D54-AD7D-4E48-8120-36F12EC3A150";

const VEHICLE_PACKAGE = "VehicleDetailsWithImage";
const TYRE_PACKAGE = "TyreDetails";
const MOT_PACKAGE = "MotHistoryDetails";

exports.vehicleLookup = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

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
    
    const motUrl =
      "https://uk.api.vehicledataglobal.com/r2/lookup" +
      `?apiKey=${API_KEY}` +
      `&packageName=${MOT_PACKAGE}` +
      `&vrm=${vrm}`;

    const vehicleRes = await fetch(vehicleUrl);
    const tyreRes = await fetch(tyreUrl);
    const motRes = await fetch(motUrl);
    

    const data = await vehicleRes.json();
    const tyreData = await tyreRes.json();
    const motData = await motRes.json();

    console.log("VEHICLE API RESPONSE:", JSON.stringify(data, null, 2));
    console.log("TYRE API RESPONSE:", JSON.stringify(tyreData, null, 2));
    console.log("MOT API RESPONSE:", JSON.stringify(motData, null, 2));
    console.log("FULL MOT RESPONSE:", JSON.stringify(motData, null, 2));

    if (!data.ResponseInformation?.IsSuccessStatusCode) {
      return res.status(400).json({
        success: false,
        error:
          data.ResponseInformation?.StatusMessage ||
          "Vehicle lookup failed",
      });
    }

    const tyreDetailsList =
      tyreData.Results?.TyreDetails?.TyreDetailsList ||
      tyreData.Results?.TyreDetails?.tyreDetailsList ||
      tyreData.Results?.tyreDetails?.TyreDetailsList ||
      tyreData.Results?.tyreDetails?.tyreDetailsList ||
      [];

    const firstStandard =
      tyreDetailsList.find((item) => item.IsStandardFitmentForVehicle) ||
      tyreDetailsList.find((item) => item.isStandardFitmentForVehicle) ||
      tyreDetailsList[0] ||
      null;

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

    const engineCC =
      data.Results?.VehicleDetails?.DvlaTechnicalDetails?.EngineCapacityCc ||
      data.Results?.vehicleDetails?.dvlaTechnicalDetails?.engineCapacityCc ||
      data.Results?.ModelDetails?.Powertrain?.IceDetails?.EngineCapacityCc ||
      data.Results?.modelDetails?.powertrain?.iceDetails?.engineCapacityCc ||
      null;

    const engineLitres =
      data.Results?.ModelDetails?.Powertrain?.IceDetails?.EngineCapacityLitres ||
      data.Results?.modelDetails?.powertrain?.iceDetails?.engineCapacityLitres ||
      null;

    const grossWeightKg =
      data.Results?.VehicleDetails?.DvlaTechnicalDetails?.GrossWeightKg ||
      data.Results?.vehicleDetails?.dvlaTechnicalDetails?.grossWeightKg ||
      data.Results?.ModelDetails?.Weights?.GrossVehicleWeightKg ||
      data.Results?.modelDetails?.weights?.grossVehicleWeightKg ||
      null;

    const image =
      data.Results?.VehicleImageDetails?.VehicleImageList?.[0]?.ImageUrl ||
      data.Results?.VehicleImageDetails?.vehicleImageList?.[0]?.imageUrl ||
      data.Results?.vehicleImageDetails?.VehicleImageList?.[0]?.ImageUrl ||
      data.Results?.vehicleImageDetails?.vehicleImageList?.[0]?.imageUrl ||
      null;
	
    console.log("MOT DATA RESULTS:", JSON.stringify(motData?.Results || motData?.results, null, 2));

    const vehicle = {
      vrm,
      make:
        data.Results?.ModelDetails?.ModelIdentification?.Make ||
        data.Results?.modelDetails?.modelIdentification?.make ||
        data.Results?.VehicleDetails?.VehicleIdentification?.DvlaMake ||
        data.Results?.vehicleDetails?.vehicleIdentification?.dvlaMake ||
        "",

      model:
        data.Results?.ModelDetails?.ModelIdentification?.Model ||
        data.Results?.modelDetails?.modelIdentification?.model ||
        data.Results?.VehicleDetails?.VehicleIdentification?.DvlaModel ||
        data.Results?.vehicleDetails?.vehicleIdentification?.dvlaModel ||
        "",

      year:
        data.Results?.VehicleDetails?.VehicleIdentification?.YearOfManufacture ||
        data.Results?.vehicleDetails?.vehicleIdentification?.yearOfManufacture ||
        "",

      fuel:
        data.Results?.ModelDetails?.Powertrain?.FuelType ||
        data.Results?.modelDetails?.powertrain?.fuelType ||
        data.Results?.VehicleDetails?.VehicleIdentification?.DvlaFuelType ||
        data.Results?.vehicleDetails?.vehicleIdentification?.dvlaFuelType ||
        "",

      body:
        data.Results?.ModelDetails?.BodyDetails?.BodyStyle ||
        data.Results?.modelDetails?.bodyDetails?.bodyStyle ||
        data.Results?.VehicleDetails?.VehicleIdentification?.DvlaBodyType ||
        data.Results?.vehicleDetails?.vehicleIdentification?.dvlaBodyType ||
        "",

      colour:
        data.Results?.VehicleDetails?.VehicleHistory?.ColourDetails
          ?.CurrentColour ||
        data.Results?.vehicleDetails?.vehicleHistory?.colourDetails
          ?.currentColour ||
        "",

      motDue:
  motData?.Results?.MotHistoryDetails?.MotDueDate ||
  motData?.Results?.MotHistoryDetails?.motDueDate ||
  motData?.Results?.motHistoryDetails?.MotDueDate ||
  motData?.Results?.motHistoryDetails?.motDueDate ||
  motData?.results?.MotHistoryDetails?.MotDueDate ||
  motData?.results?.MotHistoryDetails?.motDueDate ||
  motData?.results?.motHistoryDetails?.MotDueDate ||
  motData?.results?.motHistoryDetails?.motDueDate ||
  null,

      motMileage:
  	motData.Results?.MotHistoryDetails?.MotTestDetailsList?.[0]?.OdometerReading ||
  	motData.Results?.motHistoryDetails?.motTestDetailsList?.[0]?.odometerReading ||
  	motData.results?.motHistoryDetails?.motTestDetailsList?.[0]?.odometerReading ||
  	null,

motAdvisories:
  motData?.Results?.MotHistoryDetails?.MotTestDetailsList?.[0]?.AnnotationList ||
  motData?.Results?.MotHistoryDetails?.motTestDetailsList?.[0]?.annotationList ||
  motData?.results?.motHistoryDetails?.motTestDetailsList?.[0]?.annotationList ||
  [],

      image,

      engineCC: engineCC ? Number(engineCC) : null,
      engineLitres: engineLitres ? Number(engineLitres) : null,
      grossWeightKg: grossWeightKg ? Number(grossWeightKg) : null,

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
    console.error("VEHICLE LOOKUP ERROR:", err);

    return res.status(500).json({
      success: false,
      error: "Server error",
      message: err.message,
    });
  }
});