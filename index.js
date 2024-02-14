"use strict";

const inquirer = require('inquirer');
const mysql = require('mysql2/promise');
const q = require('./helpers/query');
require('dotenv').config();
const cTable = require('console.table');

///////////////////////////////////////////////////////////////////////////////
//                            Function Definitions                           //
///////////////////////////////////////////////////////////////////////////////

const main = async () => {
  let answer, input, isFinished = false;  // user responses
  let deptList=[], roleList=[], employeeList=[]; // current lists from DB
  const options = [ // CRUD options for user
    "View All Employees",
    "Add Employee",
    "Update Employee Role",
    "View All Roles",
    "Add Role",
    "View All Departments",
    "Add Department",
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

    // TODO use q.dbExists to check if it already exists and then confirm with user


    // create database and "load" it
    await db.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    await db.query(`USE ${dbName}`);

    // initialize and seed tables
    // eventually can use dbExists() function to determine if that is necessary
    await q.init(db);
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
          await q.viewEmployees(db);
          break;
        case "Add Employee":
          // get the current list of employees and roles
          employeeList = await q.getEmployeeList(db);
          roleList = await q.getRoleList(db);
          // collect info from user
          const { firstName } = await inquirer.prompt([
            { name: "firstName", type: "input", message: "What is the employee's first name?" }
          ]);
          const { lastName } = await inquirer.prompt([
            { name: "lastName", type: "input", message: "What is the employee's last name?" }
          ]);
          const { employeeRole } = await inquirer.prompt([
            { name: "employeeRole", type: "list",
              message: "What is the employee's role?",
              choices: roleList}
          ]);
          const { managerFullName } = await inquirer.prompt([
            { name: "managerFullName", type: "list",
              message: "Who is the employee's manager?",
              choices: employeeList}
          ]);
          // add the employee to the list
          await q.addEmployee(db, { firstName, lastName, title: employeeRole, managerFullName });
          break;
        case "Update Employee Role":
          // get a list of all employees as an array
          employeeList = await q.getEmployeeList(db);
          // get a list of all possible (new) roles as an array
          roleList = await q.getRoleList(db);
          // need to get the following info: fullName, title
          const { name } = await inquirer.prompt([
            { name: "name", type: "list",
              message: "Select an employee whose role you wish to update.",
              choices: employeeList }
          ]);
          const { role } = await inquirer.prompt([
            { name: "role", type: "list",
              message: "Select the new role for the employee",
              choices: roleList }
          ]);
          // update the role in the DB
          await q.updateRole(db, { name, role });
          break;
        case "View All Roles":
          await q.viewRoles(db);
          break;
        case "Add Role":
          // retrieve list of department as array
          deptList = await q.getDeptList(db);
          // from user need title, salary, dept (properties of input object)
          const { title } = await inquirer.prompt([
            { name: "title", type: "input", message: "What is the name of the role?" }
          ]);
          const { salary } = await inquirer.prompt([
            { name: "salary", type: "number", message: "What is the salary of the role?" }
          ]);
          const { dept } = await inquirer.prompt([
            { name: "dept", type: "list",
              message: "Which department does the role below to?",
              choices: deptList }
          ]);
          // now add the role to the DB
          await q.addRole(db, { title, salary, dept });
          break;
        case "View All Departments":
          await q.viewDepts(db);
          break;
        case "Add Department":
          input = await inquirer.prompt([
            { name: "dept", type: "input", message: "Name of new department?" }
          ]);
          await q.addDept(db, input);
          break;
      } // end ELSE block
    } // end IF block
  } // end WHILE loop

  // close MySQL connection
  db.end();
}

// start the app
main();

/**

q.viewDepts(db);

q.viewRoles(db);

q.viewEmployees(db);

// mimic input from Inquirer
let input = {};
input.dept = 'HR';
q.addDept(db, input);

input = {
  title: 'Paralegal',
  salary: 80000,
  dept: 'Legal'
};
q.addRole(db, input);

input = {
  firstName: 'Chris',
  lastName: 'Stevenson',
  title: 'Paralegal',
  managerFullName: 'Denny Zizka'
};
q.addEmployee(db, input);

input = {
  fullName: 'Chris Stevenson',
  title: 'Lead Scientist'
};

q.updateRole(db, input);

**/
// db.end();

// TODO: prepare Inquirer menu and figure out how I will respond to it

/**
 * Sequence of events
 *
 * 1. Prompt user for database name to create. If it already exists give him a change to change it
 * 2. Create the database, the tables, and seed the tables with data
 * 3. Present the menu of options to the user, and react accordingly.
*/
