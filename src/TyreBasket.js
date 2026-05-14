export const saveTyreBasket = (tyreItem) => {
  localStorage.setItem("tyreBasket", JSON.stringify([tyreItem]));
};

export const getTyreBasket = () => {
  return JSON.parse(localStorage.getItem("tyreBasket")) || [];
};

export const clearTyreBasket = () => {
  localStorage.removeItem("tyreBasket");
};