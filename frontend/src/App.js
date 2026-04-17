
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import ManagerDashboard from './components/ManagerDashboard';

// Wrapper for protected routes
const ProtectedRoute = ({ children, requiredRole }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return user && user.role === requiredRole ? children : <Navigate to="/" />;
};

// Main App with Router at ROOT
const AppContent = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/manager" element={<ProtectedRoute requiredRole="manager"><ManagerDashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8' }}>
        <AppContent />
      </div>
    </Router>
  );
};

export default App;
// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }


// export default App;



// // import React, { useState } from 'react';
// // import axios from 'axios';
// // import './App.css';

// // function App() {
// //   const [email, setEmail] = useState('');
// //   const [password, setPassword] = useState('');
// //   const [token, setToken] = useState('');
// //   const [user, setUser] = useState(null);
// //   const [error, setError] = useState('');

// //   const handleLogin = async (e) => {
// //     e.preventDefault();
// //     try {
// //       setError('');
// //       const response = await axios.post('http://localhost:5000/api/auth/login', {
// //         email,
// //         password
// //       });
      
// //       setToken(response.data.token);
// //       setUser(response.data.user);
// //       localStorage.setToken = response.data.token; // Save token
// //       console.log('Login Success:', response.data.user);
// //     } catch (err) {
// //       setError(err.response?.data?.error || 'Login failed');
// //       console.error('Login Error:', err);
// //     }
// //   };

// //   const handleRegister = async (e) => {
// //     e.preventDefault();
// //     try {
// //       setError('');
// //       await axios.post('http://localhost:5000/api/auth/register', {
// //         name: 'Test User',
// //         email,
// //         password,
// //         role: 'hq_staff',
// //         unit: 'Headquarters'
// //       });
// //       alert('Registration successful! Now login.');
// //     } catch (err) {
// //       setError(err.response?.data?.error || 'Registration failed');
// //     }
// //   };

// //   if (token && user) {
// //     return (
// //       <div className="App">
// //         <h1>✅ Brahmaputra Performance System</h1>
// //         <p>Welcome {user.name}! Role: {user.role}</p>
// //         <p>Token: {token.substring(0, 20)}...</p>
// //         <button onClick={() => {setToken(''); setUser(null);}}>Logout</button>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="App">
// //       <header className="App-header">
// //         <h1>🏛️ Brahmaputra Board Performance System</h1>
        
// //         {error && <p style={{color: 'red'}}>{error}</p>}
        
// //         <form onSubmit={handleRegister} style={{marginBottom: '20px'}}>
// //           <h3>Register New User</h3>
// //           <input
// //             type="email"
// //             placeholder="Email"
// //             value={email}
// //             onChange={(e) => setEmail(e.target.value)}
// //             required
// //           />
// //           <input
// //             type="password"
// //             placeholder="Password"
// //             value={password}
// //             onChange={(e) => setPassword(e.target.value)}
// //             required
// //           />
// //           <button type="submit">Register</button>
// //         </form>

// //         <form onSubmit={handleLogin}>
// //           <h3>Login</h3>
// //           <input
// //             type="email"
// //             placeholder="pratiksha@brahmaputra.gov.in"
// //             value={email}
// //             onChange={(e) => setEmail(e.target.value)}
// //             required
// //           />
// //           <input
// //             type="password"
// //             placeholder="123456"
// //             value={password}
// //             onChange={(e) => setPassword(e.target.value)}
// //             required
// //           />
// //           <button type="submit">Login</button>
// //         </form>
// //       </header>
// //     </div>
// //   );
// // }

// // export default App;


