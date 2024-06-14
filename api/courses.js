const router = require('express').Router()
const path = require("path");
const { ValidationError } = require('sequelize')
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const courses = require('../data/Courses.json')
const { Courses, CoursesFields} = require('../model/courses')
const { Assignments } = require('../model/assignments')
const { Enrollments } = require('../model/enrollments')
const { User } = require('../model/users')

exports.router = router
exports.courses = courses

router.post('/', async function (req, res, next) {
    try {
        const course = await Courses.create(req.body, CoursesFields)
        res.status(201).send({ id: course.courseId })
    } catch(e) {
        if (e instanceof ValidationError) {
            res.status(400).send({ error: e.message })
        } else {
            next(e)
        }
        
    }
})

router.post('/:id/students', async (req, res) => {
    const courseId = parseInt(req.params.id);
    const { add, remove } = req.body;
  
    try {
      const course = await Courses.findByPk(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }
  
      if (add && add.length > 0) {
        await Enrollments.bulkCreate(
          add.map(userId => ({
            userId,
            courseId
          })),
          { ignoreDuplicates: true }
        );
      }
  
      if (remove && remove.length > 0) {
        await Enrollments.destroy({
          where: {
            courseId,
            userId: remove
          }
        });
      }
  
      res.status(200).json({ message: 'Enrollment updated successfully' });
    } catch (error) {
      console.error('Failed to update enrollments:', error);
      res.status(500).json({ error: 'Failed to update enrollments' });
    }
});

router.get('/', async function (req, res, next) {
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
router.get('/:courseId', async function (req, res, next) {
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
router.get("/:courseId/students", async function (req, res, next) {
    try {
      const courseId = parseInt(req.params.courseId); // Ensure courseId is a number

      let page = parseInt(req.query.page) || 1
      page = page < 1 ? 1 : page
      const pageSize = 5
      const offset = (page - 1) * pageSize
  
      if (isNaN(courseId)) {
        return res.status(400).send({ error: "Invalid course ID" });
      }
  
      const students = await Courses.findByPk(courseId, {
        include: [{ 
            model: User, 
            attributes: ["userID", "firstName", "lastName", "email"],
            through: { attributes: [] }
        }],
        limit: pageSize,
        subQuery: false,
        offset: offset,
        attributes: ["subjectCode", "courseNumber", "title", "instructorId"]
      })
  
      if (students.length === 0) {
        return res
          .status(404)
          .send({ message: "No students found for this course." });
      }
  
      res.status(200).send(students);
    } catch (e) {
      next(e);
    }
  });

// get roster of students enrolled in course
router.get('/:id/roster', async function (req, res) {
    const id = parseInt(req.params.id)

    let page = parseInt(req.query.page) || 1
    page = page < 1 ? 1 : page
    const pageSize = 5
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
        attributes: ["subjectCode", "courseNumber", "title", "instructorId"]
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
router.get('/:courseId/assignments', async function (req, res, next) {
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

  // endpoint to update a course
router.patch('/:courseId', async function (req, res, next) {
    const courseId = req.params.courseId
    try {
        const result = await Courses.update(req.body, {
        where: { courseId: courseId },
        fields: CoursesFields
    })
    if (result[0] > 0) {
        res.status(204).send()
    } else {
        next()
    }
    } catch (e) {
    next(e)
    }
})

router.delete('/:courseId', async function (req, res, next) {
    const courseId = req.params.courseId
    const result = await Courses.destroy({ where: { courseId: courseId }})
    if (result > 0) {
        res.status(204).send()
    } else {
        next()
    }
})