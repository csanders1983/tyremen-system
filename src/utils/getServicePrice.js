import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase";

export async function getServicePrice(serviceType, engineCC) {
  try {
    const q = query(
      collection(db, "servicePricingMatrix"),
      where("serviceType", "==", serviceType)
    );

    const snapshot = await getDocs(q);

    const rows = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const matched = rows.find(
      (row) =>
        Number(engineCC) >= Number(row.minCC) &&
        Number(engineCC) <= Number(row.maxCC)
    );

    if (!matched) return 0;

    return Number(matched.priceIncVat || 0);
  } catch (err) {
    console.error(err);
    return 0;
  }
}