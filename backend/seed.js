const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Department = require('./models/Department');
const Project = require('./models/Project');
const TeamMember = require('./models/TeamMember');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI);

const seedUsers = async () => {
  try {
    const adminPass = await bcrypt.hash('admin123', 12);
    const managerPass = await bcrypt.hash('manager123', 12);
    const memberPass = await bcrypt.hash('member123', 12);

    const users = [
      {
        name: 'Super Admin',
        email: 'admin@brahmaputra.gov.in',
        password: adminPass,
        role: 'admin',
        unit: 'HQ'
      },
      {
        name: 'Project Manager',
        email: 'manager1@projects.gov.in',
        password: managerPass,
        role: 'manager',
        unit: 'Division A'
      },
      {
        name: 'HQ Staff',
        email: 'hq@projects.gov.in',
        password: memberPass,
        role: 'hq',
        unit: 'HQ'
      },
      {
        name: 'Supervisor One',
        email: 'supervisor@projects.gov.in',
        password: memberPass,
        role: 'supervisor',
        unit: 'Field Division'
      },
      {
        name: 'Employee One',
        email: 'employee@projects.gov.in',
        password: memberPass,
        role: 'employee',
        unit: 'Division A'
      },
      {
        name: 'Field Engineer One',
        email: 'engineer@projects.gov.in',
        password: memberPass,
        role: 'field_engineer',
        unit: 'Site Office'
      }
    ];

    for (let userData of users) {
      const existing = await User.findOne({ email: userData.email });
      if (!existing) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Created: ${userData.email}`);
      } else {
        console.log(`⏭️ Skip: ${userData.email} already exists`);
      }
    }

    console.log('✅ Users seeded safely!');
  } catch (err) {
    console.error('User seed error:', err);
  }
};

// ✅ Departments (your code - already safe)
const seedDepartments = async () => {
  const govtDepts = [
    'Ministry of Home Affairs', 'Ministry of Finance', 'Ministry of Defence',
    'Ministry of Agriculture', 'Ministry of Health', 'Ministry of Education',
    'Ministry of Commerce', 'Ministry of Railways', 'Ministry of Power',
    'Ministry of Road Transport', 'Ministry of Housing', 'Ministry of Water Resources'
  ];

  console.log('🌟 Seeding Government Departments...');
  for (let deptName of govtDepts) {
    await Department.findOneAndUpdate(
      { name: deptName },
      { name: deptName, description: `${deptName} Projects` },
      { upsert: true }
    );
    console.log(`✅ ${deptName}`);
  }
};

// ✅ Projects (your code - already safe)
const addSampleProjects = async () => {
  try {
    const departments = await Department.find({}).limit(4);
    
    const sampleProjects = [
      {
        name: 'National Highway N1 Upgrade',
        description: '200km highway reconstruction',
        departmentId: departments[0]?._id,
        status: 'Active',
        budget: 50000000
      },
      {
        name: 'District Hospital Expansion',
        description: '500 bed multi-specialty hospital',
        departmentId: departments[1]?._id || departments[0]?._id,
        status: 'Planning',
        budget: 80000000
      },
      {
        name: 'Smart Classroom Initiative',
        description: 'Digital upgrade for 1000 schools',
        departmentId: departments[2]?._id || departments[0]?._id,
        status: 'Planning',
        budget: 30000000
      },
      {
        name: 'Mobile Health Units',
        description: '50 ambulances for rural areas',
        departmentId: departments[3]?._id || departments[0]?._id,
        status: 'Active',
        budget: 15000000
      }
    ];

    for (let projData of sampleProjects) {
      if (projData.departmentId) {
        const existing = await Project.findOne({ 
          name: projData.name, 
          departmentId: projData.departmentId 
        });
        if (!existing) {
          const project = new Project(projData);
          await project.save();
          console.log(`✅ Added: ${projData.name} → ${projData.status}`);
        } else {
          console.log(`⏭️ Skip: ${projData.name}`);
        }
      }
    }
    console.log('🎉 4 Sample Projects Added!');
  } catch (err) {
    console.error('Projects seed error:', err);
  }
};

// ✅ NEW: Safe Team Members (won't delete on restart)
const seedTeamMembers = async () => {
  try {
    const managers = await User.find({ role: 'manager' });
    if (managers.length === 0) {
      console.log('⚠️ No managers found - skipping team members');
      return;
    }

    const sampleTeam = [
      { 
        name: 'John HQ Staff', 
        email: 'john@hq.gov.in',
        role: 'hq', 
        progress: 85, 
        managerId: managers[0]._id,
        kpi: { fileDisposalRate: 85, physicalProgress: 75 },
        suggestion: 'Excellent file clearance rate'
      },
      { 
        name: 'Sarah Supervisor', 
        email: 'sarah@projects.gov.in',
        role: 'supervisor', 
        progress: 60, 
        managerId: managers[0]._id,
        kpi: { fileDisposalRate: 70, physicalProgress: 60 },
        suggestion: 'Good progress, focus on deadlines'
      },
      { 
        name: 'Mike Field Engineer', 
        email: 'mike@field.gov.in',
        role: 'field-engineer', 
        progress: 45, 
        managerId: managers[0]._id,
        kpi: { fileDisposalRate: 50, physicalProgress: 45 },
        suggestion: 'Improve survey accuracy'
      }
    ];

    for (let memberData of sampleTeam) {
      const existing = await TeamMember.findOne({ email: memberData.email });
      if (!existing) {
        const member = new TeamMember(memberData);
        await member.save();
        console.log(`✅ Created team member: ${memberData.name}`);
      } else {
        console.log(`⏭️ Skip team member: ${memberData.name}`);
      }
    }
    console.log('✅ Team members seeded safely!');
  } catch (err) {
    console.error('Team members seed error:', err);
  }
};

// ✅ MAIN SEED FUNCTION - Runs everything safely
const seedAll = async () => {
  try {
    console.log('🚀 Starting SAFE seed (no deletes!)...');
    
    await seedDepartments();
    await seedUsers();
    await addSampleProjects();
    await seedTeamMembers();
    
    console.log('🎉 COMPLETE SEED FINISHED - Data persists on restart!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedAll();