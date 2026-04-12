const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Department = require('./models/Department');
const Project = require('./models/Project');  // ✅ ADDED
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI);

async function seedUsers() {
  try {
    // Delete old users (KEEP your logic)
    await User.deleteMany({ role: { $in: ['admin', 'manager'] } });
    
    // Create fresh hashed users (KEEP your logic)
    const adminPass = await bcrypt.hash('admin123', 12);
    const managerPass = await bcrypt.hash('manager123', 12);
    
    await User.insertMany([
      { 
        name: 'Super Admin', 
        email: 'admin@brahmaputra.gov.in', 
        password: adminPass, 
        role: 'admin', 
        unit: 'HQ' 
      },
      { 
        name: 'Project Manager', 
        email: 'manager@brahmaputra.gov.in', 
        password: managerPass, 
        role: 'manager', 
        unit: 'Division A' 
      }
    ]);
    
    console.log('✅ Admin/manager seeded with HASHED passwords');

    // Your existing departments (KEEP)
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

    // ✅ NEW: Add Sample Projects (AFTER departments)
    console.log('🚀 Adding Sample Projects...');
    await addSampleProjects();

    console.log('🎉 COMPLETE SEED FINISHED!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

// ✅ NEW FUNCTION - Sample Projects for existing departments
async function addSampleProjects() {
  try {
    const departments = await Department.find({}).limit(4);  // Use first 4 depts
    
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
      if (projData.departmentId) {  // ✅ Safety check
        const existing = await Project.findOne({ 
          name: projData.name, 
          departmentId: projData.departmentId 
        });
        if (!existing) {
          const project = new Project(projData);
          await project.save();
          console.log(`✅ Added: ${projData.name} → ${projData.status}`);
        } else {
          console.log(`⏭️ Skip: ${projData.name} (already exists)`);
        }
      }
    }
    console.log('🎉 4 Sample Projects Added!');
  } catch (err) {
    console.error('Projects seed error:', err);
  }
}

// Sample team members for managers
const sampleTeam = async () => {
  const managers = await User.find({ role: 'manager' });
  if (managers.length > 0) {
    await TeamMember.insertMany([
      { name: 'John HQ Staff', role: 'hq', progress: 85, managerId: managers[0]._id },
      { name: 'Sarah Supervisor', role: 'supervisor', progress: 60, managerId: managers[0]._id },
      { name: 'Mike Field Engineer', role: 'field-engineer', progress: 45, managerId: managers[0]._id }
    ]);
    console.log('✅ Sample team members added!');
  }
};
sampleTeam();

seedUsers();