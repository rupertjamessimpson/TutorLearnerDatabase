import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import convertTime from "../../../../functions/convertTime";

function LearnerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [learnerData, setLearnerData] = useState({});
  const [isDeleteMessageOpen, setIsDeleteMessageOpen] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5002/api/learners/${id}`)
      .then((response) => response.json())
      .then((data) => setLearnerData(data))
      .catch((err) => console.error('Error fetching learner:', err));
  }, [id]);

  const toggleDeleteMessage = () => {
    if (isDeleteMessageOpen) {
      setIsDeleteMessageOpen(false);
    } else {
      setIsDeleteMessageOpen(true);
    }
  };

  const handleDelete = () => {
    fetch(`http://localhost:5002/api/learners/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to delete learner');
        }
        return response.json();
      })
      .then((data) => {
        console.log(data.message);
        navigate('/database/learners');
      })
      .catch((error) => {
        console.error('Error deleting learner:', error);
      });
  };

  const { learner, availability } = learnerData;

  if (!learner) {
    return <div></div>;
  }

  return (
    <div className="data-container">
      <h3 className="header">{learner.first_name} {learner.last_name}</h3>
      <div className="details-container">
        <div className="details">
          <div className="info-and-buttons-container">
            <div className="info">
              <div className="name-details-group">
                <h4 className="name-details-label">Name</h4>
                <div className="info-container">
                  <div className="details-name-container">
                    <p>{learner.first_name}</p>
                    <p>{learner.last_name}</p>
                  </div>
                </div>
              </div>
              <div className="contact-details-group">
                <h4 className="contact-details-label">Contact</h4>
                <div className="info-container">
                  <div className="details-contact-container">
                    <p>{learner.email}</p>
                    <p>{learner.phone}</p>
                  </div>
                </div>
              </div>
              <h4 className="levels-details-label">Level</h4>
              <div className="levels-list-container">
                <ul className="levels-list">
                  <li>{learner.level.replace(/_/g, ' ')}</li>
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
                <button className="edit-button"onClick={() => navigate(`/database/learners/edit/${id}`)}>Edit</button>
              </div>
              {isDeleteMessageOpen && (
                <div className="delete-message">
                  <p className="delete-message-text">Are you sure you want to delete this learner?</p>
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

export default LearnerDetails;