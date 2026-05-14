export const engineBands = [
  { label: "0-1200cc", minCC: 0, maxCC: 1200 },
  { label: "1201cc-1500cc", minCC: 1201, maxCC: 1500 },
  { label: "1501cc-2000cc", minCC: 1501, maxCC: 2000 },
  { label: "2001cc-2400cc", minCC: 2001, maxCC: 2400 },
  { label: "2401cc-3500cc", minCC: 2401, maxCC: 3500 },
  { label: "3501cc-9999cc", minCC: 3501, maxCC: 9999 },
];

export const serviceTypes = [
  { key: "oil", label: "Oil & Filter" },
  { key: "interim", label: "Interim Service" },
  { key: "full", label: "Full Service" },
  { key: "major", label: "Major Service" },
];

export const calculateIncVat = (exVat) => {
  return Number((Number(exVat || 0) * 1.2).toFixed(2));
};

export const calculateServicePrice = (serviceType, engineCC, matrix) => {
  const match = matrix.find((row) => {
    return (
      row.serviceType === serviceType &&
      Number(engineCC) >= Number(row.minCC) &&
      Number(engineCC) <= Number(row.maxCC)
    );
  });

  if (!match) {
    return {
      exVat: 0,
      incVat: 0,
    };
  }

  const exVat = Number(match.priceExVat || 0);

  return {
    exVat,
    incVat: calculateIncVat(exVat),
  };
};