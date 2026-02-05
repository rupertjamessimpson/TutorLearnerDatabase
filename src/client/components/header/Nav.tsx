import React from "react";
import { useLocation, Link, NavLink, useNavigate } from 'react-router-dom';
import { logout } from "../../../firebase/firebase";
import '../../../App.css';

function Nav() {
  const location = useLocation();
  const navigate = useNavigate();

  const inDatabase = location.pathname.startsWith('/database');
  const inForms = location.pathname.startsWith('/forms');
  const inClass = location.pathname.startsWith('/class');

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="nav-container">
      <div className="nav-and-logout-container">
        <div className="top-nav-container">
          <NavLink 
            to="/database"
            className={({ isActive }) => isActive ? 'nav-button active' : 'nav-button'}>
              Database
          </NavLink>
          <NavLink
            to="/forms"
            className={({ isActive }) => isActive ? 'nav-button active' : 'nav-button'}>
              Forms
          </NavLink>
          <NavLink
            to="/class"
            className={({ isActive }) => isActive ? 'nav-button active' : 'nav-button'}>
              Classes
          </NavLink>
        </div>
        <div className="top-nav-container">
          <button
            onClick={handleLogout}
            className="logout-button"
          >
            Logout
          </button>
        </div>
      </div>
      {inDatabase && (
        <div className="sub-nav-container">
            <Link to="/database/tutors" className="sub-nav-button">Tutors</Link>
            <Link to="/database/learners" className="sub-nav-button">Learners</Link>
            <Link to="/database/matches" className="sub-nav-button">Matches</Link>
        </div>)}
      {inForms && (
        <div className="sub-nav-container">
            <Link to="/forms/tutor" className="sub-nav-button">Tutor</Link>
            <Link to="/forms/learner" className="sub-nav-button">Learner</Link>
            <Link to="/forms/csv" className="sub-nav-button">CSV Upload</Link>
        </div>)}
      {inClass && (
        <div className="sub-nav-container">
            <Link to="/class/1" className="sub-nav-button">1</Link>
            <Link to="/class/2" className="sub-nav-button">2</Link>
            <Link to="/class/3" className="sub-nav-button">3</Link>
            <Link to="/class/4" className="sub-nav-button">4</Link>
            <Link to="/class/5" className="sub-nav-button">5</Link>
            <Link to="/class/6" className="sub-nav-button">6</Link>
        </div>)}
    </div>
  );
}

export default Nav;
