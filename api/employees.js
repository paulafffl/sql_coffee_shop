const express = require('express');
const employeesRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

employeesRouter.get('/', (req, res, next) => {
    db.all(
        `SELECT * FROM Employee WHERE Employee.is_current_employee = 1`, 
        (error, rows) => {
        if(error) {
            next(error);
        } else {
            res.status(200).json({employees : rows});
        }
    });
});

employeesRouter.post('/', (req, res, next) => {
    const name = req.body.employee.name,
            position = req.body.employee.position,
            wage = req.body.employee.wage,
            isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
    if (!name || !position || !wage) {
        return res.sendStatus(400);
    }
    db.run(`INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $isCurrentEmployee)`,
    {
        $name: name,
        $position: position,
        $wage: wage,
        $isCurrentEmployee: isCurrentEmployee
    },
    function (error) {
        if(error) {
            next(error);
        } else {
           db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`, 
           (error, row) => {
               if (error) {
                   next(error);
               } else {
                   res.status(201).json({employee : row});
               }
           });
        }
    });
});

module.exports = employeesRouter;