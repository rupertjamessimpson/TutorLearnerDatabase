import React from "react";

function CsvUploadInstructions () {
  return (
    <div className="data-container">
      <h3 className="header">CSV Batch Upload Instructions</h3>
      <div className="instructions-container">
        <div className="instructions">
          <p>The batch CSV upload tool allows for the insertion of multiple
            tutors or learners by reading a provided comma-separated value 
            file.
          </p>
        </div>
      </div>
    </div>
  )
}

export default CsvUploadInstructions;