import { Link, useNavigate } from 'react-router-dom'; 
import { useDispatch } from 'react-redux';          
import { logoutUser } from "../slicers/authslice";   

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap(); 
      navigate('/login');                    
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <nav>
      <Link to="/announcements">Zcode</Link>
      <Link to="/problems">Problems</Link>
      <Link to="/standings">Standings</Link>
      <Link to="/solutions">Solutions</Link>
      <Link to="/userRank">Elo</Link>

      <div className="dropdown">
        <button>Alex Carter ▾</button>
        <ul>
          <li><Link to="/userprofile">Profile</Link></li>
          <li><Link to="/admin">Admin</Link></li>
          <li><button onClick={handleLogout}>Logout</button></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;