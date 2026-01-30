import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './pages/login.jsx';
import CreateAccount from './pages/createAccount.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/create" element={<CreateAccount />} />
        
        {/* Future pages can be added here like this: */}
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;