import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";

interface TripData {
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  cycle_hours: string;
}

interface LocationSuggestion {
  name: string;
  lat: number;
  lon: number;
}

export default function TruckingApp({
  setShowPopup,
}: {
  setShowPopup: (value: boolean) => void;
}) {
  const [tripData, setTripData] = useState<TripData>({
    current_location: "",
    pickup_location: "",
    dropoff_location: "",
    cycle_hours: "",
  });

  const [loadingLocation, setLoadingLocation] = useState<boolean>(true);
  const [pickupSuggestions, setPickupSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<
    LocationSuggestion[]
  >([]);

  const fetchAddress = async (lat: number, lon: number): Promise<string> => {
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      return res.data.display_name;
    } catch (error) {
      console.error("Error fetching address:", error);
      return "Unknown Location";
    }
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const address = await fetchAddress(latitude, longitude);
          setTripData((prev) => ({
            ...prev,
            current_location: address,
          }));
          setLoadingLocation(false);
        },
        () => {
          console.warn("User denied location access");
          setLoadingLocation(false);
        }
      );
    } else {
      console.warn("Geolocation not available");
      setLoadingLocation(false);
    }
  }, []);

  const fetchLocationSuggestions = async (
    query: string,
    type: "pickup" | "dropoff"
  ) => {
    if (!query || query.length < 3) {
      type === "pickup" ? setPickupSuggestions([]) : setDropoffSuggestions([]);
      return;
    }

    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
      );
      const suggestions: LocationSuggestion[] = res.data.map((place: any) => ({
        name: place.display_name,
        lat: parseFloat(place.lat),
        lon: parseFloat(place.lon),
      }));

      if (type === "pickup") {
        setPickupSuggestions(suggestions);
      } else {
        setDropoffSuggestions(suggestions);
      }
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTripData((prev) => ({ ...prev, [name]: value }));

    if (name === "pickup_location") {
      fetchLocationSuggestions(value, "pickup");
    } else if (name === "dropoff_location") {
      fetchLocationSuggestions(value, "dropoff");
    }
  };

  const handleLocationSelect = (
    location: LocationSuggestion,
    type: "pickup_location" | "dropoff_location"
  ) => {
    setTripData((prev) => ({
      ...prev,
      [type]: location.name,
    }));

    if (type === "pickup_location") {
      setPickupSuggestions([]);
    } else {
      setDropoffSuggestions([]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log("Submitting Trip Data:", tripData);
    try {
      await axios.post("http://127.0.0.1:8000/api/trips/", tripData);
      setShowPopup(false);
    } catch (error) {
      console.error("Error submitting trip:", error);
    }
  };

  return (
    <div className="mx-auto w-full space-y-6">
      <div className="bg-gray-50/75 rounded-lg w-full p-6">
        <h2 className="text-xl font-semibold">Enter Trip Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <input
            type="text"
            name="current_location"
            placeholder="Current Location"
            className="w-full border p-2"
            value={
              loadingLocation
                ? "Fetching location..."
                : tripData.current_location
            }
            readOnly
          />

          {/* Pickup Location with Suggestions */}
          <div className="relative">
            <input
              type="text"
              name="pickup_location"
              placeholder="Pickup Location"
              className="w-full border p-2"
              value={tripData.pickup_location}
              onChange={handleChange}
            />
            {pickupSuggestions.length > 0 && (
              <ul className="absolute bg-white shadow-md w-full z-10">
                {pickupSuggestions.map((place, index) => (
                  <li
                    key={index}
                    className="p-2 hover:bg-gray-200 cursor-pointer"
                    onClick={() =>
                      handleLocationSelect(place, "pickup_location")
                    }
                  >
                    {place.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              name="dropoff_location"
              placeholder="Dropoff Location"
              className="w-full border p-2"
              value={tripData.dropoff_location}
              onChange={handleChange}
            />
            {dropoffSuggestions.length > 0 && (
              <ul className="absolute bg-white shadow-md w-full z-10">
                {dropoffSuggestions.map((place, index) => (
                  <li
                    key={index}
                    className="p-2 hover:bg-gray-200 cursor-pointer"
                    onClick={() =>
                      handleLocationSelect(place, "dropoff_location")
                    }
                  >
                    {place.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <input
            type="number"
            name="cycle_hours"
            placeholder="Current Cycle Hours"
            className="w-full border p-2"
            value={tripData.cycle_hours}
            onChange={handleChange}
            required
          />

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setShowPopup(false)}
              className="w-full bg-gray-500 text-white p-2 rounded-lg cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-700 cursor-pointer transition"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
