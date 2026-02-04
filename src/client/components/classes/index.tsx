import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

// import { exampleFetchLearners, exampleAddLearnerToClass, exampleRemoveLearnerFromClass } from "../../../data/data_access/ExampleLearnerService";
import { fetchLearners, addLearnerToClass, removeLearnerFromClass } from "../../../data/data_access/LearnerService";

import { Learner } from "../../../data/data_objects/Learner";

import "./index.css";

function Class() {
  const location = useLocation();
  const pathParts = location.pathname.split("/");
  const id = pathParts[pathParts.length - 1];
  const [learners, setLearners] = useState<Learner[]>([]);
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  useEffect(() => {
    const getLearners = async () => {
      try {
        const data = await fetchLearners();
        setLearners(data);
      } catch (err) {
        console.error("Failed to fetch learners:", err);
      }
    };
    getLearners();
  }, []);

  const toggleSelect = () => {
    setIsSelectOpen(!isSelectOpen);
  };

  const handleSelectChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const learnerId = e.target.value;
    if (!learnerId) return;
    try {
      await addLearnerToClass(learnerId, id);
      setLearners((prev) =>
        prev.map((l) =>
          l.id === learnerId ? { ...l, class: id } : l
        )
      );
      setIsSelectOpen(false);
    } catch (err) {
      console.error("Error adding learner to class:", err);
    }
  };

  const removeLearner = async (learnerId: string) => {
    try {
      await removeLearnerFromClass(learnerId);
      setLearners((prev) =>
        prev.map((l) =>
          l.id === learnerId ? { ...l, class: "" } : l
        )
      );
    } catch (err) {
      console.error("Error removing learner from class:", err);
    }
  };

  const filterLearners = () => {
    return learners.filter(learner => learner.class === id);
  };

  const filteredLearners = filterLearners();

  return (
    <div className="data-container">
      <h3 className="header">{"Class " + id}</h3>
      <div className="add-container">
        <button onClick={toggleSelect}>Add Learner</button>
        {isSelectOpen && (
          <div>
            <select onChange={(handleSelectChange)}>
              <option value="">Select Learner</option>
              {learners
                .slice()
                .sort((a, b) => a.first_name.localeCompare(b.first_name))
                .map(learner => (
                  <option key={learner.id} value={learner.id}>
                    {learner.first_name} {learner.last_name}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>
      <div className="filters-and-list-container">
        <div className="list-container">
          <ul className="conversation-list">
            {filteredLearners.map(learner => (
              <li key={learner.id} className="learner-item">
                <Link to={`/database/learners/${learner.id}`}>
                  {learner.first_name} {learner.last_name}
                </Link>
                <button
                  onClick={() => removeLearner(learner.id)}
                  className="remove-button">Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Class;