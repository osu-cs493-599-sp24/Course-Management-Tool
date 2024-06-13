const router = require('express').Router()
const path = require("path");

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
        include: [ User ],
        limit: pageSize,
        subQuery: false,
        offset: offset
    })
    res.status(200).send({ class: result })
})