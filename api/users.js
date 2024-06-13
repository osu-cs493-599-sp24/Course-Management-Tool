const { Router } = require('express')
const { Assignments } = require('../model/assignments')
const { Courses } = require('../model/courses')
const { User, userFields } = require('../model/users')
const { requireAuthentication } = require('../lib/auth');
const { Enrollments } = require('../model/relationship');
// const jwt = require('jsonwebtoken');
const { ValidationError } = require('sequelize')
const auth = require('../lib/auth');  // Import the auth module

const router = Router();

/*
 * Route to list all of a user's businesses.
 */


router.post("/", async function (req, res, next) {
    try {
      const user = await User.create(req.body,userFields);
      res.status(201).send({ id: user.id, message: 'User added successfully!' });
    } catch (e) {
      if (e instanceof ValidationError) {
        res.status(400).send({ error: e.message });
      } else {
        next(e);
      }
    }
  });

router.post('/login', async function (req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user || !user.verifyPassword(password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    // const token = jwt.sign({ sub: user.id , admin: user.admin}, process.env.JWT_SECRET, { expiresIn: '24h' });
    const token = auth.generateAuthToken(user.id, user.admin);
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
})


// router.get('/:id', async function (req, res, next) {
//     const userId = parseInt(req.params.id);
//     console.log("userId", userId);
  
//     try {
//       // Fetch the user data including courses they are enrolled in or teaching
//       const user = await User.findByPk(userId, {
//         include: [
//           {
//             model: Enrollments,
//             as: 'userEnrollments', // Use the correct alias for user enrollments
//             include: [
//               {
//                 model: Courses,
//                 as: 'Course' // Correct alias for courses in enrollments
//               }
//             ]
//           },
//           {
//             model: Courses,
//             as: 'teachingCourses' // Use the correct alias for teaching courses
//           }
//         ]
//       });
  
//       console.log("user: ", user);
//       if (!user) {
//         return res.status(404).json({ error: 'User not found' });
//       }
  
//       // Customize the response to include relevant courses based on role
//       const response = {
//         userID: user.userID,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         username: user.username,
//         role: user.role,
//         email: user.email,
//         enrolledCourses: user.userEnrollments.map(enrollment => enrollment.Course),
//         teachingCourses: user.teachingCourses
//       };
//       console.log("response", response);
//       res.status(200).json(response);
//     } catch (error) {
//       console.error('Error fetching user data:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   });
  
module.exports = router
