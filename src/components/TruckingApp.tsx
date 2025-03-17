import { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { MdMyLocation } from "react-icons/md";
import { toast } from "sonner";
import { serverUrl } from "../config/urlConfig";
import { Trip } from "../types";
import { FaSpinner } from "react-icons/fa";
import { useRoutes } from "../contexts/RouteContext";

interface LocationSuggestion {
  name: string;
  lat: number;
  lon: number;
}

interface TripData {
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  cycle_hours: string;
}

export default function TruckingApp({
  setShowPopup,
  setRecentTrip,
}: {
  setShowPopup: (value: boolean) => void;
  setRecentTrip: (value: Trip) => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TripData>({
    mode: "onChange",
    defaultValues: {},
  });
  const [loading, setLoading] = useState(false);

  const [loadingLocation, setLoadingLocation] = useState<boolean>(true);
  const [locationDenied, setLocationDenied] = useState<boolean>(false);
  const [currentCoords, setCurrentCoords] = useState<string>("");
  const [pickupCoords, setPickupCoords] = useState<string>("");
  const [dropoffCoords, setDropoffCoords] = useState<string>("");
  const { setRoutes, setSelectedRoute } = useRoutes();

  const [pickupSuggestions, setPickupSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<
    LocationSuggestion[]
  >([]);

  const [loadingPickup, setLoadingPickup] = useState<boolean>(false);
  const [loadingDropoff, setLoadingDropoff] = useState<boolean>(false);

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
          setValue("current_location", address);
          setCurrentCoords(`${latitude},${longitude}`);
          setLoadingLocation(false);
        },
        () => {
          console.warn("User denied location access");
          setLoadingLocation(false);
          setLocationDenied(true);
        }
      );
    } else {
      console.warn("Geolocation not available");
      setLoadingLocation(false);
    }
  }, [setValue]);

  const requestLocationAccess = () => {
    if (locationDenied) {
      toast.error("Please provide location access");
      return;
    }
    setLoadingLocation(true);
    setLocationDenied(false);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const address = await fetchAddress(latitude, longitude);
        setValue("current_location", address);
        setLoadingLocation(false);
      },
      () => {
        console.warn("User denied location access");
        setLoadingLocation(false);
        setLocationDenied(true);
      }
    );
  };

  const fetchLocationSuggestions = async (query: string, type: string) => {
    if (!query || query.length < 3) {
      if (type === "pickup") {
        setPickupSuggestions([]);
      } else {
        setDropoffSuggestions([]);
      }
      return;
    }

    if (type === "pickup") {
      setLoadingPickup(true);
    } else {
      setLoadingDropoff(true);
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
        setLoadingPickup(false);
      } else {
        setDropoffSuggestions(suggestions);
        setLoadingDropoff(false);
      }
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
      setLoadingPickup(false);
      setLoadingDropoff(false);
    }
  };

  const handleLocationSelect = (
    location: LocationSuggestion,
    type: "pickup_location" | "dropoff_location"
  ) => {
    setValue(type, location.name);

    if (type === "pickup_location") {
      setPickupCoords(`${location.lat},${location.lon}`);
      setPickupSuggestions([]);
    } else {
      setDropoffSuggestions([]);
      setDropoffCoords(`${location.lat},${location.lon}`);
    }
  };

  const onSubmit = async (data: TripData) => {
    if (
      !currentCoords ||
      !pickupCoords ||
      !dropoffCoords ||
      !data.cycle_hours
    ) {
      toast.error("All fields are required");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${serverUrl}/trips/new/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_location: currentCoords,
          pickup_location: pickupCoords,
          dropoff_location: dropoffCoords,
          cycle_hours: parseInt(data.cycle_hours),
        }),
      });

      const result = await response.json();
      setRecentTrip(result);
      if (!response.ok) {
        alert(result?.error);
        return;
      }
      if (result.routes?.length > 0) {
        setRoutes(result.routes);
        const shortestRouteIndex = result.routes.findIndex(
          (route: any) =>
            route.distance ===
            Math.min(...result.routes.map((r: any) => r.distance))
        );
        setSelectedRoute(shortestRouteIndex);
      }
      setShowPopup(false);
    } catch (error) {
      console.error("Error submitting trip:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full text-sm space-y-6">
      <div className="bg-gray-50/75 rounded-lg w-full p-6">
        <h2 className="text-xl font-semibold">Enter Trip Details</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="">
            <div className="w-full flex items-center space-x-2">
              <input
                type="text"
                placeholder="Current Location"
                className="w-full border p-2 rounded-md "
                value={
                  loadingLocation
                    ? "Fetching location..."
                    : watch("current_location")
                }
                readOnly
                {...register("current_location", {
                  required: "Current location is required",
                })}
              />
              {locationDenied && (
                <div className="cursor-pointer">
                  <MdMyLocation onClick={requestLocationAccess} />
                </div>
              )}
            </div>

            {errors.current_location && (
              <p className="text-red-500">{errors.current_location.message}</p>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Pickup Location"
              className="w-full border p-2 rounded-md "
              {...register("pickup_location", {
                required: "Pickup location is required",
              })}
              onChange={(e) =>
                fetchLocationSuggestions(e.target.value, "pickup")
              }
            />
            {errors.pickup_location && (
              <p className="text-red-500">{errors.pickup_location.message}</p>
            )}

            <ul className="absolute bg-white shadow-md w-full z-10">
              {loadingPickup ? (
                <p className="text-sm text-center py-3">Loading...</p>
              ) : (
                <div>
                  {pickupSuggestions.length > 0 &&
                    pickupSuggestions.map((place, index) => (
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
                </div>
              )}
            </ul>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Dropoff Location"
              className="w-full border p-2 rounded-md "
              {...register("dropoff_location", {
                required: "Dropoff location is required",
              })}
              onChange={(e) =>
                fetchLocationSuggestions(e.target.value, "dropoff")
              }
            />
            {errors.dropoff_location && (
              <p className="text-red-500">{errors.dropoff_location.message}</p>
            )}
            <ul className="absolute bg-white shadow-md w-full z-10">
              {loadingDropoff ? (
                <p className="text-sm text-center py-3">Loading...</p>
              ) : (
                <div>
                  {dropoffSuggestions.length > 0 &&
                    dropoffSuggestions.map((place, index) => (
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
                </div>
              )}
            </ul>
          </div>
          <div>
            <input
              type="text"
              placeholder="Current Cycle Hours"
              className="w-full border p-2 rounded-md"
              {...register("cycle_hours", {
                required: "Cycle Hours is required",
                pattern: {
                  value: /^[0-9]+$/,
                  message: "Only numbers are allowed",
                },
                validate: (value) => {
                  const num = Number(value);
                  if (isNaN(num)) return "Invalid number";
                  if (num < 0) return "Minimum value is 0";
                  if (num > 70) return "Maximum value is 70";
                  return true;
                },
              })}
            />
            {errors?.cycle_hours && (
              <p className="text-red-500">{errors?.cycle_hours?.message}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              disabled={loading}
              onClick={() => setShowPopup(false)}
              className="w-full cursor-pointer bg-zinc-500 text-white p-2 rounded-lg"
            >
              Cancle
            </button>
            <button
              disabled={loading}
              type="submit"
              className="w-full flex items-center justify-center gap-2 disabled:cursor-not-allowed cursor-pointer bg-[#008080] text-white p-2 rounded-lg"
            >
              {loading && <FaSpinner className=" animate-spin" />}
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
