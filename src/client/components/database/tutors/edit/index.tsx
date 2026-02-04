import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import times from "../../../../objects/times";
import capitalizeName from "../../../../functions/capitalizeName";
import convertTime from "../../../../functions/convertTime";

// import { exampleFetchTutorById, exampleUpdateTutor } from "../../../../../data/data_access/ExampleTutorService";
import { fetchTutorById, updateTutor } from "../../../../../data/data_access/TutorService";

import { Tutor } from "../../../../../data/data_objects/Tutor";
import { TutorFormErrors } from "../../../../objects/FormErrors";
import { dayKeys } from "../../../../objects/Filters";

function TutorEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState<Tutor>({
    id: "",
    first_name: "",
    last_name: "",
    gender: "",
    phone: "",
    email: "",
    available: true,
    match: "",
    notes: "",
    preferences: {
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
    },
    availability: {
      monday: { start_time: "", end_time: "" },
      tuesday: { start_time: "", end_time: "" },
      wednesday: { start_time: "", end_time: "" },
      thursday: { start_time: "", end_time: "" },
      friday: { start_time: "", end_time: "" },
      saturday: { start_time: "", end_time: "" },
    },
  });
  const [errors, setErrors] = useState<TutorFormErrors>({});

  useEffect(() => {
    if (!id) return;

    fetchTutorById(id)
      .then((data) => setTutor(data))
      .catch((err) => console.log("Error fetching tutor:", err));
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    // text/email/select (gender)
    if (type === "text" || type === "email" || (type === "select-one" && name === "gender")) {
      setTutor((prevTutor) => ({
        ...prevTutor,
        [name]: value,
      }));
      return;
    }

    // radio (available)
    if (type === "radio") {
      if (name === "available") {
        setTutor((prev) => ({
          ...prev,
          available: value === "true",
        }));
      }
      return;
    }

    // checkbox (preferences)
    if (type === "checkbox") {
      const [category, field] = name.split(".");
      if (category === "preferences") {
        setTutor((prevTutor) => ({
          ...prevTutor,
          preferences: {
            ...prevTutor.preferences,
            [field as keyof Tutor["preferences"]]: (e.target as HTMLInputElement).checked,
          },
        }));
      }
      return;
    }

    // availability selects: "monday.start_time"
    if (name.includes(".")) {
      const [day, timeType] = name.split(".");
      setTutor((prevTutor) => ({
        ...prevTutor,
        availability: {
          ...prevTutor.availability,
          [day as keyof Tutor["availability"]]: {
            ...prevTutor.availability[day as keyof Tutor["availability"]],
            [timeType]: value,
          },
        },
      }));
      return;
    }

    // fallback (if you ever add other fields later)
    setTutor((prevTutor) => ({
      ...prevTutor,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors: TutorFormErrors = {};

    if (!tutor.first_name.trim())
      newErrors.first_name = "First name is required";
    if (!tutor.last_name.trim())
      newErrors.last_name = "Last name is required";
    if (!tutor.phone.trim()) newErrors.phone = "Phone number is required";
    if (!tutor.email.trim()) newErrors.email = "Email is required";
    if (!tutor.gender.trim()) newErrors.gender = "Gender is required";

    const phonePattern = /^[0-9]{10}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (tutor.phone && !phonePattern.test(tutor.phone))
      newErrors.phone = "Phone number is invalid";
    if (tutor.email && !emailPattern.test(tutor.email))
      newErrors.email = "Email is invalid";

    const hasCheckedPreference = Object.values(tutor.preferences).some(
      (value) => value
    );
    if (!hasCheckedPreference)
      newErrors.preferences = "At least one preference must be selected";

    dayKeys.forEach((day) => {
      const { start_time, end_time } = tutor.availability[day];

      if (start_time && !end_time) {
        newErrors.availability =
          "End time is required if a start time is selected";
      } else if (!start_time && end_time) {
        newErrors.availability =
          "Start time is required if an end time is selected";
      }

      if (start_time && end_time && start_time >= end_time) {
        newErrors.availability = "Start time must be before end time";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const capitalizedTutor = {
      ...tutor,
      first_name: capitalizeName(tutor.first_name),
      last_name: capitalizeName(tutor.last_name),
    };

    if (validateForm()) {
      try {
        const updated = await updateTutor(id!, capitalizedTutor);
        setTutor(updated);
        navigate(`/database/tutors/${id}`);
      } catch (error) {
        console.error("Error updating tutor:", error);
      }
    }
  };

  return (
    <div className="data-container">
      <div className="header-and-errors-container">
        <h3 className="header">
          {tutor.first_name} {tutor.last_name}
        </h3>
        {Object.keys(errors).length > 0 && (
          <ul className="error-list">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>{error}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="form-container">
        <div className="form">
          <form>
            <div className="form-group">
              <h4 className="input-label">Name</h4>
              <div className="input-container">
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  placeholder="First Name"
                  value={tutor.first_name}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  placeholder="Last Name"
                  value={tutor.last_name}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-group">
              <h4 className="input-label">Contact</h4>
              <div className="input-container">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email"
                  value={tutor.email}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  placeholder="Phone Number"
                  value={tutor.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* NEW GENDER SELECT */}
            <div className="form-group">
              <h4 className="input-label">Gender</h4>
              <div className="gender-container">
                <select
                  id="gender"
                  name="gender"
                  value={tutor.gender}
                  onChange={handleChange}
                >
                  <option value="">gender</option>
                  <option value="male">male</option>
                  <option value="female">female</option>
                  <option value="nonbinary">non-binary</option>
                </select>
              </div>
            </div>

            <h4 className="preferences-label">Preferences</h4>
            <div className="level-container">
              {Object.keys(tutor.preferences).map((preference) => (
                <div key={preference}>
                  <input
                    type="checkbox"
                    id={preference}
                    name={`preferences.${preference}`}
                    checked={
                      tutor.preferences[
                        preference as keyof typeof tutor.preferences
                      ]
                    }
                    onChange={handleChange}
                  />
                  <label htmlFor={preference}>
                    {preference.replace(/_/g, " ")}
                  </label>
                </div>
              ))}
            </div>
            <div className="form-group">
              <h4 className="input-label">Notes</h4>
              <div className="notes-input-container">
                <input
                  type="text"
                  id="notes"
                  name="notes"
                  placeholder="Notes"
                  value={tutor.notes}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="availability-form-group">
              <h4 className="input-label">Availability</h4>
              <div className="availability-status-container">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="available"
                    value="true"
                    checked={tutor.available === true}
                    onChange={handleChange}
                  />
                  available
                </label>

                <label className="radio-option">
                  <input
                    type="radio"
                    name="available"
                    value="false"
                    checked={tutor.available === false}
                    onChange={handleChange}
                  />
                  unavailable
                </label>
              </div>
            </div>

            <div className="availability-container">
              {dayKeys.map((day) => {
                let filteredTimes;

                if (day === "thursday") {
                  filteredTimes = times.slice(0, times.length - 6);
                } else if (day === "friday" || day === "saturday") {
                  filteredTimes = times.slice(0, times.length - 8);
                } else {
                  filteredTimes = times;
                }

                return (
                  <div key={day}>
                    <label htmlFor={`${day}.start_time`}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </label>
                    <select
                      id={`${day}.start_time`}
                      name={`${day}.start_time`}
                      value={convertTime(tutor.availability[day].start_time)}
                      onChange={handleChange}
                    >
                      <option value="">Start Time</option>
                      {filteredTimes.slice(0, -1).map((time, index) => (
                        <option key={index} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>

                    <label htmlFor={`${day}.end_time`}>{"  "}</label>
                    <select
                      id={`${day}.end_time`}
                      name={`${day}.end_time`}
                      value={convertTime(tutor.availability[day].end_time)}
                      onChange={handleChange}
                    >
                      <option value="">End Time</option>
                      {filteredTimes.slice(1).map((time, index) => (
                        <option key={index} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
            <div className="button-container">
              <button onClick={handleSave}>Save</button>
              <button onClick={() => navigate(`/database/tutors/${id}`)}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TutorEdit;
