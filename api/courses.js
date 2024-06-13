const router = require('express').Router()
const path = require("path");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const courses = require('../data/Courses.json')
const { Courses, CoursesFields} = require('../model/courses')
const { Enrollments } = require('../model/enrollments')
const { User } = require('../model/users')

exports.router = router
exports.courses = courses

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