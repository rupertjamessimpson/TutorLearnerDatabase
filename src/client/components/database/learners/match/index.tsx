import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import convertTime from "../../../../functions/convertTime";
import { exampleFetchLearnerById } from "../../../../../data/data_access/ExampleLearnerService";
import { exampleFetchTutors } from "../../../../../data/data_access/ExampleTutorService";
import { exampleCreateMatch } from "../../../../../data/data_access/ExampleMatchService";

import { Tutor } from "../../../../../data/data_objects/Tutor";
import { Learner, Availability, DayAvailability } from "../../../../../data/data_objects/Learner";

function LearnerMatch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [learner, setLearner] = useState<Learner>();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [toggleSelect, setToggleSelect] = useState(false);

  useEffect(() => {
    if (!id) return;
    exampleFetchLearnerById(id)
      .then((data) => setLearner(data))
      .catch((err) => console.error("Error fetching learner:", err));
  }, [id]);

  useEffect(() => {
    exampleFetchTutors()
      .then((data) => setTutors(data))
      .catch((err) => console.error("Error fetching tutors:", err));
  }, []);

  const handleMatch = (tutorID: string) => {
    if (!learner) return;

    const selectedTutor = tutors.find((t) => t.id === tutorID);
    if (!selectedTutor) {
      console.error("Tutor not found for match creation");
      return;
    }

    exampleCreateMatch(
      selectedTutor.id,
      selectedTutor.first_name,
      selectedTutor.last_name,
      learner.id,
      learner.first_name,
      learner.last_name
    )
      .then((newMatch) => {
        console.log("Match created:", newMatch);
        navigate("/database/matches");
      })
      .catch((err) => console.error("Error creating match:", err));
  };

  const filterTutors = () => {
    if (!learner) return [];

    return tutors.filter(
      (tutor) =>
        tutor.available &&
        tutor.preferences &&
        tutor.preferences[learner.level as keyof typeof tutor.preferences]
    );
  };

  const getAllTutors = () =>
    tutors.map((t) => ({
      tutor_id: t.id,
      name: `${t.first_name} ${t.last_name}`,
      available: t.available,
      preferences: t.preferences,
      availability: t.availability,
    }));

  const filteredTutors = filterTutors();
  const allTutors = getAllTutors();
  const availableTutors = allTutors.filter((t) => t.available);

  return (
    <div className="data-container">
      <h3 className="header">
        {learner ? `${learner.first_name} ${learner.last_name}` : "Loading..."}
      </h3>

      <div className="learner-select-container">
        <div>
          <button
            className="filterButton"
            onClick={() => setToggleSelect(!toggleSelect)}
          >
            Choose Specific Tutor
          </button>
          {toggleSelect && (
            <select
              onChange={(e) => {
                const selectedTutor = allTutors.find(
                  (t) => t.name === e.target.value
                );
                if (selectedTutor) {
                  handleMatch(selectedTutor.tutor_id);
                  setToggleSelect(false);
                }
              }}
            >
              <option value="">Select a Tutor</option>
              {availableTutors.map((tutor) => (
                <option key={tutor.name} value={tutor.name}>
                  {tutor.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="filters-and-list-container">
        <div className="list-container">
          <ul className="list">
            {filteredTutors.map((tutor) => (
              <li key={tutor.id}>
                <div className="learner-match-name">
                  <strong>
                    {tutor.first_name} {tutor.last_name} ({tutor.gender})
                  </strong>
                  <button
                    className="match-match-button"
                    onClick={() => handleMatch(tutor.id)}
                  >
                    Match
                  </button>
                </div>
                <ul>
                  {(Object.entries(tutor.availability) as [
                    keyof Availability,
                    DayAvailability
                  ][])
                    .filter(([, slot]) => slot.start_time && slot.end_time)
                    .map(([day, slot]) => (
                      <li className="availability-item" key={day}>
                        <div>
                          {day.charAt(0).toUpperCase() + day.slice(1)}:{" "}
                          {convertTime(slot.start_time)} - {convertTime(slot.end_time)}
                        </div>
                      </li>
                    ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default LearnerMatch;
