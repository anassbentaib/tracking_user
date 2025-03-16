import { useEffect, useState } from "react";
import { FaSearch, FaChevronDown } from "react-icons/fa";
import { motion } from "framer-motion";
import { formatDuration } from "../utils/formatDate";
import Modal from "./Modal";

const API_URL = "http://localhost:8000/api/trips/";

const SearchLocationBar = ({
  recentTrip,
  setRecentTrip,
}: {
  recentTrip: any;
  setRecentTrip: (value: any) => void;
}) => {
  const [activeTab, setActiveTab] = useState("recent");
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState<any[]>([]);
  const [showPopup, setShowPopup] = useState(false);

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  const toggleSection = (sectionKey: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setRecentTrip(data?.recent_trip);
      if (data?.all_trips?.length > 0) {
        setRoutes(data.all_trips);
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  return (
    <div className="w-[260px] sm:w-[400px] text-sm font-light bg-white border-r border-gray-300 shadow-lg h-full">
      <div className="flex-1 text-[13px] text-center flex items-end justify-end w-full ">
        {/* <button
          className="bg-[#008080]  px-4 py-2 m-2 rounded-md text-white cursor-pointer"
          onClick={() => setShowPopup(true)}
        >
          Add Trip
        </button> */}
      </div>
      <div className="flex items-center  text-[#008080] font-semibold">
        <button className="flex-1 py-4 px-1 text-[13px] text-center border-b-2">
          Search Locations
        </button>
        <button className="flex-1  py-4 px-1 text-[13px]  text-center text-gray-500">
          Find Drivers
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 ">
        <div className="relative">
          <FaSearch className="absolute left-3 top-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search for a location..."
            className="w-full p-3 pl-10 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center  text-[#008080] font-semibold">
        <button
          className={`flex-1 text-[13px] p-4 cursor-pointer text-center ${
            activeTab === "recent"
              ? "border-b-2 border-[#008080]"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("recent")}
        >
          Recent Trips
        </button>
        <button
          className={`flex-1 p-4 text-[13px] cursor-pointer text-center ${
            activeTab === "history"
              ? "border-b-2 border-[#008080]"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("history")}
        >
          Routes History
        </button>
      </div>
      {activeTab === "recent" && (
        <div className="px-1 overflow-y-auto max-h-[400px]">
          {loading ? (
            <p className="text-center mt-10">Loading...</p>
          ) : recentTrip ? (
            <div className="p-4 border-b border-gray-200">
              <h1 className="text-lg font-semibold mb-1">Trip</h1>
              <p className="text-gray-700">
                <span className="font-medium">Miles:</span>{" "}
                {recentTrip?.trip?.total_miles?.toFixed(2) ||
                  recentTrip?.total_miles?.toFixed(2)}
                mi
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Current location:</span>{" "}
                {recentTrip?.trip?.current_address ||
                  recentTrip?.current_address}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Pickup location:</span>{" "}
                {recentTrip?.trip?.pickup_address || recentTrip?.pickup_address}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Dropoff location:</span>{" "}
                {recentTrip?.trip?.dropoff_address ||
                  recentTrip?.dropoff_address}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Cycle Hours:</span>{" "}
                {recentTrip?.trip?.cycle_hours || recentTrip?.cycle_hours}h
              </p>

              {/* Accordion Sections */}
              <AccordionSection
                title="Available Routesss"
                isOpen={expandedSections["routes-recent"]}
                onClick={() => toggleSection("routes-recent")}
              >
                {recentTrip?.trip?.available_routes?.length ||
                recentTrip?.available_routes?.length > 0 ? (
                  (
                    recentTrip?.trip?.available_routes ||
                    recentTrip?.available_routes ||
                    []
                  ).map((routeData, idx) => (
                    <div key={idx} className="p-2 ">
                      <h1 className="font-medium">Route {idx + 1}</h1>
                      <p>
                        Duration:{" "}
                        {formatDuration(routeData?.duration.toFixed(2))}
                      </p>
                      <p>Distance: {routeData?.distance.toFixed(2)} km</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No available routes</p>
                )}
              </AccordionSection>

              <AccordionSection
                title="Fuel Stops"
                isOpen={expandedSections["fuel-recent"]}
                onClick={() => toggleSection("fuel-recent")}
              >
                {recentTrip?.fuel_stops?.length > 0 ? (
                  recentTrip.fuel_stops.map((fuelData, idx) => (
                    <div key={idx} className="p-2 ">
                      <p className="font-medium">Fuel Stop {idx + 1}</p>
                      <p>
                        <span className="font-medium">Location:</span>{" "}
                        {fuelData?.location}
                      </p>
                      <p>
                        {" "}
                        <span className="font-medium">
                          Distance From Start:
                        </span>
                        {fuelData?.distance_from_start} km
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No available fuel stops</p>
                )}
              </AccordionSection>

              <AccordionSection
                title="Water Alerts"
                isOpen={expandedSections["water-recent"]}
                onClick={() => toggleSection("water-recent")}
              >
                {recentTrip?.water_alerts?.length > 0 ? (
                  recentTrip.water_alerts.map((waterAlert, idx) => {
                    return (
                      <div key={idx} className="p-2 ">
                        <p className="font-medium">Alert {idx + 1}</p>
                        <p>Level: {waterAlert?.alert_level}</p>
                        <p>Location: {waterAlert?.location}</p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500">No available water alerts</p>
                )}
              </AccordionSection>
            </div>
          ) : (
            <div className="flex flex-col items-center h-[200px] justify-center text-gray-500">
              <img
                src="https://cdn-icons-png.flaticon.com/512/2954/2954027.png"
                alt="No trips"
                className="w-12 h-12 opacity-50"
              />
              <p className="mt-2">No Trips in History</p>
            </div>
          )}
        </div>
      )}
      {activeTab === "history" && (
        <div className="px-1 overflow-y-auto max-h-[400px]">
          {loading ? (
            <p className="text-center mt-10">Loading...</p>
          ) : routes?.length > 0 ? (
            routes.map((route, index) => (
              <div key={index} className="p-4 border-b border-gray-200">
                <h1 className="text-lg font-semibold mb-1">Trip {index + 1}</h1>
                <p className="text-gray-700">
                  <span className="font-medium">Miles:</span>{" "}
                  {route?.total_miles?.toFixed(2)}mi
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Pickup Address:</span>{" "}
                  {route?.pickup_address}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Dropoff address:</span>{" "}
                  {route?.dropoff_address}
                </p>

                {/* Accordion Sections */}
                <AccordionSection
                  title="Available Routes"
                  isOpen={expandedSections[`routes-${index}`]}
                  onClick={() => toggleSection(`routes-${index}`)}
                >
                  {route.available_routes?.length > 0 ? (
                    route.available_routes.map((routeData, idx) => (
                      <div key={idx} className="p-2 ">
                        <h1 className="font-medium">Route {idx + 1}</h1>
                        <p>
                          Duration:{" "}
                          {formatDuration(routeData.duration.toFixed(2))}
                        </p>
                        <p>Distance: {routeData.distance.toFixed(2)} km</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No available routes</p>
                  )}
                </AccordionSection>

                <AccordionSection
                  title="Fuel Stops"
                  isOpen={expandedSections[`fuel-${index}`]}
                  onClick={() => toggleSection(`fuel-${index}`)}
                >
                  {route?.fuel_stops?.length > 0 ? (
                    route.fuel_stops.map((fuelData, idx) => (
                      <div key={idx} className="p-2 ">
                        <p className="font-medium">Fuel Stop {idx + 1}</p>
                        <p>
                          <span className="font-medium">Location:</span>{" "}
                          {fuelData?.location}
                        </p>
                        <p>
                          {" "}
                          <span className="font-medium">
                            Distance From Start:
                          </span>
                          {fuelData?.distance_from_start} km
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No available fuel stops</p>
                  )}
                </AccordionSection>

                <AccordionSection
                  title="Water Alerts"
                  isOpen={expandedSections[`water-${index}`]}
                  onClick={() => toggleSection(`water-${index}`)}
                >
                  {route?.water_alerts?.length > 0 ? (
                    route.water_alerts.map((waterAlert, idx) => {
                      return (
                        <div key={idx} className="p-2 ">
                          <p className="font-medium">Alert {idx + 1}</p>
                          <p>Level: {waterAlert?.alert_level}</p>
                          <p>Location: {waterAlert?.location}</p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500">No available water alerts</p>
                  )}
                </AccordionSection>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center h-[200px] justify-center text-gray-500">
              <img
                src="https://cdn-icons-png.flaticon.com/512/2954/2954027.png"
                alt="No trips"
                className="w-12 h-12 opacity-50"
              />
              <p className="mt-2">No Trips in History</p>
            </div>
          )}
        </div>
      )}
      {showPopup && <Modal showPopup={showPopup} setShowPopup={setShowPopup} />}
    </div>
  );
};

// Reusable Accordion Section
const AccordionSection = ({ title, isOpen, onClick, children }) => (
  <div className="mt-3">
    <button
      className="flex  items-center justify-between w-full px-3 py-2 text-[#008080] font-semibold bg-gray-100 rounded-lg hover:bg-gray-200 mb-2"
      onClick={onClick}
    >
      {title}
      <FaChevronDown
        className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
      />
    </button>
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
      className="overflow-hidden"
    >
      {isOpen && (
        <div className="p-3 bg-white border border-[#008080] rounded-md shadow-md">
          {children}
        </div>
      )}
    </motion.div>
  </div>
);

export default SearchLocationBar;
