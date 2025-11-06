import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import convertTime from "../../../../functions/convertTime";

import { Tutor } from "../../../../../data/data_objects/Tutor";
import { Learner, Availability, DayAvailability } from "../../../../../data/data_objects/Learner";
import { exampleFetchTutorById } from "../../../../../data/data_access/examples/ExampleTutorService";
import { exampleFetchLearners } from "../../../../../data/data_access/examples/ExampleLearnerService";
import { exampleCreateMatch } from "../../../../../data/data_access/examples/ExampleMatchService";

function TutorMatch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState<Tutor>();
  const [learners, setLearners] = useState<Learner[]>([]);
  const [toggleSelect, setToggleSelect] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    exampleFetchTutorById(id)
      .then((data) => setTutor(data))
      .catch((err) => console.error("Error fetching tutor:", err));
  }, [id]);

  useEffect(() => {
    exampleFetchLearners()
      .then((data) => setLearners(data))
      .catch((err) => console.log("Failed to fetch learners:", err))
  }, []);

  const handleMatch = (learnerID: string) => {
    if (!tutor) return;

    const selectedLearner = learners.find((l) => l.id === learnerID);
    if (!selectedLearner) {
      console.error("Learner not found for match creation");
      return;
    }

    exampleCreateMatch(
      tutor.id,
      tutor.first_name,
      tutor.last_name,
      selectedLearner.id,
      selectedLearner.first_name,
      selectedLearner.last_name
    )
      .then((newMatch) => {
        console.log("✅ Match created:", newMatch);
        navigate("/database/matches");
      })
      .catch((err) => console.error("Error creating match:", err));
  };

  const filterLearners = () => {
    if (!tutor || !tutor.preferences) return [];

    const preferredLevels = Object.entries(tutor.preferences)
      .filter(([key, value]) => key !== "tutor_id" && value)
      .map(([key]) => key);

    return learners.filter(
      (learner) =>
        learner.available && preferredLevels.includes(learner.level)
    );
  };

  const getAllLearners = () =>
    learners.map((l) => ({
      learner_id: l.id,
      name: `${l.first_name} ${l.last_name}`,
      level: l.level,
      availability: l.availability,
    }));


  const filteredLearners = filterLearners();
  const allLearners = getAllLearners();

  return (
    <div className="data-container">
      <h3 className="header">
        {tutor ? `${tutor.first_name} ${tutor.last_name}` : 'Loading...'}
      </h3>
      <div className="learner-select-container">
        <div>
          <button className="filterButton" onClick={() => setToggleSelect(!toggleSelect)}>
            Choose Specific Learner
          </button>
          {toggleSelect && (
            <select onChange={(e) => {
              const selectedLearner = allLearners.find(l => l.name === e.target.value);
              if (selectedLearner) {
                handleMatch(selectedLearner.learner_id);
                setToggleSelect(false);
              }
            }}>
              <option value="">Select a Learner</option>
              {allLearners.map((learner) => (
                <option key={learner.name} value={learner.name}>
                  {learner.name} ({learner.level.replace('_', ' ')})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      <div className="filters-and-list-container">
        <div className="list-container">
          <ul className="list">
            {filteredLearners.map((learner) => (
              <li key={learner.first_name}>
                <div className="learner-match-name">
                  <strong>{learner.first_name} {learner.last_name} ({learner.gender})</strong>
                  <button className="match-match-button" onClick={() => handleMatch(learner.id)}>Match</button>
                </div>
                <ul>
                  {(Object.entries(learner.availability) as [keyof Availability, DayAvailability][]).map(([day, slot]) => (
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

export default TutorMatch;
