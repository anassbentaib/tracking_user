import { useState, useRef, useEffect } from "react";
import { spotterlogo } from "../assets";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className="h-[80px] flex items-center justify-between px-6"
      style={{
        backgroundColor: "rgb(5, 24, 48)",
        borderBottom: "1px solid rgb(1, 99, 105)",
      }}
    >
      {/* Left Side - Logo */}
      <div>
        <img src={spotterlogo} className="h-14" />
      </div>

      {/* Right Side - User Icon */}
      <div className="relative">
        <div
          onClick={toggleMenu}
          className="w-8 h-8 cursor-pointer rounded-full bg-[#008080] text-white flex items-center justify-center text-sm"
        >
          AB
        </div>

        {isMenuOpen && (
          <div
            ref={menuRef}
            className="absolute user-menu text-sm right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 "
          >
            <ul>
              <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer">
                Profile
              </li>
              <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer">
                Settings
              </li>
              <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer">
                Logout
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
