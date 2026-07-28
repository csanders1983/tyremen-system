const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const cors = require("cors")({ origin: true });

admin.initializeApp();

const db = admin.firestore();

const API_KEY = process.env.VDG_API_KEY;

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
const MIDAS_BASE_URL = "https://api.thevirtualwarehouse.co.uk";
const MIDAS_USERNAME = process.env.MIDAS_USERNAME;
const MIDAS_PASSWORD = process.env.MIDAS_PASSWORD;
const MIDAS_API_KEY = process.env.MIDAS_API_KEY;
const MIDAS_SITE_ID = Number(process.env.MIDAS_SITE_ID || 3025);

const MIDAS_TOKEN_TTL_MS = 50 * 60 * 1000;
const MIDAS_SEARCH_TTL_MS = 5 * 60 * 1000;

let midasTokenCache = {
  token: null,
  expiresAt: 0,
};

const midasSearchCache = new Map();

function assertMidasConfig() {
  const missing = [];

  if (!MIDAS_USERNAME) missing.push("MIDAS_USERNAME");
  if (!MIDAS_PASSWORD) missing.push("MIDAS_PASSWORD");
  if (!MIDAS_API_KEY) missing.push("MIDAS_API_KEY");

  if (missing.length) {
    throw new Error(`Missing MIDAS environment variables: ${missing.join(", ")}`);
  }
}

async function getMidasToken(forceRefresh = false) {
  assertMidasConfig();

  const now = Date.now();

  if (
    !forceRefresh &&
    midasTokenCache.token &&
    midasTokenCache.expiresAt > now
  ) {
    return midasTokenCache.token;
  }

  const login = await axios.post(
    `${MIDAS_BASE_URL}/api/GetLoginToken`,
    {
      username: MIDAS_USERNAME,
      password: MIDAS_PASSWORD,
      apiKey: MIDAS_API_KEY,
    },
    {
      timeout: 10000,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  const token = login.data?.token || login.data;

  if (!token || typeof token !== "string") {
    throw new Error("MIDAS login succeeded but no token was returned");
  }

  midasTokenCache = {
    token,
    expiresAt: now + MIDAS_TOKEN_TTL_MS,
  };

  return token;
}

async function midasGet(path, params = {}, allowRetry = true) {
  const token = await getMidasToken();

  try {
    return await axios.get(`${MIDAS_BASE_URL}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "User-Agent": "TyremenWebsite/1.0",
      },
      params,
      timeout: 12000,
    });
  } catch (err) {
    if (allowRetry && err.response?.status === 401) {
      midasTokenCache = { token: null, expiresAt: 0 };
      const freshToken = await getMidasToken(true);

      return axios.get(`${MIDAS_BASE_URL}${path}`, {
        headers: {
          Authorization: `Bearer ${freshToken}`,
          Accept: "application/json",
          "User-Agent": "TyremenWebsite/1.0",
        },
        params,
        timeout: 12000,
      });
    }

    throw err;
  }
}

function seasonName(value) {
  if (value === "S") return "Summer";
  if (value === "W") return "Winter";
  if (value === "A") return "All Season";
  return "Standard";
}

function stockStatus(qty, depotQty) {
  if (qty > 10) return "In Stock";
  if (qty > 0) return "Low Stock";
  if (depotQty > 0) return "Available Next Day";
  return "Out of Stock";
}

function numberFrom(record, keys) {
  for (const key of keys) {
    const value = record?.[key];
    if (value !== undefined && value !== null && value !== "") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return 0;
}

function mapMidasTyre(t) {
  const qty = numberFrom(t, ["qty", "Qty", "quantity", "Quantity", "stockQty"]);
  const depotQty = numberFrom(t, [
    "depotsQty",
    "DepotsQty",
    "depotQty",
    "networkQty",
  ]);
  const cost = numberFrom(t, ["cost", "Cost", "price", "Price"]);

  return {
    id: t.objId ?? t.ObjId ?? t.id,
    code: t.code ?? t.Code ?? "",

    brand: t.manName ?? t.ManName ?? t.brand ?? "",
    pattern:
      t.treadPattern ??
      t.TreadPattern ??
      t.longdescr ??
      t.LongDescr ??
      t.descr ??
      t.Description ??
      "",

    size: `${t.key1 ?? ""}/${t.key2 ?? ""} R${t.key3 ?? ""}`,
    loadSpeed: t.loadIndex ?? t.LoadIndex ?? "",
    speedRating: t.key4 ?? t.SpeedRating ?? "",

    season: seasonName(t.season ?? t.Season),
    runFlat: String(t.runFlat ?? t.RunFlat ?? "").toUpperCase() === "Y",
    extraLoad: String(t.extraLoad ?? t.ExtraLoad ?? "").toUpperCase() === "Y",

    labels: {
      fuel: t.rrc_grade ?? t.RrcGrade ?? "",
      wetGrip: t.wetGrip_grade ?? t.WetGripGrade ?? "",
      noise:
        t.noiseDb ?? t.NoiseDb
          ? `${t.noiseDb ?? t.NoiseDb} dB`
          : "",
    },

    stock: {
      available: qty,
      network: depotQty,
      status: stockStatus(qty, depotQty),
    },

    pricing: {
      cost,
      retail: Math.ceil((cost + 20) * 1.2),
    },

    images: {
      tyre: t.productImagePath ?? t.ProductImagePath ?? "",
      brand: t.brandLogoPath ?? t.BrandLogoPath ?? "",
    },
  };
}

exports.testMidasLogin = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const token = await getMidasToken(true);

      return res.json({
        success: true,
        message: "MIDAS login worked",
        tokenPreview: `${String(token).substring(0, 20)}...`,
        siteId: MIDAS_SITE_ID,
      });
    } catch (err) {
      console.error("MIDAS LOGIN ERROR:", err.response?.data || err.message);

      return res.status(500).json({
        success: false,
        error: "MIDAS login failed",
        details: err.response?.data || err.message,
      });
    }
  });
});

exports.midasSites = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const response = await midasGet("/api/GetCusSiteDetails");

      return res.json({
        success: true,
        sites: response.data,
      });
    } catch (err) {
      console.error("MIDAS SITE ERROR:", err.response?.data || err.message);

      return res.status(err.response?.status || 500).json({
        success: false,
        error: "MIDAS site lookup failed",
        details: err.response?.data || err.message,
      });
    }
  });
});

exports.midasEndpointTest = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const endpoints = [
      "/api/ProductSearch_Retail_Cached",
      "/api/ProductSearchRetailCached",
      "/api/ProductSearch",
      "/api/SearchProducts",
      "/api/TyreSearch",
      "/api/GetProducts",
      "/api/GetSites",
      "/api/Sites",
      "/api/GetBranches",
      "/api/GetDepots",
    ];

    const results = [];

    for (const endpoint of endpoints) {
      try {
        const response = await midasGet(endpoint, {
          key1: 225,
          key2: 45,
          key3: 17,
          siteId: MIDAS_SITE_ID,
          hideZeroStock: true,
          hideZeroPrice: true,
        });

        results.push({
          endpoint,
          success: true,
          status: response.status,
          sample: response.data,
        });
      } catch (err) {
        results.push({
          endpoint,
          success: false,
          status: err.response?.status || null,
          error: err.response?.data || err.message,
        });
      }
    }

    return res.json(results);
  });
});

exports.midasTyreSearch = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const width = String(req.body.width || req.query.width || "").trim();
      const profile = String(req.body.profile || req.query.profile || "").trim();
      const rim = String(req.body.rim || req.query.rim || "").trim();
      const speed = String(req.body.speed || req.query.speed || "").trim();

      if (!width || !profile || !rim) {
        return res.status(400).json({
          success: false,
          error: "width, profile and rim are required",
        });
      }

      const cacheKey = `${width}-${profile}-${rim}-${speed || "ANY"}`;
      const cached = midasSearchCache.get(cacheKey);

      if (cached && cached.expiresAt > Date.now()) {
        res.set("Cache-Control", "public, max-age=60, s-maxage=300");

        return res.json({
          ...cached.payload,
          cached: true,
        });
      }

      const response = await midasGet("/api/ProductSearch_Cached", {
        key1: width,
        key2: profile,
        key3: rim,
        key4: speed,
        siteId: MIDAS_SITE_ID,
        camUserType: 0,
        grp: "01",
        hideZeroStock: false,
        hideZeroPrice: false,
        includeVat: false,
      });

      const rawTyres = Array.isArray(response.data) ? response.data : [];

      const cleanTyres = rawTyres
        .map(mapMidasTyre)
        .filter(
          (tyre) =>
            tyre.stock.available > 0 &&
            tyre.pricing.cost > 0
        )
        .sort((a, b) => a.pricing.retail - b.pricing.retail);

      const payload = {
        success: true,
        status: response.status,
        cached: false,
        search: {
          size: `${width}/${profile}R${rim}`,
          count: cleanTyres.length,
          rawCount: rawTyres.length,
          siteId: MIDAS_SITE_ID,
        },
        tyres: cleanTyres,
      };

      midasSearchCache.set(cacheKey, {
        payload,
        expiresAt: Date.now() + MIDAS_SEARCH_TTL_MS,
      });

      // Prevent unbounded memory growth in a warm function instance.
      if (midasSearchCache.size > 250) {
        const now = Date.now();

        for (const [key, value] of midasSearchCache.entries()) {
          if (value.expiresAt <= now) {
            midasSearchCache.delete(key);
          }
        }

        if (midasSearchCache.size > 250) {
          midasSearchCache.delete(midasSearchCache.keys().next().value);
        }
      }

      res.set("Cache-Control", "public, max-age=60, s-maxage=300");
      return res.json(payload);
    } catch (err) {
      console.error("MIDAS TYRE SEARCH ERROR:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });

      return res.status(err.response?.status || 500).json({
        success: false,
        error: "MIDAS tyre search failed",
        details: err.response?.data || err.message,
      });
    }
  });
});

exports.midasProductGroups = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const response = await midasGet("/api/GetProductGroups");

      return res.json({
        success: true,
        status: response.status,
        raw: response.data,
      });
    } catch (err) {
      console.error("MIDAS PRODUCT GROUP ERROR:", err.response?.data || err.message);

      return res.status(err.response?.status || 500).json({
        success: false,
        error: "MIDAS product group lookup failed",
        details: err.response?.data || err.message,
      });
    }
  });
});
