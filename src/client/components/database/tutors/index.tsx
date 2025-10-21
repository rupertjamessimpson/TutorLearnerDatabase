import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Tutor, Preferences, Availability } from "../../../../business/data_objects/Tutor";
import { TutorFilters, preferenceKeys, dayKeys } from "../../../objects/Filters";
import { fetchTutors } from "../../../../business/data_access/tutorService";

import "../index.css";

function Tutors() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<TutorFilters>({
    available: false,
    conversation: false,
    esl_novice: false,
    esl_beginner: false,
    esl_intermediate: false,
    citizenship: false,
    sped_ela: false,
    basic_math: false,
    hiset_math: false,
    basic_reading: false,
    hiset_reading: false,
    basic_writing: false,
    hiset_writing: false,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const getTutors = async () => {
      try {
        const data = await fetchTutors();
        setTutors(data);
      } catch (err) {
        console.error("Failed to fetch tutors:", err);
      }
    };
    getTutors();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: checked
    }));
  };

  const applyFilters = () => {
    return tutors.filter((tutor) => {
      const matchesSearchQuery = `${tutor.first_name} ${tutor.last_name}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesAvailability = filters.available ? tutor.available : true;

      const matchesPreferences = preferenceKeys.every((key) => {
        const prefKey = key as keyof Preferences;
        return filters[prefKey] ? tutor.preferences[prefKey] : true;
      });

      const matchesDays = dayKeys.every((day) => {
        const dayKey = day as keyof Availability;
        return filters[dayKey] ? tutor.availability[dayKey].start_time !== "" : true;
      });

      return (
        matchesSearchQuery &&
        matchesAvailability &&
        matchesPreferences &&
        matchesDays
      );
    });
  };

  const filteredTutors = applyFilters();

  return (
    <div className="data-container">
      <h3 className="header">Tutors</h3>
      <div className="search-filter-container">
        <input
          type="text"
          placeholder="Search Tutors"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="filterButton" onClick={toggleSidebar}>
          {isSidebarOpen ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>
      <div className="filters-and-list-container">
        <div className="list-container">
          <ul className="list">
            {filteredTutors.map(tutor => (
              <li key={tutor.tutor_id}>
                <Link to={`/database/tutors/${tutor.tutor_id}`}>
                  {tutor.first_name} {tutor.last_name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {isSidebarOpen && (
          <div className="sidebar">
            <form>
              <div key="available">
                <label>
                  <input
                    type="checkbox"
                    name="available"
                    checked={filters.available}
                    onChange={handleFilterChange}
                  />available
                </label>
              </div>
              <h3 className="filter-label">Preferences</h3>
              <h3 className="filter-label">Preferences</h3>
              {preferenceKeys.map((preference) => (
                <div key={preference}>
                  <label>
                    <input
                      type="checkbox"
                      name={preference}
                      checked={filters[preference]}
                      onChange={handleFilterChange}
                    />
                    {preference.replace("_", " ")}
                  </label>
                </div>
              ))}
              <h3 className="filter-label">Days Available</h3>
              {dayKeys.map((day) => (
                <div key={day}>
                  <label>
                    <input
                      type="checkbox"
                      name={day}
                      checked={filters[day]}
                      onChange={handleFilterChange}
                    />
                    {day}
                  </label>
                </div>
              ))}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Tutors;