import { createContext, useContext, useState } from "react";

const BasketContext = createContext();

export const useBasket = () => useContext(BasketContext);

export const BasketProvider = ({ children }) => {
  const [basket, setBasket] = useState({
    service: null,
    extras: [],
    date: "",
    time: ""
  });

  const addService = (service) => {
    setBasket((prev) => ({ ...prev, service }));
  };

  const addExtra = (extra) => {
    setBasket((prev) => ({
      ...prev,
      extras: [...new Set([...prev.extras, extra])]
    }));
  };

  const removeExtra = (extra) => {
    setBasket((prev) => ({
      ...prev,
      extras: prev.extras.filter((e) => e !== extra)
    }));
  };

  const setBookingTime = (date, time) => {
    setBasket((prev) => ({
      ...prev,
      date,
      time
    }));
  };

  const clearBasket = () => {
    setBasket({
      service: null,
      extras: [],
      date: "",
      time: ""
    });
  };

  return (
    <BasketContext.Provider
      value={{
        basket,
        addService,
        addExtra,
        removeExtra,
        setBookingTime,
        clearBasket
      }}
    >
      {children}
    </BasketContext.Provider>
  );
};