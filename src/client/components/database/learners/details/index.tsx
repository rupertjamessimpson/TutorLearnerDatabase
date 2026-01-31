import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import convertTime from "../../../../functions/convertTime";

import { exampleFetchLearnerById, exampleDeleteLearner } from "../../../../../data/data_access/ExampleLearnerService";

import { Learner } from "../../../../../data/data_objects/Learner";

function LearnerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [learner, setLearner] = useState<Learner | null>();
  const [isDeleteMessageOpen, setIsDeleteMessageOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    exampleFetchLearnerById(id)
      .then((data) => setLearner(data))
      .catch((err) => console.error("Error fetching tutor:", err));
  }, [id]);


  const toggleDeleteMessage = () => {
    if (isDeleteMessageOpen) {
      setIsDeleteMessageOpen(false);
    } else {
      setIsDeleteMessageOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await exampleDeleteLearner(id);
      alert("Learner deleted successfully.");
      navigate("/database/learners");
    } catch (err) {
      console.error("Error deleting learner:", err);
      alert("Failed to delete learner.");
    }
  };

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
              <div className="details-group">
                <h4 className="details-label">Gender</h4>
                <div className="info-container">
                  <div className="details-gender-container">
                    <p>{learner.gender}</p>
                  </div>
                </div>
              </div>
              <div className="details-group">
                <h4 className="details-label">Level</h4>
                <div className="info-container">
                  <div className="details-gender-container">
                    <p>{learner.level.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>
              {learner.match &&
                <div className="details-group">
                  <h4 className="details-label">Match</h4>
                  <div className="info-container">
                    <div className="details-container">
                      <p>{learner.match}</p>
                    </div>
                  </div>
                </div>
              }
              {learner.notes &&
                <div className="details-group">
                  <h4 className="details-label">Notes</h4>
                  <div className="info-container">
                    <div className="details-container">
                      <p>{learner.notes}</p>
                    </div>
                  </div>
                </div>
              }
              <div className="details-group">
                <h4 className="details-label">Availability</h4>
                {learner.available ? 
                  <div className="availability-list-container">
                    <ul className="availability-list">
                      {Object.entries(learner.availability)
                        .filter(([, slot]) => slot.start_time && slot.end_time)
                        .map(([day, slot]) => (
                          <li key={day}>
                            <span className="day-label">
                              {day.charAt(0).toUpperCase() + day.slice(1)}
                            </span>
                            <div className="time-box-container">
                              <div className="time-box">{convertTime(slot.start_time)}</div>
                              <div className="time-box">{convertTime(slot.end_time)}</div>
                            </div>
                          </li>
                        ))}
                    </ul>
                  </div>
                  :
                  <div className="info-container">
                    <div className="details-container">
                      <p>unavailable</p>
                    </div>
                  </div>
                }
              </div>
            </div>
            <div className="buttons-container">
              <div className="match-and-edit-buttons">
                <button className="edit-button"onClick={() => navigate(`/database/learners/edit/${id}`)}>Edit</button>
                {(learner.available && !learner.match) &&
                  <button className="match-button" onClick={() => navigate(`/database/learners/match/${id}`)}>Match</button>
                }
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