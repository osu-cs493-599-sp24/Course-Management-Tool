const { Router } = require("express");
const { ValidationError } = require("sequelize");
const { Courses, CoursesFields } = require("../model/courses");
const { User } = require("../model/users");
const { Enrollments } = require("../model/enrollments");
const { Assignments } = require("../model/assignments");

const { off } = require("process");
const express = require("express");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

exports.courses = courses
exports.router = router
const router = Router();

//get all courses
router.get("/", async function (req, res, next) {
  let page = parseInt(req.query.page) || 1;
  page = page < 1 ? 1 : page;
  const numPerPage = 5;
  const offset = (page - 1) * numPerPage;

  try {
    const result = await Courses.findAndCountAll({
      limit: numPerPage,
      offset: offset,
    });
    const lastPage = Math.ceil(result.count / numPerPage);
    const links = {};
    if (page < lastPage) {
      links.nextPage = `/courses?page${page + 1}`;
      links.lastPage = `/courses?page=${lastPage}`;
    }
    if (page > 1) {
      links.nextPage = `/courses?page${page + 1}`;
      links.lastPage = `/courses?page=$1`;
    }

    res.status(200).send({
      courses: result.rows,
      pageNumber: page,
      totalPages: lastPage,
      pageSize: numPerPage,
      totalCount: result.count,
      links: links,
    });
  } catch (e) {
    next(e);
  }
});

//get courses by id
router.get("/:courseId", async function (req, res, next) {
  const courseId = req.params.courseId;
  try {
    const course = await Courses.findByPk(courseId);
    if (course) {
      res.status(200).send(course);
    } else {
      next();
    }
  } catch (e) {
    next(e);
  }
});

//get student that enroll in that course
router.get('/:id/roster', async function (req, res) {
    const id = parseInt(req.params.id)

    let page = parseInt(req.query.page) || 1
    page = page < 1 ? 1 : page
    const pageSize = 10
    const offset = (page - 1) * pageSize

    const result = await Courses.findByPk(id, {
        include: [{ 
            model: User, 
            attributes: ["userID", "firstName", "lastName", "email"],
            through: { attributes: [] }
        }],
        limit: pageSize,
        subQuery: false,
        offset: offset,
        attributes: ["subjectCode", "courseNumber", "title", "instructor"]
    })
    // res.status(200).send({ class: result })

    const users = result.Users.map(user => ({
        userID: user.userID,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
    }));
    
    const csvFilePath = path.join(__dirname, '../data/roster.csv');

    const csvWriter = createCsvWriter({
        path: csvFilePath,
        header: [
            { id:'userID', title: 'User ID' },
            { id: 'firstName', title: 'First Name' },
            { id: 'lastName', title: 'Last Name' },
            { id: 'email', title: 'Email' }
        ]
    });

    await csvWriter.writeRecords(users);

    res.download(csvFilePath, 'roster.csv', (err) => {
        if (err) {
            console.error('Failed to send CSV file', err);
            res.status(500).send({ error: 'Failed to send CSV file' });
        } else {
            // Optionally, delete the file after sending
            // fs.unlink(csvFilePath, (err) => {
            //     if (err) {
            //         console.error('Failed to delete CSV file', err);
            //     }
            // });
        }
    });
})

//get assignments that are in the courses
router.get("/:courseId/assignments", async function (req, res, next) {
  const courseId = parseInt(req.params.courseId); // Convert courseId from params to integer

  if (isNaN(courseId)) {
      return res.status(400).send({ error: "Invalid course ID provided." });
  }

  try {
      const assignments = await Assignments.findAll({
          where: { courseId: courseId }
      });

      if (assignments.length === 0) {
          return res.status(404).send({ message: "No assignments found for this course." });
      }

      res.status(200).send(assignments);
  } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).send({ error: "Internal server error" });
  }
});
module.exports = router;
