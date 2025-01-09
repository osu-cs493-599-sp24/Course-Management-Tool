const sequelize = require('../lib/sequelize');
const { User, Courses, Assignments, Submissions, Enrollments } = require('../models');
const initialData = require('../data/initial-data');

async function migrate() {
  try {
    // Force sync in development only
    await sequelize.sync({ force: process.env.NODE_ENV === 'development' });
    
    // Seed initial data
    if (process.env.NODE_ENV === 'development') {
      await User.bulkCreate(initialData.users);
      await Courses.bulkCreate(initialData.courses);
      await Assignments.bulkCreate(initialData.assignments);
      await Enrollments.bulkCreate(initialData.enrollments);
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrate();