import './Home.css';
import UserNavbar from '../../components/navbar/UserNavbar';
import { useNavigate } from 'react-router-dom';  

export default function Home() {
  const userEmail = 'user@example.com';

  const handleLogout = () => {
    console.log('User logged out');
  };

  const textOptions = [
    { label: 'Queries', path: '/queries' },
    { label: 'Insert', path: '/insert' },
    { label: 'Updates', path: '/updates' },
  ]; 

  const handleOptionClick = (path) => {
    navigate(path); // Ανακατεύθυνση στη συγκεκριμένη διαδρομή
  };

  const navigate = useNavigate(); // Hook για ανακατεύθυνση

  return (
    <div className='home'>
      <UserNavbar userEmail={userEmail} onLogout={handleLogout} /> {/* Navbar */}
      <div className='homeWrapper'>
        <div className='homeText'>
          <span>Welcome to the homepage!</span>
          <h3>Please select one of the options below:</h3>
        </div>
        <div className='homeOptions'>
          {textOptions.map((option, index) => (
            <div key={index} className='circleOption' onClick={() => handleOptionClick(option.path)}>
              <span className='circleText'>{option.label}</span> {/* Πρόσθεση className στο span */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
