const { Router, response } = require('express');
const { Courses } = require('../model/courses');
const { User, userFields } = require('../model/users');
const { Enrollments } = require('../model/enrollments');
// const { Enrollments } = require('../model/relationship'); // Import the relationships
const auth = require('../lib/auth');  // Import the auth module
const bcrypt = require('bcryptjs');

const router = Router();
/*
 * Route to list all of a user's businesses.
 */

router.post("/", auth.requireAuthentication, auth.requireAdmin, async (req, res, next) => {
  try {
    const { firstName, lastName, username, role, email, password } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !username || !role || !email || !password) {
      return res.status(400).json({ error: "All fields (firstName, lastName, username, role, email, password) are required." });
    }

    // Check if the user is trying to create an 'admin' or 'instructor' role
    if (['admin', 'instructor'].includes(role) && req.role !== 'admin') {
      return res.status(403).json({ error: "Admin permissions required to create 'admin' or 'instructor' roles." });
    }

    // Create user in the database
    const newUser = await User.create({
      firstName,
      lastName,
      username,
      role,
      email,
      password, // The model will handle hashing
    });

    res.status(201).json({ id: newUser.userID, message: "User created successfully!" });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /login - User login
router.post('/login', async function (req, res) {
  try {
    const { email, password } = req.body;

    // Log the incoming request data for debugging
    console.log("Login attempt:", { email, password });

    // Find user by email
    const user = await User.findByEmail(email);

    // Check if user exists and password is correct
    if (!user) {
      console.log("User not found");
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.verifyPassword(password)) {
      console.log("Password verification failed");
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate authentication token
    const token = auth.generateAuthToken(user.userID, user.role);
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// router.get("/:id", async function (req, res, next) {
//   const userId = parseInt(req.params.id); // Extract user ID from request parameters

//   try {
//     // Retrieve user data from the database, including associated Courses
//     const user = await User.findByPk(userId, {
//       include: [
//         {
//           model: Courses,
//           attributes: ['courseId', 'subjectCode', 'courseNumber', 'title'], // Include specific course fields
//         }
//       ],
//     });

//     // If user is not found, return 404 Not Found
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     // Construct the basic response object with essential user fields
//     const response = {
//       userID: user.userID,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       username: user.username,
//       role: user.role,
//       email: user.email,
//       createdAt: user.createdAt,
//       updatedAt: user.updatedAt,
//       courses: user.Courses.map(course => ({
//         courseId: course.courseId,
//         subjectCode: course.subjectCode,
//         courseNumber: course.courseNumber,
//         title: course.title,
//       })),
//     };

//     // If user is an instructor, add teachingCourseIds to the response
//     if (user.role === 'instructor') {
//       response.teachingCourseIds = user.Courses.map(course => course.courseId);
//     }

//     // If user is a student, add enrolledCourseIds to the response
//     if (user.role === 'student') {
//       response.enrolledCourseIds = user.Enrollments.map(enrollment => enrollment.courseId);
//     }

//     // Return the constructed response with appropriate status code
//     res.status(200).json(response);

//   } catch (error) {
//     console.error('Error fetching user data:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

router.get("/:id", async function (req, res, next) {
  const userId = parseInt(req.params.id); // Extract user ID from request parameters

  try {
    const user = await User.findByPk(userId, {
        include: [{
            model: Enrollments,
            as: 'UserEnrollments',
            attributes: ['enrollmentID', 'courseId'],
            include: {
              model: Courses,
              attributes: ['courseId', 'subjectCode', 'courseNumber', 'title'],
          }
        }]
    });

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    let enrollments = [];
        if (user.UserEnrollments && user.UserEnrollments.length > 0) {
          console.log("Enrollments", user.UserEnrollments);
            enrollments = user.UserEnrollments.map(enrollment => ({
                enrollmentID: enrollment.enrollmentID,
                courseId: enrollment.courseId,
                course: {
                  courseId: enrollment.Course.courseId,
                  subjectCode: enrollment.Course.subjectCode,
                  courseNumber: enrollment.Course.courseNumber,
                  title: enrollment.Course.title,
              }
            }));
        }

    const response = {
        userID: user.userID,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        enrollments: enrollments
    };

    res.status(200).json(response);

} catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal server error' });
}
});

module.exports = router