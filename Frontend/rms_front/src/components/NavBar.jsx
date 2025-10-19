import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
export default function Navbar() {
   const navigate = useNavigate();

   const handleLogout = () => {
    // Remove authentication flag
    localStorage.removeItem("isLoggedIn");

    // Redirect to login page
    navigate("/login");
  };

  return (
    <nav className="bg-red-800 text-white px-6 py-3 flex justify-between items-center shadow-md">

      <li className="list-none">
          <button className="flex items-center focus:outline-none">
            <img
              src="/path-to-your-profile.jpg" // replace with your actual profile image path
              alt="Profile"
              className="w-9 h-9 rounded-full border-2 border-yellow-300"
            />
          </button>
        </li>
     

      {/* Navigation Links */}
      <ul className="flex items-center space-x-6">
        {[
            { to: "/", label: "Home" },
            { to: "/dropping", label: "Dropping" },
            { to: "/product", label: "Inventory" },
            { to: "/profile", label: "Profile" },
        ].map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className="text-sm font-medium hover:text-yellow-300 transition-colors"
            >
              {item.label}
            </Link>
          </li>
        ))}
         <button
            onClick={handleLogout}
            className="text-sm font-medium hover:text-yellow-300 transition-colors"
          >
            Logout
          </button>
      </ul>
    </nav>
  );
}
