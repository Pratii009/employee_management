import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Container, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, Chip, Box 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [kpis, setKpis] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (!token || !savedUser) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(savedUser));
    loadKPIs(token);
  }, [navigate]);

  const loadKPIs = async (token) => {
    try {
      // Mock KPIs for now (replace with real API)
      const mockKPIs = [
        {
          category: 'hq_staff',
          metrics: [
            { name: 'File Disposal Rate', target: 60, achieved: 45, score: 75 },
            { name: 'Turnaround Time', target: 3, achieved: 4, score: 65 },
            { name: 'Digital Adoption', target: 100, achieved: 80, score: 80 }
          ],
          totalScore: 74,
          period: 'March 2026'
        }
      ];
      setKpis(mockKPIs);
    } catch (error) {
      console.error('Error loading KPIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading || !user) return <div>Loading Dashboard...</div>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Performance Dashboard
          </Typography>
          <Chip label={`Score: ${kpis[0]?.totalScore || 0}/100`} color="primary" size="large" />
        </Box>
        
        <Typography variant="h6" gutterBottom>
          Welcome {user.name} ({user.role.toUpperCase()})
        </Typography>
        
        <Button 
          variant="contained" 
          color="error" 
          onClick={handleLogout}
          sx={{ mb: 3 }}
        >
          Logout
        </Button>
      </Paper>

      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Metric</TableCell>
                <TableCell align="right">Target</TableCell>
                <TableCell align="right">Achieved</TableCell>
                <TableCell align="right">Score (%)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {kpis[0]?.metrics.map((metric, index) => (
                <TableRow key={index}>
                  <TableCell>{metric.name}</TableCell>
                  <TableCell align="right">{metric.target}</TableCell>
                  <TableCell align="right">{metric.achieved}</TableCell>
                  <TableCell align="right">
                    <Chip label={`${metric.score}%`} color={metric.score > 70 ? 'success' : 'warning'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default Dashboard;
