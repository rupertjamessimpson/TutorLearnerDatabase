import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// import { exampleFetchTutors } from "../../../../data/data_access/ExampleTutorService";
import { fetchTutors, deleteAllTutors } from "../../../../data/data_access/TutorService";

import { Tutor, Preferences, Availability } from "../../../../data/data_objects/Tutor";
import { TutorFilters, preferenceKeys, dayKeys } from "../../../objects/Filters";

import exportTutorsCsv from "../../../functions/exportTutorsCsv";

// import "../index.css";

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
  const [isDeleteMessageOpen, setIsDeleteMessageOpen] = useState(false);

  useEffect(() => {
    const getTutors = async () => {
      try {
        const data = await fetchTutors();
        setTutors(data);
        exportTutorsCsv(data);
      } catch (err) {
        console.error("Failed to fetch tutors:", err);
      }
    };
    getTutors();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDeleteMessage = () => {
    if (isDeleteMessageOpen) {
      setIsDeleteMessageOpen(false);
    } else {
      setIsDeleteMessageOpen(true);
    }
  };

  const handleExportCsv = () => {
    const csv = exportTutorsCsv(tutors);

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "tutors.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const handleDeleteAllTutors = async () => {

    try {
      const deletedCount = await deleteAllTutors();
      setTutors([]);
      setIsDeleteMessageOpen(false);
      alert(`Deleted ${deletedCount} tutors.`);
    } catch (err) {
      console.error("Failed to delete all tutors:", err);
      alert("Could not delete tutors.");
    } finally {
      setIsDeleteMessageOpen(false);
    }
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

      const matchesAvailability = filters.available ? tutor.available && !tutor.match: true;

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

  const sortedTutors = [...filteredTutors].sort((a, b) => {
    const orderDiff = (a.order ?? 0) - (b.order ?? 0);
    if (orderDiff !== 0) return orderDiff;

    const last = a.last_name.localeCompare(b.last_name);
    if (last !== 0) return last;

    return a.first_name.localeCompare(b.first_name);
  });

  return (
    <div className="data-container">
      <div className="title-and-export-container">
        <h3 className="header">Tutors</h3>
        <button className="filterButton" onClick={handleExportCsv}>
          Export CSV
        </button>
      </div>
      <div className="search-filter-container">
        <div>
          <input
            type="text"
            placeholder="Search Tutors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="filterButton" onClick={toggleSidebar}>
          {isSidebarOpen ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>
      <div className="filters-and-list-container">
        <div className="list-container">
          <ul className="list">
            {sortedTutors.map(tutor => (
              <li key={tutor.id}>
                <Link to={`/database/tutors/${tutor.id}`}>
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
      <div className="delete-all">
        {isDeleteMessageOpen ? (
          <div className="delete-message">
            <p className="delete-message-text">Are you sure you want to delete all tutors?</p>
            <button className="yes-delete-button" onClick={handleDeleteAllTutors}>Yes</button>
            <button className="no-delete-button" onClick={toggleDeleteMessage}>No</button>
          </div>
        ) : <button className="delete-button" onClick={toggleDeleteMessage}>Delete All</button>}
      </div>
    </div>
  );
}

export default Tutors;