"use strict";

/*
 * Create functions for the following
 * viewDepts(), viewRoles(), viewEmployees()
 * addEmployee(empInfo), addRole(roleInfo), addDept(deptInfo)
 * updateRole(roleInfo)
 */

/* Tasks for MVP
 * - View all employees: empl ID, first, last, title, dept, salary, manager
 * - View all roles: job title, role ID, dept, salary
 * -
 * - Add employee
 * - Add role
 * - Add department
 * - Update employee role
*/

const viewDepts = db => {
  // View all departments: dept name and ID
  // call showTable() to display

  const sql = 'select * from department';

  db.query(sql, (err, results) => {
    if (err) console.log(err);
    else console.table(results);
  });
}

module.exports = { viewDepts }
