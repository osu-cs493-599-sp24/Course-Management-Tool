const { Router, response } = require("express");
const { Courses } = require("../model/courses");
const { User, userFields } = require("../model/users");
const { Enrollments } = require("../model/enrollments");
// const { Enrollments } = require('../model/relationship'); // Import the relationships
const auth = require("../lib/auth"); // Import the auth module
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = Router();
/*
 * Route to list all of a user's businesses.
 */

router.post("/", auth.requireAuthentication, async (req, res, next) => {
  try {
    const { firstName, lastName, username, role, email, password } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !username || !role || !email || !password) {
      return res.status(400).json({
        error:
          "All fields (firstName, lastName, username, role, email, password) are required.",
      });
    }
    console.log(":req.role", req.role);
    console.log(typeof role);

    // Check if the user is trying to create an 'admin' or 'instructor' role
    if (req.role == "instructor" || req.role == "admin") {
      console.log("Creating the new user...");
      // Hash the password
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

      const newUser = await User.create({
        firstName,
        lastName,
        username,
        role,
        email,
        password: hashedPassword, // Store the hashed password
      });
      res
        .status(201)
        .json({ id: newUser.userID, message: "User created successfully!" });
    } else {
      console.log("can't create the user");
      return res.status(403).json({
        error:
          "Admin permissions required to create 'admin' or 'instructor' roles.",
      });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async function (req, res) {
  try {
    const { email, password } = req.body;
    console.log("req.body::", req.body);
    const user = await User.findByEmail(email);
    console.log("user", user);

    if (!user) {
      return res.status(401).json({ error: "no such user" });
    }
    console.log("password, user.password", user.password, password);
    //Verify password
    const isMatch = bcrypt.compare(String(password), String(user.password));
    if (!isMatch) {
      console.log("match, user.password", user.password);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate token
    const token = auth.generateAuthToken(user.userID, user.role);
    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



router.get("/:id", async function (req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      include: [
        {
          model: Courses,
          as: "Courses", // Ensure this alias matches your Sequelize relationship definition
        },
      ],
    });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Fetching user failed:", error);
    next(error);
  }
});
module.exports = router;
