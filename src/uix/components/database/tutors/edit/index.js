import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import times from "../../../../objects/times";
import capitalizeName from "../../../../functions/capitalizeName";
import convertTime from "../../../../functions/convertTime";

function TutorEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState({
    first_name: "",
    last_name: "",
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
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetch(`http://localhost:5002/api/tutors/${id}`)
      .then((response) => response.json())
      .then((data) => {
        const { tutor: tutorData, preferences, availability } = data;

        setTutor({
          first_name: tutorData.first_name || "",
          last_name: tutorData.last_name || "",
          phone: tutorData.phone || "",
          email: tutorData.email || "",
          available: tutorData.available,
          preferences: {
            conversation: preferences.conversation || false,
            esl_novice: preferences.esl_novice || false,
            esl_beginner: preferences.esl_beginner || false,
            esl_intermediate: preferences.esl_intermediate || false,
            citizenship: preferences.citizenship || false,
            sped_ela: preferences.sped_ela || false,
            basic_math: preferences.basic_math || false,
            hiset_math: preferences.hiset_math || false,
            basic_reading: preferences.basic_reading || false,
            hiset_reading: preferences.hiset_reading || false,
            basic_writing: preferences.basic_writing || false,
            hiset_writing: preferences.hiset_writing || false
          },
          availability: availability.reduce((acc, day) => {
            acc[day.day] = { start_time: day.start_time || "", end_time: day.end_time || "" };
            return acc;
          }, {
            monday: { start_time: "", end_time: "" },
            tuesday: { start_time: "", end_time: "" },
            wednesday: { start_time: "", end_time: "" },
            thursday: { start_time: "", end_time: "" },
            friday: { start_time: "", end_time: "" },
            saturday: { start_time: "", end_time: "" }
          })
        });
      })
      .catch((err) => console.error('Error fetching tutor:', err));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'text' || type === 'email') {
      setTutor((prevTutor) => ({
        ...prevTutor,
        [name]: value
      }));
    } else if (type === 'checkbox') {
      const [category, field] = name.split('.');
      setTutor((prevTutor) => ({
        ...prevTutor,
        [category]: {
          ...prevTutor[category],
          [field]: checked
        }
      }));
    } else {
      const [day, timeType] = name.split('.');
      setTutor((prevTutor) => ({
        ...prevTutor,
        availability: {
          ...prevTutor.availability,
          [day]: {
            ...prevTutor.availability[day],
            [timeType]: value
          }
        }
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
  
    if (!tutor.first_name.trim()) newErrors.first_name = "First name is required";
    if (!tutor.last_name.trim()) newErrors.last_name = "Last name is required";
    if (!tutor.phone.trim()) newErrors.phone = "Phone number is required";
    if (!tutor.email.trim()) newErrors.email = "Email is required";
  
    const phonePattern = /^[0-9]{10}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (tutor.phone && !phonePattern.test(tutor.phone)) newErrors.phone = "Phone number is invalid";
    if (tutor.email && !emailPattern.test(tutor.email)) newErrors.email = "Email is invalid";
  
    const hasCheckedPreference = Object.values(tutor.preferences).some(value => value);
    if (!hasCheckedPreference) newErrors.preferences = "At least one preference must be selected";
  
    Object.keys(tutor.availability).forEach(day => {
      const { start_time, end_time } = tutor.availability[day];
  
      if (start_time && !end_time) {
        newErrors.availability = newErrors.availability || {};
        newErrors.availability = "End time is required if a start time is selected";
      } else if (!start_time && end_time) {
        newErrors.availability = newErrors.availability || {};
        newErrors.availability = "Start time is required if an end time is selected";
      } 
  
      if (start_time && end_time && start_time >= end_time) {
        newErrors.availability = newErrors.availability || {};
        newErrors.availability = "Start time must be before end time";
      }
    });
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const capitalizedTutor = {
      ...tutor,
      first_name: capitalizeName(tutor.first_name),
      last_name: capitalizeName(tutor.last_name)
    };
    if (validateForm()) {
      try {
        const response = await fetch(`http://localhost:5002/api/tutors/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(capitalizedTutor),
        });
  
        if (response.ok) {
          navigate(`/database/tutors/${id}`);
        } else {
          const data = await response.json();
          console.error("Server error:", data);
        }
      } catch (error) {
        console.error("Network error:", error);
      }
    }
  };

  return (
    <div className="data-container">
      <div className="header-and-errors-container">
        <h3 className="header">Edit Tutor</h3>
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
            <h4 className="preferences-label">Preferences</h4>
            <div className="level-container">
              {Object.keys(tutor.preferences).map((preference) => (
                <div key={preference}>
                  <input
                    type="checkbox"
                    id={preference}
                    name={`preferences.${preference}`}
                    checked={tutor.preferences[preference]}
                    onChange={handleChange}
                  />
                  <label htmlFor={preference}>{preference.replace(/_/g, ' ')}</label>
                </div>
              ))}
            </div>
            <h4 className="select-label">Availability</h4>
            <div className="availability-container">
              {Object.keys(tutor.availability).map((day) => {
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
                    <label htmlFor={`${day}.end_time`}>
                      {"  "}
                    </label>
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
