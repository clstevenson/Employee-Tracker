"use strict";

const inquirer = require('inquirer');
const mysql = require('mysql2/promise');
const { DepartmentTbl, RoleTbl, EmployeeTbl } = require('./lib/classes');
require('dotenv').config();
const cTable = require('console.table');

///////////////////////////////////////////////////////////////////////////////
//                            Function Definitions                           //
///////////////////////////////////////////////////////////////////////////////

const main = async () => {
  let answer, input, isFinished = false;  // user responses
  var deptList = [], roleList = [], employeeList = []; // current lists from DB
  const options = [ // CRUD options for user
    "View All Departments",
    "View All Roles",
    "View All Employees",
    "Add Department",
    "Add Role",
    "Add Employee",
    "Update Employee Role",
    "Quit"
  ];

  // connect with MySQL system
  const db = await mysql.createConnection({
    host: process.env.DB_host,
    user: process.env.DB_user,
    password: process.env.DB_password
  });

  // get database name from user and create it and the tables
  try {
    const { dbName } = await inquirer.prompt([{
      type: 'input', name: 'dbName', message: "Choose a database (if it exists it will be overwritten!)"
    }]);

    // initialize and seed tables
    var departments = new DepartmentTbl(dbName);
    var roles = new RoleTbl(dbName);
    var employees = new EmployeeTbl(dbName);
    await departments.create(db);
    await roles.create(db);
    await employees.create(db);
    await departments.seed(db);
    await roles.seed(db);
    await employees.seed(db);

  } catch (err) {
    console.log(err);
  }

  // prompt user for CRUD operations (or allow to quit)
  while (!isFinished) {
    // prompt user for DB actions
    const answer = await inquirer.prompt([
      { name: "crud", type: "list", message: "What would you like to do?", choices: options }
    ]);

    if (answer.crud == "Quit") {
      isFinished = true; // to break out of WHILE loop
    } else {
      // switch block to call correct DB function
      switch (answer.crud) {
        case "View All Employees":
          await employees.view(db);
          break;
        case "Add Employee":
          // get the current list of employees and roles
          roleList = await roles.list(db);
          employeeList = await employees.list(db);
          // collect info from user
          const { firstName } = await inquirer.prompt([
            { name: "firstName", type: "input", message: "What is the employee's first name?" }
          ]);
          const { lastName } = await inquirer.prompt([
            { name: "lastName", type: "input", message: "What is the employee's last name?" }
          ]);
          const { employeeRole } = await inquirer.prompt([
            {
              name: "employeeRole", type: "list",
              message: "What is the employee's role?",
              choices: roleList
            }
          ]);
          const { managerFullName } = await inquirer.prompt([
            {
              name: "managerFullName", type: "list",
              message: "Who is the employee's manager?",
              choices: employeeList
            }
          ]);
          // add the employee to the list
          await employees.add(db, { firstName, lastName, title: employeeRole, managerFullName });
          break;
        case "Update Employee Role":
          // get a list of all employees as an array
          employeeList = await employees.list(db);
          // get a list of all possible (new) roles as an array
          roleList = await roles.list(db);
          // need to get the following info: fullName, title
          const { name } = await inquirer.prompt([
            {
              name: "name", type: "list",
              message: "Select an employee whose role you wish to update.",
              choices: employeeList
            }
          ]);
          const { role } = await inquirer.prompt([
            {
              name: "role", type: "list",
              message: "Select the new role for the employee",
              choices: roleList
            }
          ]);
          // update the role in the DB
          await roles.update(db, { name, role });
          break;
        case "View All Roles":
          await roles.view(db);
          break;
        case "Add Role":
          // retrieve list of department as array
          deptList = await departments.list(db);
          // from user need title, salary, dept (properties of input object)
          const { title } = await inquirer.prompt([
            { name: "title", type: "input", message: "What is the name of the role?" }
          ]);
          const { salary } = await inquirer.prompt([
            { name: "salary", type: "number", message: "What is the salary of the role?" }
          ]);
          const { dept } = await inquirer.prompt([
            {
              name: "dept", type: "list",
              message: "Which department does the role below to?",
              choices: deptList
            }
          ]);
          // now add the role to the DB
          await roles.add(db, { title, salary, dept });
          break;
        case "View All Departments":
          await departments.view(db);
          break;
        case "Add Department":
          input = await inquirer.prompt([
            { name: "dept", type: "input", message: "Name of new department?" }
          ]);
          await departments.add(db, input);
          break;
      } // end ELSE block
    } // end IF block
  } // end WHILE loop

  // close MySQL connection
  db.end();
}

// start the app
main();
