import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import convertTime from "../../../../functions/convertTime";

import { exampleFetchTutorById, exampleDeleteTutor } from "../../../../../data/data_access/ExampleTutorService";

import { Tutor } from "../../../../../data/data_objects/Tutor";

function TutorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState<Tutor | null>();
  const [isDeleteMessageOpen, setIsDeleteMessageOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    exampleFetchTutorById(id)
      .then((data) => setTutor(data))
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
      await exampleDeleteTutor(id);
      alert("Tutor deleted successfully.");
      navigate("/database/tutors");
    } catch (err) {
      console.error("Error deleting tutor:", err);
      alert("Failed to delete tutor.");
    }
  };

  if (!tutor) {
    return <div>Loading...</div>;
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
              <div className="details-group">
                <h4 className="details-label">Gender</h4>
                <div className="info-container">
                  <div className="details-container">
                    <p>{tutor.gender}</p>
                  </div>
                </div>
              </div>
              <h4 className="levels-details-label">Preferences</h4>
              <div className="levels-list-container">
                <ul className="levels-list">
                  {tutor.preferences &&
                    Object.entries(tutor.preferences)
                      .filter(([key, value]) => value)
                      .map(([key]) => (
                        <li key={key}>{key.replace(/_/g, " ")}</li>
                      ))}
                </ul>
              </div>
              <div className="details-group">
                <h4 className="details-label">Availability</h4>
                <div className="info-container">
                  <div className="details-container">
                    <p>{"(" + tutor.first_name + (tutor.available ? " is available" : " is matched") + ")"}</p>
                  </div>
                </div>
              </div>
              <div className="availability-list-container">
                <ul className="availability-list">
                  {Object.entries(tutor.availability)
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
            </div>
            <div className="buttons-container">
              <div className="match-and-edit-buttons">
                <button className="edit-button" onClick={() => navigate(`/database/tutors/edit/${id}`)}>Edit</button>
                {tutor.available &&
                  <button className="match-button" onClick={() => navigate(`/database/tutors/match/${id}`)}>Match</button>
                }
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
