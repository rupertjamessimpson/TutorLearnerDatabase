import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Learner } from "../../../../data/data_objects/Learner";
import { LearnerFilters, levelKeys, dayKeys } from "../../../objects/Filters";
import { fetchLearners } from "../../../../data/data_access/learnerService";

import "../index.css";

function Learners() {
  const [learners, setLearners] = useState<Learner[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<LearnerFilters>({
    available: false,
    not_in_class: false,
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
    const filtered = learners.filter(learner => {
      const matchesSearchQuery = `${learner.first_name} ${learner.last_name}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
  
      const matchesAvailability = filters.available ? learner.available : true;
  
      const matchesNotInClass = filters.not_in_class ? learner.conversation === null : true;

      const matchesLevel = levelKeys.some((key) => {
        return filters[key] && learner.level === key;
      });

      const matchDaysAvailable = dayKeys.every((day) => {
        if (!filters[day]) return true;
        const dayAvail = learner.availability[day as keyof typeof learner.availability]
        return !!dayAvail.start_time || !!dayAvail.end_time;
      });

      const anyLevelFilterSelected = levelKeys.some((key) => filters[key]);
      const anyDayFilterSelected = dayKeys.some((day) => filters[day]);
  
      const matchesFilters =
        (!anyLevelFilterSelected || matchesLevel) &&
        (!anyDayFilterSelected || matchDaysAvailable) &&
        matchesAvailability && matchesNotInClass;
  
      return matchesSearchQuery && matchesFilters;
    });
  
    return filtered;
  };

  const filteredLearners = applyFilters();

  return (
    <div className="data-container">
      <h3 className="header">Learners</h3>
      <div className="search-filter-container">
        <input
          type="text"
          placeholder="Search Learners"
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
            {filteredLearners.map(learner => (
              <li key={learner.id}>
                <Link to={`/database/learners/${learner.id}`}>
                  {learner.first_name} {learner.last_name}
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
              <div key="not_in_class">
                <label>
                  <input
                    type="checkbox"
                    name="not_in_class"
                    checked={filters.not_in_class}
                    onChange={handleFilterChange}
                  />not in class
                </label>
              </div>
              <h3 className="filter-label">Level</h3>
              {levelKeys.map((preference) => (
                <div key={preference}>
                  <label>
                    <input
                      type="checkbox"
                      name={preference}
                      checked={filters[preference]}
                      onChange={handleFilterChange}
                    />
                    {preference.replace('_', ' ')}
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

export default Learners;