import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Match from "../../../../data/data_objects/Match";
import { fetchMatches } from "../../../../data/data_access/matchService";

import "../index.css";

function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const getMatches = async () => {
      try {
        const data = await fetchMatches();
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

  // const removeMatch = (id: number) => {
  //   fetch(`http://localhost:5002/api/matches/${id}`, {
  //     method: "DELETE",
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       if (data.success) {
  //         setMatches((prevMatches) =>
  //           prevMatches.filter((match) => match.id !== id)
  //         );
  //       } else {
  //         alert(`Error deleting match: ${data.message || "Unknown error"}`);
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error:", error);
  //     });
  // };

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
                {/* <button
                  onClick={() => removeMatch(match.id)}
                  className="remove-button">Unmatch
                </button> */}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Matches;