import { useState, useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router';
import { HiMenu, HiX } from 'react-icons/hi';

// Self-contained LeetCode logo SVG component
const LeetCodeLogo = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.728 10.152C19.728 8.411 18.66 7.46 16.92 7.46H12.9V16.5H17.02C18.73 16.5 19.728 15.54 19.728 13.8V10.152ZM9.85 5H6V19H9.85V5Z" fill="white"></path>
      <path d="M19.728 10.152C19.728 8.411 18.66 7.46 16.92 7.46H12.9V16.5H17.02C18.73 16.5 19.728 15.54 19.728 13.8V10.152Z" stroke="#FFC300" strokeWidth="1.5" strokeLinejoin="round"></path>
      <path d="M6 5H9.85V19H6V5Z" stroke="#FFC300" strokeWidth="1.5" strokeLinejoin="round"></path>
    </svg>
);

// Reusable NavItem for handling active/inactive link styles
const NavItem = ({ to, children }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative text-md font-medium transition-colors duration-200 ${
          isActive ? 'text-white' : 'text-gray-400 hover:text-white'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {children}
          {isActive && (
            <span className="absolute -bottom-[11px] left-0 right-0 h-[2px] bg-white rounded-full"></span>
          )}
        </>
      )}
    </NavLink>
);

// The main Header component
function Header({ user, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const navLinks = [
    { name: 'Problems', path: '/' },
    { name: 'Contest', path: '/contest' },
  ];

  const renderNavLinks = (isMobile = false) => (
    <div className={`flex items-center ${isMobile ? 'flex-col space-y-6' : 'space-x-6'}`}>
      {navLinks.map((link) => (
        <NavItem key={link.name} to={link.path}>{link.name}</NavItem>
      ))}
    </div>
  );

  return (
    <header className="bg-[#282828] text-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side: Logo and Desktop Navigation */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex-shrink-0">
              <LeetCodeLogo />
            </Link>
            <div className="hidden md:block">{renderNavLinks()}</div>
          </div>

          {/* Right Side: Profile, Premium, and Login */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <button className="px-3 py-1.5 text-md font-semibold text-[#FFC300] bg-[#3D3728] rounded-full hover:bg-opacity-80 transition-colors">
                  Premium
                </button>
                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                    <img className="h-8 w-8 rounded-full" src={user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}&background=6b7280&color=fff`} alt="User avatar" />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#282828] border border-neutral-700 rounded-md shadow-lg py-1">
                      <div className="px-4 py-2 text-sm text-neutral-300 border-b border-neutral-700">
                        <button className="font-semibold"><NavLink to="/dashboard">{user.firstName} {user.lastName}</NavLink></button>
                      </div>
                      {user.role === 'admin' && (
                         <Link to="/admin" className="block px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700">Admin Panel</Link>
                      )}
                      <button onClick={onLogout} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-neutral-700">
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <NavLink to="/login" className="text-sm text-gray-300 hover:text-white transition-colors">
                Sign In
              </NavLink>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-400 hover:text-white">
              {isMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#282828] border-t border-neutral-800">
          <div className="px-2 pt-4 pb-6 space-y-1 sm:px-3">
             {renderNavLinks(true)}
             <div className="pt-6 mt-6 border-t border-neutral-700">
                {user ? (
                    <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-4">
                            <img className="h-10 w-10 rounded-full" src={user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}&background=6b7280&color=fff`} alt="User avatar" />
                            <div>
                                <p className="font-semibold text-white">{user.firstName}</p>
                                <button onClick={onLogout} className="text-sm text-red-400">Logout</button>
                            </div>
                         </div>
                         <button className="px-3 py-1.5 text-sm font-semibold text-[#FFC300] bg-[#3D3728] rounded-full">
                            Premium
                         </button>
                    </div>
                ) : (
                    <NavLink to="/login" className="block text-center w-full py-2 bg-[#FFC300] text-neutral-900 rounded-md font-semibold">
                        Sign In
                    </NavLink>
                )}
             </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;