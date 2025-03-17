import { useState } from "react";
import { FaUser, FaCog } from "react-icons/fa";
import { GoSidebarCollapse, GoSidebarExpand } from "react-icons/go";
import Map from "./Map";
import { ImMap2 } from "react-icons/im";
import { Trip } from "../types";
import SearchLocationBar from "./SearchLocationBar";

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [recentTrip, setRecentTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  return (
    <div className="flex">
      <div
        className={`bg-[#051830] text-white flex flex-col justify-between transition-all space-x-4 ${
          isExpanded ? "w-64" : "w-16 items-center"
        } h-[calc(100vh-80px)]`}
      >
        <ul className="mt-4 space-y-2 flex-1">
          <li className="flex items-center p-3 hover:bg-[#0a2a50] cursor-pointer">
            <ImMap2 size={20} />
            {isExpanded && <span className="ml-3">Map</span>}
          </li>
          <li className="flex items-center p-3 hover:bg-[#0a2a50] cursor-pointer">
            <FaUser size={20} />
            {isExpanded && <span className="ml-3">Profile</span>}
          </li>
          <li className="flex items-center p-3 hover:bg-[#0a2a50] cursor-pointer">
            <FaCog size={20} />
            {isExpanded && <span className="ml-3">Settings</span>}
          </li>
        </ul>

        <div className="p-3 flex justify-center border-t border-gray-600">
          <button
            className="text-white focus:outline-none cursor-pointer flex items-center space-x-2"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <GoSidebarCollapse size={20} />
            ) : (
              <GoSidebarExpand size={20} />
            )}
            {isExpanded && <span>Collapse</span>}
          </button>
        </div>
      </div>

      <div className="flex-1 flex w-full">
        <div>
          <SearchLocationBar
            recentTrip={recentTrip}
            setRecentTrip={setRecentTrip}
            loading={loading}
          />
        </div>

        <div className="flex-1 w-full">
          <Map setRecentTrip={setRecentTrip} setLoading={setLoading} />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
