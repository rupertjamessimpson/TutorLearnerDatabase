import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import times from "../../../objects/times";
import capitalizeName from "../../../functions/capitalizeName";

import { exampleCreateTutor } from "../../../../data/data_access/ExampleTutorService";

import { Tutor } from "../../../../data/data_objects/Tutor";
import { TutorFormErrors } from "../../../objects/FormErrors";
import { dayKeys, preferenceKeys } from "../../../objects/Filters";

import "../index.css"

type TutorForm = Omit<Tutor, "id" >

function TutorsForm() {
  const navigate = useNavigate();
  const [tutor, setTutor] = useState<TutorForm>({
    first_name: "",
    last_name: "",
    gender: "",
    phone: "",
    email: "",
    available: true,
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
      hiset_writing: false
    },
    availability: {
      monday: { start_time: "", end_time: "" },
      tuesday: { start_time: "", end_time: "" },
      wednesday: { start_time: "", end_time: "" },
      thursday: { start_time: "", end_time: "" },
      friday: { start_time: "", end_time: "" },
      saturday: { start_time: "", end_time: "" }
    }
  });
  const [errors, setErrors] = useState<TutorFormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === "text" || type === "email") {
      setTutor((prevTutor) => ({
        ...prevTutor,
        [name]: value,
      }));
      return;
    }

    if (type === "checkbox") {
      const [category, field] = name.split(".");

      if (category === "preferences") {
        const checked = (e.target as HTMLInputElement).checked;

        setTutor((prevTutor) => ({
          ...prevTutor,
          preferences: {
            ...prevTutor.preferences,
            [field as keyof TutorForm["preferences"]]: checked,
          },
        }));
      }

      return;
    }

    if (name.includes(".")) {
      const [day, timeType] = name.split(".");

      setTutor((prevTutor) => ({
        ...prevTutor,
        availability: {
          ...prevTutor.availability,
          [day as keyof TutorForm["availability"]]: {
            ...prevTutor.availability[day as keyof TutorForm["availability"]],
            [timeType]: value,
          },
        },
      }));
    } else {
      setTutor((prevTutor) => ({
        ...prevTutor,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    const newErrors: TutorFormErrors = {};
  
    if (!tutor.first_name.trim()) newErrors.first_name = "First name is required";
    if (!tutor.last_name.trim()) newErrors.last_name = "Last name is required";
    if (!tutor.phone.trim()) newErrors.phone = "Phone number is required";
    if (!tutor.email.trim()) newErrors.email = "Email is required";
    if (!tutor.gender.trim()) newErrors.gender = "Gender is required";
  
    const phonePattern = /^[0-9]{10}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (tutor.phone && !phonePattern.test(tutor.phone)) newErrors.phone = "Phone number is invalid";
    if (tutor.email && !emailPattern.test(tutor.email)) newErrors.email = "Email is invalid";
  
    const hasCheckedPreference = Object.values(tutor.preferences).some(value => value);
    if (!hasCheckedPreference) newErrors.preferences = "At least one preference must be selected";
  
    dayKeys.forEach((day) => {
      const { start_time, end_time } = tutor.availability[day];

      if (start_time && !end_time) {
        newErrors.availability = "End time is required if a start time is selected";
      } else if (!start_time && end_time) {
        newErrors.availability = "Start time is required if an end time is selected";
      }

      if (start_time && end_time && start_time >= end_time) {
        newErrors.availability = "Start time must be before end time";
      }
    });
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const capitalizedTutor = {
      ...tutor,
      first_name: capitalizeName(tutor.first_name),
      last_name: capitalizeName(tutor.last_name)
    };
    if (validateForm()) {
      try {
        const createdTutor = await exampleCreateTutor(capitalizedTutor);
        alert(`Tutor ${createdTutor.first_name} ${createdTutor.last_name} added successfully!`);
        navigate(`/database/tutors/${createdTutor.id}`);
      } catch (err) {
        console.error("Error creating tutor:", err);
        alert("Failed to create tutor.");
      }
    }
  };  

  return (
    <div className="data-container">
      <div className="header-and-errors-container">
        <h3 className="header">Add a Tutor</h3>
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
          <form onSubmit={handleSubmit}>
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
              {preferenceKeys.map((preference) => (
                <div key={preference}>
                  <input
                    type="checkbox"
                    id={preference}
                    name={`preferences.${preference}`}
                    checked={tutor.preferences[preference]}
                    onChange={handleChange}
                  />
                  <label htmlFor={preference}>{preference.replace('_', ' ').toLowerCase()}</label>
                </div>
              ))}
            </div>
            <h4 className="select-label">Availability</h4>
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
                      value={tutor.availability[day].start_time}
                      onChange={handleChange}
                    >
                      <option value="">Start Time</option>
                      {filteredTimes.slice(0, -1).map((time, index) => (
                        <option key={index} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                    <label htmlFor={`${day}.end_time`}>
                      {"  "}
                    </label>
                    <select
                      id={`${day}.end_time`}
                      name={`${day}.end_time`}
                      value={tutor.availability[day].end_time}
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
              <button type="submit" className="submit-button">Submit</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TutorsForm;
