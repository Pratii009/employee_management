import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Alert,
  Fade,
  CircularProgress,
  Divider 
} from '@mui/material';
import {
  Login as LoginIcon,
  Security,
  Email,
  Key
} from '@mui/icons-material';

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
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03' fill-rule='nonzero'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}
      />

      <Container maxWidth="sm">
        <Fade in={true} timeout={800}>
          <Paper
            elevation={24}
            sx={{
              p: { xs: 4, md: 6 },
              width: '100%',
              maxWidth: 450,
              backdropFilter: 'blur(20px)',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c)',
                backgroundSize: '300% 300%',
                animation: 'gradientShift 3s ease infinite'
              }
            }}
          >
            <style jsx>{`
              @keyframes gradientShift {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
              }
            `}</style>

            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)'
                }}
              >
                <LoginIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  mb: 1
                }}
              >
                Brahmaputra
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'grey.600',
                  fontWeight: 500,
                  letterSpacing: '0.5px'
                }}
              >
                Performance System
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Fade in={!!error}>
                <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
                  {error}
                </Alert>
              </Fade>
            )}

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: 'rgba(248, 250, 252, 0.8)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)',
                      backgroundColor: 'rgba(248, 250, 252, 1)'
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                      backgroundColor: 'white'
                    }
                  }
                }}
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'grey.400', fontSize: 20 }} />
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                sx={{ 
                  mb: 4,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: 'rgba(248, 250, 252, 0.8)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)',
                      backgroundColor: 'rgba(248, 250, 252, 1)'
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                      backgroundColor: 'white'
                    }
                  }
                }}
                InputProps={{
                  startAdornment: <Key sx={{ mr: 1, color: 'grey.400', fontSize: 20 }} />
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 2,
                  borderRadius: 3,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(102, 126, 234, 0.6)',
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                  },
                  '&:disabled': {
                    background: 'grey.400',
                    transform: 'none',
                    boxShadow: 'none'
                  }
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Signing In...
                  </>
                ) : (
                  <>
                    <Security sx={{ mr: 1 }} />
                    Sign In
                  </>
                )}
              </Button>
            </Box>

            {/* Demo Credentials */}
            <Divider sx={{ my: 4, borderColor: 'grey.200' }} />
            <Box sx={{ 
              p: 3, 
              bgcolor: 'grey.50', 
              borderRadius: 3, 
              textAlign: 'center',
              border: '1px solid',
              borderColor: 'grey.200'
            }}>
              <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600, color: 'grey.700' }}>
                Demo Credentials
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ color: 'grey.600', fontFamily: 'monospace' }}>
                  👨‍💼 Admin: admin@brahmaputra.gov.in / admin123
                </Typography>
                <Typography variant="body2" sx={{ color: 'grey.600', fontFamily: 'monospace' }}>
                  👨‍💼 Manager: manager@brahmaputra.gov.in / manager123
                </Typography>
              </Box>
            </Box>
          </Paper>
          </Fade>
        </Container>
        
      </Box>
    );
};

export default Login;