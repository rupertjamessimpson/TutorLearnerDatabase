import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Title from "./client/components/header/Title";
import Nav from './client/components/header/Nav';
import Tutors from './client/components/database/tutors'
import TutorForm from './client/components/forms/tutors'
// import TutorDetails from './UIX/components/database/tutors/details/index.js';
// import TutorEdit from './UIX/components/database/tutors/edit/index.js';
// import TutorMatch from './UIX/components/database/tutors/match/index.js';
import Matches from './client/components/database/matches'
import Learners from './client/components/database/learners'
import LearnerForm from './client/components/forms/learners'
// import LearnerDetails from './UIX/components/database/learners/details/index.js';
// import LearnerEdit from './UIX/components/database/learners/edit/index.js';
// import Conversation from './UIX/components/conversation/index.js';

function App() {
  return (
    <BrowserRouter>
      <Title />
      <Nav />
      <Routes>
          <Route path="/" element={<Navigate to="/database/tutors" />} />
          <Route path="/database" element={<Navigate to="/database/tutors" />} />
          <Route path="/database/tutors" element={<Tutors />} />
          {/* <Route path="/database/tutors/:id" element={<TutorDetails />} />
          <Route path="/database/tutors/edit/:id" element={<TutorEdit />} />
          <Route path="/database/tutors/match/:id" element={<TutorMatch />} /> */}
          <Route path="/database/learners" element={<Learners />} />
          {/* <Route path="/database/learners/:id" element={<LearnerDetails />} />
          <Route path="/database/learners/edit/:id" element={<LearnerEdit />} />
          <Route path="/database/users" element={<Users />} />
          <Route path="/database/users/:id" element={<UserDetails />} />
          <Route path="/database/users/edit/:id" element={<UserEdit />} /> */}
          <Route path="/database/matches" element={<Matches />} />
          <Route path="/forms" element={<Navigate to="/forms/tutor" />} />
          <Route path="/forms/tutor" element={<TutorForm />} />
          <Route path="/forms/learner" element={<LearnerForm />} />
          {/* <Route path="/conversation" element={<Navigate to="/conversation/1" />} />
          <Route path="/conversation/1" element={<Conversation />} />
          <Route path="/conversation/2" element={<Conversation />} />
          <Route path="/conversation/3" element={<Conversation />} />
          <Route path="/conversation/4" element={<Conversation />} /> */}
        </Routes>
    </BrowserRouter>
  );
}

export default App;
