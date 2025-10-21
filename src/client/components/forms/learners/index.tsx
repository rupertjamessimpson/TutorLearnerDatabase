import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import times from "../../../objects/times";
import capitalizeName from "../../../functions/capitalizeName";

import { Learner } from "../../../../server/data_objects/Learner";
import { LearnerFormErrors } from "../../../objects/FormErrors";
import { dayKeys } from "../../../objects/Filters";

import "../index.css";

type LearnerForm = Omit<Learner, "learner_id" | "available" | "conversation">;

function LearnersForm() {
  const navigate = useNavigate();
  const [learner, setLearner] = useState<LearnerForm>({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    level: "",
    availability: {
      monday: { start_time: "", end_time: "" },
      tuesday: { start_time: "", end_time: "" },
      wednesday: { start_time: "", end_time: "" },
      thursday: { start_time: "", end_time: "" },
      friday: { start_time: "", end_time: "" },
      saturday: { start_time: "", end_time: "" }
    }
  });
  const [errors, setErrors] = useState<LearnerFormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
  
    if (type === 'text' || type === 'email') {
      setLearner((prevLearner) => ({
        ...prevLearner,
        [name]: value
      }));
    } else if (type === 'checkbox') {
      if (name === "level") {
        setLearner((prevLearner) => ({
          ...prevLearner,
          level: value
        }));
      }
    } else {
      const [day, timeType] = name.split('.');
      setLearner((prevLearner) => ({
        ...prevLearner,
        availability: {
          ...prevLearner.availability,
          [day as keyof LearnerForm["availability"]]: {
            ...prevLearner.availability[day as keyof LearnerForm["availability"]],
            [timeType]: value
          }
        }
      }));
    }
  };

  const validateForm = () => {
    const newErrors: LearnerFormErrors = {};
  
    if (!learner.first_name.trim()) newErrors.first_name = "First name is required";
    if (!learner.last_name.trim()) newErrors.last_name = "Last name is required";
    if (!learner.phone.trim()) newErrors.phone = "Phone number is required";
    if (!learner.email.trim()) newErrors.email = "Email is required";
    if (!learner.level.trim()) newErrors.level = "Level is required";
  
    const phonePattern = /^[0-9]{10}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (learner.phone && !phonePattern.test(learner.phone)) newErrors.phone = "Phone number is invalid";
    if (learner.email && !emailPattern.test(learner.email)) newErrors.email = "Email is invalid";
  
    dayKeys.forEach((day) => {
      const { start_time, end_time } = learner.availability[day];

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> ) => {
    e.preventDefault();
    const capitalizedLearner = {
      ...learner,
      first_name: capitalizeName(learner.first_name),
      last_name: capitalizeName(learner.last_name)
    };
    if (validateForm()) {
      // try {
      //   const response = await fetch('http://localhost:5002/api/learners/', {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify(capitalizedLearner),
      //   });
  
      //   if (response.ok) {
      //     navigate(`/database/learners`);
      //   } else {
      //     const data = await response.json();
      //     console.error("Server error:", data);
      //   }
      // } catch (error) {
      //   console.error("Network error:", error);
      // }
    }
  };

  return (
    <div className="data-container">
      <div className="header-and-errors-container">
        <h3 className="header">Add a Learner</h3>
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
                  value={learner.first_name}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  placeholder="Last Name"
                  value={learner.last_name}
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
                  value={learner.email}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  placeholder="Phone Number"
                  value={learner.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
            <h4 className="preferences-label">Level</h4>
            <div className="level-container">
              {["esl_novice", 
                "esl_beginner", 
                "esl_intermediate",
                "citizenship", 
                "sped_ela", 
                "basic_math", 
                "hiset_math", 
                "basic_reading", 
                "hiset_reading", 
                "basic_writing", 
                "hiset_writing"].map((level) => (
                <div key={level}>
                  <input
                    type="checkbox"
                    id={level}
                    name="level"
                    value={level}
                    checked={learner.level === level}
                    onChange={handleChange}
                  />
                  <label htmlFor={level}>{level.replace('_', ' ').toLowerCase()}</label>
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
                      value={learner.availability[day].start_time}
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
                      value={learner.availability[day].end_time}
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

export default LearnersForm;