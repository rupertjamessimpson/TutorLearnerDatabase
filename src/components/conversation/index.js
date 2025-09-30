import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

import "./index.css";

function Conversation() {
  const location = useLocation();
  const pathParts = location.pathname.split("/");
  const id = pathParts[pathParts.length - 1];
  const [learners, setLearners] = useState([]);
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5002/api/learners")
      .then((response) => response.json())
      .then((data) => setLearners(data))
      .catch((err) => console.error('Error fetching learners:', err));
  }, []);

  const toggleSelect = () => {
    setIsSelectOpen(!isSelectOpen);
  };

  const handleSelectChange = (event) => {
    const learnerId = event.target.value;
  
    fetch('http://localhost:5002/api/learners/update-conversation', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ learnerId, conversationId: id }),
    })
      .then((response) => response.json())
      .then((updatedLearner) => {
        console.log('Learner added to conversation:', updatedLearner);
        setIsSelectOpen(false);
  
        setLearners((prevLearners) =>
          prevLearners.map(learner =>
            learner.learner_id === updatedLearner.learner_id
              ? updatedLearner
              : learner
          )
        );
      })
      .catch((err) => console.error('Error updating learner:', err));
  };

  const removeLearner = (learnerId) => {
    fetch('http://localhost:5002/api/learners/remove-conversation', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ learnerId }),
    })
      .then((response) => response.json())
      .then((updatedLearner) => {
        console.log('Learner removed from conversation:', updatedLearner);
  
        setLearners((prevLearners) =>
          prevLearners.map(learner =>
            learner.learner_id === updatedLearner.learner_id
              ? updatedLearner
              : learner
          )
        );
      })
      .catch((err) => console.error('Error removing learner:', err));
  };

  const filterLearners = () => {
    return learners.filter(learner => learner.conversation === parseInt(id));
  };

  const filteredLearners = filterLearners();

  return (
    <div className="data-container">
      <h3 className="header">{"Conversation " + id}</h3>
      <div className="add-container">
        <button onClick={toggleSelect}>Add Learner</button>
        {isSelectOpen && (
          <div>
            <select onChange={handleSelectChange}>
              <option value="">Select Learner</option>
              {learners
                .slice()
                .sort((a, b) => a.first_name.localeCompare(b.first_name))
                .map(learner => (
                  <option key={learner.learner_id} value={learner.learner_id}>
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
              <li key={learner.learner_id} className="learner-item">
                <Link to={`/database/learners/${learner.learner_id}`}>
                  {learner.first_name} {learner.last_name}
                </Link>
                <button
                  onClick={() => removeLearner(learner.learner_id)}
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

export default Conversation;