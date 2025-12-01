import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { exampleBatchCreateTutors } from "../../../../data/data_access/ExampleTutorService";
import { exampleBatchCreateLearners } from "../../../../data/data_access/ExampleLearnerService";
import { parseTutorsFromCSV } from "../../../functions/parseTutorsFromCSV";
import { parseLearnerFromCSV } from "../../../functions/parseLearnersFromCSV";

import { Tutor } from "../../../../data/data_objects/Tutor";
import { Learner } from "../../../../data/data_objects/Learner";

import "../index.css";

type UploadType = "tutor" | "learner";

type BatchTutor = {
  tutor: Tutor;
  errors: string[];
};

type BatchLearner = {
  learner: Learner;
  errors: string[];
};

function CsvUpload() {
  const navigate = useNavigate();
  const [uploadType, setUploadType] = useState<UploadType>("tutor");
  const [fileText, setFileText] = useState<string | null>(null);
  const [tutors, setTutors] = useState<BatchTutor[]>([]);
  const [learners, setLearners] = useState<BatchLearner[]>([]);
  const [errorText, setErrorText] = useState("");

  // ---------- validation ----------

  const validateBatchTutor = (tutor: Tutor): string[] => {
    const errors: string[] = [];

    // Required fields
    if (!tutor.first_name.trim()) errors.push("First name is required");
    if (!tutor.last_name.trim()) errors.push("Last name is required");
    if (!tutor.phone.trim()) errors.push("Phone number is required");
    if (!tutor.email.trim()) errors.push("Email is required");
    if (!tutor.gender.trim()) errors.push("Gender is required");

    // Patterns
    const phonePattern = /^[0-9]{10}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (tutor.phone && !phonePattern.test(tutor.phone)) {
      errors.push("Phone number is invalid");
    }
    if (tutor.email && !emailPattern.test(tutor.email)) {
      errors.push("Email is invalid");
    }

    // At least one *subject* preference (ignore conversation)
    const hasCheckedPreference = Object.entries(tutor.preferences).some(
      ([key, value]) => key !== "conversation" && value
    );
    if (!hasCheckedPreference) {
      errors.push("At least one preference must be selected");
    }

    // Availability: require at least one day with a time range
    const hasAvailability = Object.values(tutor.availability).some(
      (range) => range.start_time && range.end_time
    );
    if (!hasAvailability) {
      errors.push("At least one availability time must be selected");
    }

    return errors;
  };

  const validateBatchLearner = (learner: Learner): string[] => {
    const errors: string[] = [];

    // Required fields
    if (!learner.first_name.trim()) errors.push("First name is required");
    if (!learner.last_name.trim()) errors.push("Last name is required");
    if (!learner.phone.trim()) errors.push("Phone number is required");
    if (!learner.email.trim()) errors.push("Email is required");
    if (!learner.gender.trim()) errors.push("Gender is required");

    // Patterns
    const phonePattern = /^[0-9]{10}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (learner.phone && !phonePattern.test(learner.phone)) {
      errors.push("Phone number is invalid");
    }
    if (learner.email && !emailPattern.test(learner.email)) {
      errors.push("Email is invalid");
    }

    // Has a level
    if (!learner.level.trim()) {
      errors.push("Level selection is required");
    }

    // Availability: require at least one day with a time range
    const hasAvailability = Object.values(learner.availability).some(
      (range) => range.start_time && range.end_time
    );
    if (!hasAvailability) {
      errors.push("At least one availability time must be selected");
    }

    return errors;
  };

  // ---------- file handling ----------

  const handleFile = async (file: File) => {
    const text = await file.text();
    setFileText(text);
    setErrorText("");
    setTutors([]);
    setLearners([]);

    if (uploadType === "tutor") {
      try {
        const parsedTutors = parseTutorsFromCSV(text);
        const withErrors: BatchTutor[] = parsedTutors.map((tutor) => ({
          tutor,
          errors: validateBatchTutor(tutor),
        }));
        setTutors(withErrors);
      } catch (err) {
        console.error("Error parsing tutors:", err);
        setErrorText("There was an error reading the tutor CSV file.");
      }
    } else {
      try {
        const parsedLearners = parseLearnerFromCSV(text);
        const withErrors: BatchLearner[] = parsedLearners.map((learner) => ({
          learner,
          errors: validateBatchLearner(learner),
        }));
        setLearners(withErrors);
      } catch (err) {
        console.error("Error parsing learners:", err);
        setErrorText("There was an error reading the learner CSV file.");
      }
    }
  };

  // ---------- remove row ----------

  const removeRow = (index: number) => {
    if (uploadType === "tutor") {
      setTutors((prev) => {
        const updated = prev.filter((_, i) => i !== index);

        const hasRemainingErrors = updated.some((row) => row.errors.length > 0);
        if (!hasRemainingErrors) {
          setErrorText("");
        }
        if (updated.length === 0) {
          setFileText(null);
        }

        return updated;
      });
    } else {
      setLearners((prev) => {
        const updated = prev.filter((_, i) => i !== index);

        const hasRemainingErrors = updated.some((row) => row.errors.length > 0);
        if (!hasRemainingErrors) {
          setErrorText("");
        }
        if (updated.length === 0) {
          setFileText(null);
        }

        return updated;
      });
    }
  };

  // ---------- submit ----------

  const handleSubmitBatch = async () => {
    if (!fileText) {
      alert("There is no file loaded.");
      return;
    }

    if (uploadType === "tutor") {
      if (tutors.length === 0) {
        alert("There are no tutors to upload.");
        return;
      }

      const hasErrors = tutors.some((row) => row.errors.length > 0);
      if (hasErrors) {
        setErrorText("Some tutors have errors. Remove or fix them before uploading.");
        return;
      }

      const batchTutors: Array<Omit<Tutor, "id">> = tutors.map(({ tutor }) => {
        const { id, ...rest } = tutor;
        return rest;
      });

      try {
        const created = await exampleBatchCreateTutors(batchTutors);
        alert(`Successfully uploaded ${created.length} tutor(s).`);
        setTutors([]);
        setFileText(null);
        navigate("/database/tutors");
      } catch (err) {
        console.error("Error uploading tutors:", err);
        alert("Failed to upload tutors.");
      }
    } else {
      if (learners.length === 0) {
        alert("There are no learners to upload.");
        return;
      }

      const hasErrors = learners.some((row) => row.errors.length > 0);
      if (hasErrors) {
        setErrorText("Some learners have errors. Remove or fix them before uploading.");
        return;
      }

      const batchLearners: Array<Omit<Learner, "id">> = learners.map(
        ({ learner }) => {
          const { id, ...rest } = learner;
          return rest;
        }
      );

      try {
        const created = await exampleBatchCreateLearners(batchLearners);
        alert(`Successfully uploaded ${created.length} learner(s).`);
        setLearners([]);
        setFileText(null);
        navigate("/database/learners");
      } catch (err) {
        console.error("Error uploading learners:", err);
        alert("Failed to upload learners.");
      }
    }
  };

  const navigateToInstructionsPage = () => {
    navigate("/forms/csv/instructions");
  };

  // ---------- render ----------

  return (
    <div className="data-container">
      <div className="header-and-errors-container">
        <h3 className="header">Batch Upload From CSV File</h3>
      </div>

      {!fileText && (
        <div className="toggle-and-instructions-container">
          <div className="upload-type-toggle">
            <label className="upload-type-label">
              <input
                type="radio"
                name="uploadType"
                value="tutor"
                checked={uploadType === "tutor"}
                onChange={() => {
                  setUploadType("tutor");
                  setFileText(null);
                  setErrorText("");
                  setTutors([]);
                  setLearners([]);
                }}
              />
              Tutors
            </label>
            <label className="upload-type-label">
              <input
                type="radio"
                name="uploadType"
                value="learner"
                checked={uploadType === "learner"}
                onChange={() => {
                  setUploadType("learner");
                  setFileText(null);
                  setErrorText("");
                  setTutors([]);
                  setLearners([]);
                }}
              />
              Learners
            </label>
          </div>
          <button
            className="instructions-button"
            onClick={navigateToInstructionsPage}
          >
            Instructions
          </button>
        </div>
      )}

      {errorText && <p className="csv-error-message">{errorText}</p>}

      <div className="form-container">
        {fileText ? (
          <div className="csv-upload-box">
            {uploadType === "tutor"
              ? tutors.map((row, index) => {
                  const { tutor, errors } = row;
                  return (
                    <div key={index} className="data-preview-card">
                      <div className="preview-header">
                        <p>
                          <strong>
                            {tutor.first_name} {tutor.last_name}
                          </strong>{" "}
                          ({tutor.gender})
                        </p>
                        <button
                          className="remove-button"
                          onClick={() => removeRow(index)}
                        >
                          Remove
                        </button>
                      </div>

                      {errors.length > 0 && (
                        <ul className="batch-error-list">
                          {errors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      )}

                      <p className="csv-email">{tutor.email}</p>
                      <p>{tutor.phone}</p>

                      <p>Preferences</p>
                      <ul>
                        {Object.entries(tutor.preferences)
                          .filter(
                            ([key, val]) => val && key !== "conversation"
                          )
                          .map(([key]) => (
                            <li key={key}>{key.replace(/_/g, " ")}</li>
                          ))}
                      </ul>

                      <p>Availability</p>
                      <ul>
                        {Object.entries(tutor.availability)
                          .filter(([_, day]) => day.start_time)
                          .map(([day, range]) => (
                            <li key={day}>
                              {day}: {range.start_time} – {range.end_time}
                            </li>
                          ))}
                      </ul>
                    </div>
                  );
                })
              : learners.map((row, index) => {
                  const { learner, errors } = row;
                  return (
                    <div key={index} className="data-preview-card">
                      <div className="preview-header">
                        <p>
                          <strong>
                            {learner.first_name} {learner.last_name}
                          </strong>{" "}
                          ({learner.gender})
                        </p>
                        <button
                          className="remove-button"
                          onClick={() => removeRow(index)}
                        >
                          Remove
                        </button>
                      </div>

                      {errors.length > 0 && (
                        <ul className="batch-error-list">
                          {errors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      )}

                      <p className="csv-email">{learner.email}</p>
                      <p>{learner.phone}</p>
                      
                      <p>Level</p>
                      <ul>
                        <li>{learner.level.replace(/_/g, " ")}</li>
                      </ul>

                      <p>Availability</p>
                      <ul>
                        {Object.entries(learner.availability)
                          .filter(([_, day]) => day.start_time)
                          .map(([day, range]) => (
                            <li key={day}>
                              {day}: {range.start_time} – {range.end_time}
                            </li>
                          ))}
                      </ul>
                    </div>
                  );
                })}
          </div>
        ) : (
          <div className="csv-upload-box">
            <label htmlFor="csvFileInput" className="csv-file-label">
              Drop a CSV file below
            </label>
            <div className="csv-upload-container">
              <div className="csv-upload-border">
                <input
                  type="file"
                  id="csvFileInput"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFile(file);
                    }
                  }}
                  className="csv-file-input"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {fileText && (
        <div className="csv-button-container">
          <button
            type="button"
            className="submit-button"
            onClick={handleSubmitBatch}
          >
            Upload Batch
          </button>
        </div>
      )}
    </div>
  );
}

export default CsvUpload;
