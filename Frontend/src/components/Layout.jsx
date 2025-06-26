import { Outlet } from 'react-router';
import Header from './Header'; // Your new Header component
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { logoutUser } from '../authSlice'; // Adjust the path if needed

// This component defines the main structure for pages that need the header.
function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <Header user={user} onLogout={handleLogout} />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;