import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { exampleFetchMatches, exampleDeleteMatch } from "../../../../data/data_access/ExampleMatchService";

import Match from "../../../../data/data_objects/Match";

import "../index.css";

function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [searchQuery, setSearchQuery] = useState("");


  useEffect(() => {
    const getMatches = async () => {
      try {
        const data = await exampleFetchMatches();
        setMatches(data);
      } catch (err) {
        console.error("Failed to fetch matches:", err);
      }
    };
    getMatches();
  }, []);

  const applyFilters = () => {
    return matches.filter(match => {
      const matchesSearchQuery = 
        `${match.tutor.first_name} ${match.tutor.last_name}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        `${match.learner.first_name} ${match.learner.last_name}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
  
      return matchesSearchQuery;
    });
  };

  const removeMatch = async (id: string) => {
    try {
      await exampleDeleteMatch(id);
      setMatches((prev) => prev.filter((match) => match.id !== id)); // Update UI
    } catch (err) {
      console.error("Error deleting match:", err);
      alert("Failed to delete match.");
    }
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
              <li key={match.id}>
                <div>
                  <Link to={`/database/tutors/${match.tutor.id}`}>
                    {match.tutor.first_name} {match.tutor.last_name} {" - "}
                  </Link>
                  <Link to={`/database/learners/${match.learner.id}`}>
                    {match.learner.first_name} {match.learner.last_name}
                  </Link>
                </div>
                <button
                  onClick={() => removeMatch(match.id)}
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