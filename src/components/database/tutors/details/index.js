import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import convertTime from "../../../../functions/functions/convertTime";

function TutorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tutorData, setTutorData] = useState({});
  const [isDeleteMessageOpen, setIsDeleteMessageOpen] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5002/api/tutors/${id}`)
      .then((response) => response.json())
      .then((data) => setTutorData(data))
      .catch((err) => console.error('Error fetching tutor:', err));
  }, [id]);

  const toggleDeleteMessage = () => {
    if (isDeleteMessageOpen) {
      setIsDeleteMessageOpen(false);
    } else {
      setIsDeleteMessageOpen(true);
    }
  };

  const handleDelete = () => {
    fetch(`http://localhost:5002/api/tutors/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to delete tutor');
        }
        return response.json();
      })
      .then((data) => {
        console.log(data.message);
        navigate('/database/tutors');
      })
      .catch((error) => {
        console.error('Error deleting tutor:', error);
      });
  };

  const { tutor, preferences, availability } = tutorData;

  if (!tutor) {
    return <div></div>;
  }

  return (
    <div className="data-container">
      <h3 className="header">{tutor.first_name} {tutor.last_name}</h3>
      <div className="details-container">
        <div className="details">
          <div className="info-and-buttons-container">
            <div className="info">
              <div className="name-details-group">
                <h4 className="name-details-label">Name</h4>
                <div className="info-container">
                  <div className="details-name-container">
                    <p>{tutor.first_name}</p>
                    <p>{tutor.last_name}</p>
                  </div>
                </div>
              </div>
              <div className="contact-details-group">
                <h4 className="contact-details-label">Contact</h4>
                <div className="info-container">
                  <div className="details-contact-container">
                    <p>{tutor.email}</p>
                    <p>{tutor.phone}</p>
                  </div>
                </div>
              </div>
              <h4 className="levels-details-label">Preferences</h4>
              <div className="levels-list-container">
                <ul className="levels-list">
                  {preferences && Object.entries(preferences).slice(2).map(([key, value]) => {
                    if (value) {
                      return (<li key={key}>{key.replace('_', ' ')}</li>);
                    } else {
                      return null;
                    }
                  })}
                </ul>
              </div>
              <h4 className="details-label">Availability</h4>
              <div className="availability-list-container">
                <ul className="availability-list">
                  {availability &&
                    availability.map((slot, index) => (
                      <li key={index}>
                        <span className="day-label">
                          {slot.day.charAt(0).toUpperCase() + slot.day.slice(1)}
                        </span>
                        <div className="time-box-container">
                          <div className="time-box">{convertTime(slot.start_time)}</div>
                          <div className="time-box">{convertTime(slot.end_time)}</div>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
            <div className="buttons-container">
              <div className="match-and-edit-buttons">
                <button className="edit-button" onClick={() => navigate(`/database/tutors/edit/${id}`)}>Edit</button>
                <button className="match-button" onClick={() => navigate(`/database/tutors/match/${id}`)}>Match</button>
              </div>
              {isDeleteMessageOpen && (
                <div className="delete-message">
                  <p className="delete-message-text">Are you sure you want to delete this tutor?</p>
                  <button className="yes-delete-button" onClick={handleDelete}>Yes</button>
                  <button className="no-delete-button" onClick={toggleDeleteMessage}>No</button>
                </div>
              )}
              <button className="delete-button" onClick={toggleDeleteMessage}>Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorDetails;
