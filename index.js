"use strict";

const inquirer = require('inquirer');
const mysql = require('mysql2/promise');
const { DepartmentTbl, RoleTbl, EmployeeTbl } = require('./lib/classes');
require('dotenv').config();
const cTable = require('console.table');

/**
 * Main Function: main()
 * - starts and ends the connection with the DB engine, passing the connection object to
 * the functions that need it
 *
 * - runs Inquirer, collecting information from the user. Specifically, collects name of DB
 * to use, creates it, and then presents user with a menu of other CRUD options
 *
 * - creates instances of three objects, each representing the three tables in the DB. Class
 * methods of those objects are called as needed to run CRUD operations. The tables are created
 * when the objects are first created.
 */

const main = async () => {
  let answer, isFinished = false;  // user responses
  let deptList = [], roleList = [], employeeList = []; // generated on the fly in switch block
  let firstName, lastName, fullName, managerFullName, employeeRole, salary, dept; // switch block vars
  const options = [ // CRUD options for user
    'View All Departments',
    'View All Roles',
    'View All Employees',
    'Add Department',
    'Add Role',
    'Add Employee',
    'Update Employee Role',
    'Quit'
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
      type: 'input', name: 'dbName', message: 'Choose a database (if it exists it will be overwritten!)'
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
    answer = await inquirer.prompt([
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
          answer = await inquirer.prompt([
            { name: "firstName", type: "input", message: "What is the employee's first name?" }
          ]);
          firstName = answer.firstName; // destructuring inquirer responses seems to cause compiler problems
          answer = await inquirer.prompt([
            { name: "lastName", type: "input", message: "What is the employee's last name?" }
          ]);
          lastName = answer.lastName;
          answer = await inquirer.prompt([
            {
              name: "employeeRole", type: "list",
              message: "What is the employee's role?",
              choices: roleList
            }
          ]);
          employeeRole = answer.employeeRole;
          answer = await inquirer.prompt([
            {
              name: "managerFullName", type: "list",
              message: "Who is the employee's manager?",
              choices: employeeList
            }
          ]);
          managerFullName = answer.managerFullName;
          // add the employee to the list
          await employees.add(db, { firstName, lastName, title: employeeRole, managerFullName });
          break;
        case "Update Employee Role":
          // get a list of all employees as an array
          employeeList = await employees.list(db);
          // get a list of all possible (new) roles as an array
          roleList = await roles.list(db);
          // need to get the following info: fullName, title
          answer = await inquirer.prompt([
            {
              name: "fullName", type: "list",
              message: "Select an employee whose role you wish to update.",
              choices: employeeList
            }
          ]);
          fullName = answer.fullName;
          answer = await inquirer.prompt([
            {
              name: "employeeRole", type: "list",
              message: "Select the new role for the employee",
              choices: roleList
            }
          ]);
          employeeRole = answer.employeeRole;
          // update the role in the DB
          await roles.update(db, { name, role: employeeRole });
          break;
        case "View All Roles":
          await roles.view(db);
          break;
        case "Add Role":
          // retrieve list of department as array
          deptList = await departments.list(db);
          // from user need title, salary, dept (properties of input object)
          answer = await inquirer.prompt([
            { name: "employeeRole", type: "input", message: "What is the name of the role?" }
          ]);
          employeeRole = answer.employeeRole;
          answer = await inquirer.prompt([
            { name: "salary", type: "number", message: "What is the salary of the role?" }
          ]);
          salary = answer.salary;
          answer = await inquirer.prompt([
            {
              name: "dept", type: "list",
              message: "Which department does the role below to?",
              choices: deptList
            }
          ]);
          dept = answer.dept;
          // now add the role to the DB
          await roles.add(db, { title: employeeRole, salary, dept });
          break;
        case "View All Departments":
          await departments.view(db);
          break;
        case "Add Department":
          answer = await inquirer.prompt([
            { name: "dept", type: "input", message: "Name of new department?" }
          ]);
          await departments.add(db, answer);
          break;
      } // end ELSE block
    } // end IF block
  } // end WHILE loop

  // close MySQL connection
  db.end();
}

// start the app
main();
