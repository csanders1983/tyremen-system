export const servicePrices = {
  interim: 149,
  full: 199,
  major: 249,
  mot: 40,
  brakes: 0,
  clutch: 0,
  cambelt: 0,
  aircon: 0,
  diagnostic: 0,
};

export const getBasket = () => {
  try {
    const saved = JSON.parse(localStorage.getItem("tyremenBasket") || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

export const saveBasket = (basket) => {
  localStorage.setItem("tyremenBasket", JSON.stringify(basket));
};

export const clearBasket = () => {
  localStorage.removeItem("tyremenBasket");
};

export const getStockNumber = (tyre) => {
  return (
    tyre.stockNumber ||
    tyre["Stock Number"] ||
    tyre["StockNumber"] ||
    tyre.StockNumber ||
    tyre["Stock No"] ||
    tyre["Stock Code"] ||
    tyre.stockNo ||
    tyre.stockCode ||
    tyre.SKU ||
    tyre.sku ||
    ""
  );
};

export const getFittedPrice = (tyre) => {
  const cost = Number(tyre.Price || tyre.price || 0);
  return Number(((cost + 25) * 1.2).toFixed(2));
};

export const addToBasket = (tyre, qty = 1) => {
  const basket = getBasket();

  const stockNumber = getStockNumber(tyre);

  const size =
    tyre.Size ||
    tyre.size ||
    (tyre.Width && tyre["Aspect Ratio"] && tyre.Rim
      ? `${tyre.Width}/${tyre["Aspect Ratio"]}R${tyre.Rim}`
      : "");

  const safePrice =
    typeof tyre.price === "number" && !Number.isNaN(tyre.price)
      ? tyre.price
      : getFittedPrice(tyre);

  const vehicle = tyre.Vehicle || tyre.vehicle || null;
  const axle = tyre.axle || "";

  const id =
    stockNumber ||
    tyre.id ||
    `${tyre.Brand || tyre.brand || "TYRE"}-${
      tyre.Model || tyre.Pattern || tyre.pattern || ""
    }-${size}-${axle}`;

  const existing = basket.find((item) => item.id === id);

  if (existing) {
    existing.qty = Number(existing.qty || 1) + Number(qty || 1);
  } else {
    basket.push({
      id,
      stockNumber,

      brand: tyre.Brand || tyre.brand || "",
      pattern: tyre.Pattern || tyre.Model || tyre.pattern || "",
      title: tyre.Title || tyre.title || "",
      size,

      loadIndex: tyre["Load Index"] || tyre.loadIndex || "",
      speedRating: tyre["Speed Rating"] || tyre.speedRating || "",
      runflat: tyre.Runflat || tyre.runflat || "",

      fuel: tyre.Fuel || tyre["Rolling Resistance"] || tyre.fuel || "",
      wet: tyre.Wet || tyre["Wet Grip"] || tyre.wet || "",
      noise: tyre.Noise || tyre["Noise Performance"] || tyre.noise || "",

      price: Number(safePrice || 0),

      image:
        tyre.Image || tyre["Image URL"] || tyre.image || "/tyre-placeholder.png",

      vehicle,
      axle,

      purchaseType: tyre.purchaseType || "fitted",
      qty: Number(qty || 1),
    });
  }

  saveBasket(basket);
};