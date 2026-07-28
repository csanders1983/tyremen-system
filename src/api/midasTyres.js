const MIDAS_URL =
  "https://us-central1-tyremen-system.cloudfunctions.net/midasTyreSearch";

export async function searchMidasTyres(width, profile, rim) {
  const url =
    `${MIDAS_TYRE_URL}?width=${width}` +
    `&profile=${profile}` +
    `&rim=${rim}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.success) {
    throw new Error("Tyre search failed");
  }

  return data.tyres || [];
}