import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Title from './Title';
import Nav from './Nav';
import Tutors from './components/database/tutors'
import TutorForm from './components/forms/tutors'
// import TutorDetails from './components/database/tutors/details/index.js';
// import TutorEdit from './components/database/tutors/edit/index.js';
// import TutorMatch from './components/database/tutors/match/index.js';
import Matches from './components/database/matches'
import Learners from './components/database/learners'
import LearnerForm from './components/forms/learners'
// import LearnerDetails from './components/database/learners/details/index.js';
// import LearnerEdit from './components/database/learners/edit/index.js';
// import Conversation from './components/conversation/index.js';

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
