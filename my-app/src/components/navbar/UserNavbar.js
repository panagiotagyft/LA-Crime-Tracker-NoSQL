import "./UserNavbar.css";
import { Navbar, Nav, Button } from 'react-bootstrap';
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";
import { useNavigate } from "react-router-dom";

const UserNavbar = () => {
  const { currentUser, logout } = useContext(AuthContext); // Λήψη του context
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Εκτέλεση της λειτουργίας logout
    navigate("/login"); // Ανακατεύθυνση στη σελίδα login
  };

  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand href="/home">
        <HomeOutlinedIcon />
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse className="justify-content-end">
        <Nav>
          <Nav.Item className="mr-3">
            <span className="navbar-text">{currentUser?.username || "Guest"}</span>
          </Nav.Item>
          <Nav.Item>
            <Button variant="outline-danger" onClick={handleLogout}>
              Logout
            </Button>
          </Nav.Item>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default UserNavbar;
