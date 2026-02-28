// MongoDB initialization script for Docker
db = db.getSiblingDB('learnhub');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email', 'password', 'type'],
      properties: {
        name: { bsonType: 'string' },
        email: { bsonType: 'string' },
        password: { bsonType: 'string' },
        type: { enum: ['Admin', 'Student', 'Teacher'] }
      }
    }
  }
});

db.createCollection('courses');
db.createCollection('coursepayments');
db.createCollection('enrolledcourses');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.courses.createIndex({ C_educator: 1 });
db.courses.createIndex({ C_categories: 1 });
db.courses.createIndex({ C_title: 'text', C_description: 'text' });
db.enrolledcourses.createIndex({ odUserId: 1 });
db.enrolledcourses.createIndex({ odCourseId: 1 });
db.coursepayments.createIndex({ odUserId: 1 });
db.coursepayments.createIndex({ odPaymentStatus: 1 });

// Create default admin user (password: Admin@123)
db.users.insertOne({
  name: 'Admin',
  email: 'admin@learnhub.com',
  password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu0ny', // Admin@123
  type: 'Admin',
  status: 'Active',
  profileImage: '',
  createdAt: new Date(),
  updatedAt: new Date()
});

print('Database initialized successfully!');
