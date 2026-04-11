import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Toolbar, AppBar, Typography, IconButton,
  Container, Grid, Card, CardContent, Avatar, Chip, Button, CircularProgress, Alert, Dialog, 
  DialogTitle, DialogContent, DialogActions, TextField, Tabs, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Menu, MenuItem, Divider
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard as DashboardIcon, People as PeopleIcon, Assignment as AssignmentIcon,
  Assessment as AssessmentIcon, Person as PersonIcon, Logout as LogoutIcon, Add as AddIcon,
  Edit as EditIcon, Delete as DeleteIcon
} from '@mui/icons-material';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ totalMembers: 0, totalTasks: 0, completed: 0 });
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '', email: '', phone: '', role: 'employee', department: ''
  });
  const [selectedMember, setSelectedMember] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  // Setup axios
  const token = localStorage.getItem('token');
  if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [userRes, membersRes, tasksRes, statsRes] = await Promise.all([
        axios.get('/api/auth/me'),
        axios.get('/api/manager/team'),
        axios.get('/api/manager/tasks'),
        axios.get('/api/manager/stats')
      ]);
      
      setUser(userRes.data);
      setTeamMembers(membersRes.data);
      setTasks(tasksRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setError(err.response?.status === 401 ? 'Session expired. Please login.' :
                err.response?.status === 404 ? 'Manager features not enabled. Check backend routes.' :
                'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleProfileClick = (event) => setAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);
  const handleViewProfile = () => {
    setProfileDialogOpen(true);
    handleProfileMenuClose();
  };

  const handleAddMemberOpen = () => setAddDialogOpen(true);
  const handleAddMemberClose = () => {
    setAddDialogOpen(false);
    setNewMember({ name: '', email: '', phone: '', role: 'employee', department: '' });
  };

  const handleAddMember = async () => {
    try {
      await axios.post('/api/manager/team', newMember);
      handleAddMemberClose();
      fetchData();
    } catch (err) {
      setError('Failed to add member');
    }
  };

  const handleEditMember = (member) => {
    setSelectedMember(member);
    setEditDialogOpen(true);
  };

  const handleDeleteMember = async (id) => {
    try {
      await axios.delete(`/api/manager/team/${id}`);
      fetchData();
    } catch (err) {
      setError('Failed to delete member');
    }
  };

  const drawerContent = (
    <Box sx={{ width: 280 }}>
      <Toolbar>
        <Typography variant="h6" noWrap>Manager Panel</Typography>
      </Toolbar>
      <Divider />
      <List>
        {[{ text: 'Dashboard', icon: <DashboardIcon /> }, 
           { text: 'Team', icon: <PeopleIcon /> },
           { text: 'Tasks', icon: <AssignmentIcon /> },
           { text: 'Reports', icon: <AssessmentIcon /> }].map((item, index) => (
          <ListItem button key={item.text} selected={activeTab === index} onClick={() => setActiveTab(index)}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem button onClick={handleProfileClick}>
          <ListItemIcon><PersonIcon /></ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItem>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton color="inherit" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>Manager Dashboard</Typography>
          <IconButton color="inherit" onClick={handleProfileClick} sx={{ ml: 1 }}>
            <PersonIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleProfileMenuClose}>
            <MenuItem onClick={handleViewProfile}>View Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: 280 }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 } }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 } }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, width: { sm: `calc(100% - 280px)` } }}>
        <Container maxWidth="xl">
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} action={
              <Button color="inherit" size="small" onClick={fetchData}>RETRY</Button>
            }>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>Manager Dashboard</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddMemberOpen}>
              Add Team Member
            </Button>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary">Total Members</Typography>
                  <Typography variant="h3">{stats.totalMembers}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary">Total Tasks</Typography>
                  <Typography variant="h3">{stats.totalTasks}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary">Completed</Typography>
                  <Typography variant="h3">{stats.completed}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabs */}
          <Paper sx={{ mb: 4 }}>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
              <Tab label="Team Members" />
              <Tab label="Tasks" />
              <Tab label="Reports" />
            </Tabs>

            {/* Team Members */}
            {activeTab === 0 && (
              <Box sx={{ p: 3 }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Department</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {teamMembers.map(member => (
                        <TableRow key={member._id}>
                          <TableCell>{member.name}</TableCell>
                          <TableCell>{member.email}</TableCell>
                          <TableCell>{member.phone}</TableCell>
                          <TableCell>{member.role}</TableCell>
                          <TableCell>{member.department}</TableCell>
                          <TableCell>
                            <IconButton onClick={() => handleEditMember(member)}><EditIcon /></IconButton>
                            <IconButton onClick={() => handleDeleteMember(member._id)} color="error"><DeleteIcon /></IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Tasks */}
            {activeTab === 1 && (
              <Box sx={{ p: 3 }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Task</TableCell>
                        <TableCell>Assigned To</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Due Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tasks.map(task => (
                        <TableRow key={task._id}>
                          <TableCell>{task.title}</TableCell>
                          <TableCell>{task.assignedTo?.name || 'Unassigned'}</TableCell>
                          <TableCell>
                            <Chip label={task.status} color={task.status === 'completed' ? 'success' : 'default'} />
                          </TableCell>
                          <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Reports */}
            {activeTab === 2 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6">Performance Reports</Typography>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12} md={6}>
                    <Card><CardContent>Weekly Progress: 85%</CardContent></Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card><CardContent>Team Productivity: 4.2 avg tasks</CardContent></Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </Container>
      </Box>

      {/* Add Member Dialog */}
      <Dialog open={addDialogOpen} onClose={handleAddMemberClose}>
        <DialogTitle>Add New Team Member</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Name" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} sx={{mt:2}} />
          <TextField fullWidth label="Email" type="email" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} sx={{mt:2}} />
          <TextField fullWidth label="Phone" value={newMember.phone} onChange={e => setNewMember({...newMember, phone: e.target.value})} sx={{mt:2}} />
          <TextField fullWidth label="Department" value={newMember.department} onChange={e => setNewMember({...newMember, department: e.target.value})} sx={{mt:2}} />
          <TextField fullWidth label="Role" select value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})} sx={{mt:2}}>
            <MenuItem value="employee">Employee</MenuItem>
            <MenuItem value="senior">Senior</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddMemberClose}>Cancel</Button>
          <Button onClick={handleAddMember} variant="contained">Add Member</Button>
        </DialogActions>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog open={profileDialogOpen} onClose={() => setProfileDialogOpen(false)}>
        <DialogTitle>Manager Profile</DialogTitle>
        <DialogContent>
          {user && (
            <Box>
              <Typography><strong>Name:</strong> {user.name}</Typography>
              <Typography><strong>Email:</strong> {user.email}</Typography>
              <Typography><strong>Role:</strong> {user.role}</Typography>
              <Typography><strong>Department:</strong> {user.department}</Typography>
              <Typography><strong>Joined:</strong> {new Date(user.date).toLocaleDateString()}</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ManagerDashboard;