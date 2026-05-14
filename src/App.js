import Checkout from "./Checkout";
import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import Booking from "./Booking";
import Dashboard from "./Dashboard";
import MOT from "./MOT";
import Confirmation from "./Confirmation";
import Admin from "./Admin";
import Service from "./Service";
import ServiceLandingPage from "./ServiceLandingPage";
import Summary from "./Summary";
import AirConPage from "./AirConPage";
import TyreSearchPage from "./TyreSearchPage";
import TyreProductPage from "./TyreProductPage";
import TyreBasketPage from "./TyreBasketPage";
import BasketPage from "./BasketPage";
import AlloyWheels from "./AlloyWheels";
import TyreSizeCalculator from "./TyreSizeCalculator";


export default function App() {
  return (
    <Routes>

      <Route path="/alloy-wheels" element={<AlloyWheels />} />   
      <Route path="/" element={<Home />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/mot" element={<MOT />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/confirmation" element={<Confirmation />} />
      <Route path="/service" element={<Service />} />
      <Route path="/tyres-hull" element={<ServiceLandingPage pageKey="tyresHull" />} />
      <Route path="/mot-hull" element={<ServiceLandingPage pageKey="motHull" />} />
      <Route path="/car-servicing-hull" element={<ServiceLandingPage pageKey="servicingHull" />} />
      <Route path="/brakes-hull" element={<ServiceLandingPage pageKey="brakesHull" />} />
      <Route path="/air-conditioning-hull" element={<ServiceLandingPage pageKey="airconHull" />} />
      <Route path="/clutch-repairs-hull" element={<ServiceLandingPage pageKey="clutchHull" />} />
      <Route path="/timing-belt-hull" element={<ServiceLandingPage pageKey="timingHull" />} />
      <Route path="/wheel-alignment-hull" element={<ServiceLandingPage pageKey="alignmentHull" />} />
      <Route path="/summary" element={<Summary />} />
      <Route path="/clutch-repairs-hull" element={<ServiceLandingPage pageKey="clutchRepairsHull" />} />
      <Route path="/timing-belt-hull" element={<ServiceLandingPage pageKey="timingBeltHull" />} />
      <Route path="/tyres" element={<TyreSearchPage />} />
      <Route path="/tyre-product" element={<TyreProductPage />} />
      <Route path="/basket" element={<BasketPage />} />
      <Route path="/tyre-size-calculator" element={<TyreSizeCalculator />} />
      
      <Route path="/tyres/:tyreSlug" element={<TyreProductPage />} />

      {/* Admin */}
      <Route path="/admin" element={<Admin />} />

    </Routes>
  );
}