import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { useAuthGate } from "./client/hooks/useAuthGate";
import LoginPage from "./client/components/auth/LoginPage";

import Title from "./client/components/header/Title";
import Nav from "./client/components/header/Nav";

import Tutors from "./client/components/database/tutors";
import TutorForm from "./client/components/forms/tutors";
import TutorDetails from "./client/components/database/tutors/details";
import TutorEdit from "./client/components/database/tutors/edit";
import TutorMatch from "./client/components/database/tutors/match";
import Matches from "./client/components/database/matches";
import Learners from "./client/components/database/learners";
import LearnerForm from "./client/components/forms/learners";
import LearnerDetails from "./client/components/database/learners/details";
import LearnerEdit from "./client/components/database/learners/edit";
import LearnerMatch from "./client/components/database/learners/match";
import Class from "./client/components/classes";
import CsvUpload from "./client/components/forms/csv";
import CsvUploadInstructions from "./client/components/forms/csv/instructions";

function App() {
  const { allowed, loading } = useAuthGate();

  if (loading) {
    return <div style={{ padding: 24 }}>Loading…</div>;
  }

  // 🔒 NOT allowed → always login
  if (!allowed) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // ✅ Allowed → render the app exactly as before
  return (
    <BrowserRouter>
      <Title />
      <Nav />
      <Routes>
        <Route path="/" element={<Navigate to="/database/tutors" />} />
        <Route path="/database" element={<Navigate to="/database/tutors" />} />

        <Route path="/database/tutors" element={<Tutors />} />
        <Route path="/database/tutors/:id" element={<TutorDetails />} />
        <Route path="/database/tutors/edit/:id" element={<TutorEdit />} />
        <Route path="/database/tutors/match/:id" element={<TutorMatch />} />

        <Route path="/database/learners" element={<Learners />} />
        <Route path="/database/learners/:id" element={<LearnerDetails />} />
        <Route path="/database/learners/edit/:id" element={<LearnerEdit />} />
        <Route path="/database/learners/match/:id" element={<LearnerMatch />} />

        <Route path="/database/matches" element={<Matches />} />

        <Route path="/forms" element={<Navigate to="/forms/tutor" />} />
        <Route path="/forms/tutor" element={<TutorForm />} />
        <Route path="/forms/learner" element={<LearnerForm />} />
        <Route path="/forms/csv" element={<CsvUpload />} />
        <Route path="/forms/csv/instructions" element={<CsvUploadInstructions />} />

        <Route path="/class" element={<Navigate to="/class/1" />} />
        <Route path="/class/:id" element={<Class />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
