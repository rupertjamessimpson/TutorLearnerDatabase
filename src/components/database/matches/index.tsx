import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Match from "../../../interfaces/Match";

import "../index.css";

function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // useEffect(() => {
  //   fetch(`http://localhost:5002/api/matches`)
  //     .then((response) => response.json())
  //     .then((data) => setMatches(data))
  //     .catch((err) => console.error(err));
  // }, []);

  const applyFilters = () => {
    return matches.filter(match => {
      const matchesSearchQuery = 
        `${match.tutor_first_name} ${match.tutor_last_name}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        `${match.learner_first_name} ${match.learner_last_name}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
  
      return matchesSearchQuery;
    });
  };

  const removeMatch = (id: number) => {
    fetch(`http://localhost:5002/api/matches/${id}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setMatches((prevMatches) =>
            prevMatches.filter((match) => match.match_id !== id)
          );
        } else {
          alert(`Error deleting match: ${data.message || "Unknown error"}`);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const filteredMatches = applyFilters();

  return (
    <div className="data-container">
      <h3 className="header">Matches</h3>
      <div className="search-filter-container">
        <input
          type="text"
          placeholder="Search Matches"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="filter-and-list-container">
        <div className="list-container">
          <ul className="matches-list">
            {filteredMatches.map((match) => (
              <li key={match.match_id}>
                <div>
                  <Link to={`/database/tutors/${match.tutor_id}`}>
                    {match.tutor_first_name} {match.tutor_last_name} {" - "}
                  </Link>
                  <Link to={`/database/learners/${match.learner_id}`}>
                    {match.learner_first_name} {match.learner_last_name}
                  </Link>
                </div>
                <button
                  onClick={() => removeMatch(match.match_id)}
                  className="remove-button">Unmatch
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Matches;