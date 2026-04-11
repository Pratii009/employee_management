import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, TextField, Button, Box, Alert } from '@mui/material';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', credentials);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Auto redirect based on role
      if (response.data.user.role === 'admin') {
        navigate('/admin');
      } else if (response.data.user.role === 'manager') {
        navigate('/manager');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, height: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper elevation={12} sx={{ p: 5, width: '100%', maxWidth: 400 }}>
        <Typography variant="h4" align="center" gutterBottom color="primary">
          Brahmaputra Performance System
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            sx={{ mb: 3 }}
          />
          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            size="large"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
          
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1, textAlign: 'center' }}>
            <Typography variant="body2" fontWeight="bold">
              Admin: admin@brahmaputra.gov.in / admin123
            </Typography>
            <Typography variant="body2">
              Manager: manager@brahmaputra.gov.in / manager123
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;