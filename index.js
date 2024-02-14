"use strict";

const inquirer = require('inquirer');
const mysql = require('mysql2');
const q = require('./helpers/query');
require('dotenv').config();
const cTable = require('console.table');

///////////////////////////////////////////////////////////////////////////////
//                            Function Definitions                           //
///////////////////////////////////////////////////////////////////////////////

// get database name and create it if necessary (or confirm overwrite)
const initialize = async () => {
  let dbName;

  try {
    const { dbName } = await inquirer.prompt([{
      type: 'input', name: 'dbName', message: "Choose a database (if it exists it will be overwritten!)"
    }]);

    // TODO use q.dbExists to check if it already exists and then confirm with user

  } catch (err) {
    console.log(err);
  }

  // create database and "load" it
  db.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`, err => {
    if (err) console.log(err);
  });
  db.query(`USE ${dbName}`, err => {
    if (err) console.log(err);
  });

  // initialize and seed tables
  // eventually can use dbExists() function to determine if that is necessary
  q.init(db);
}

// prompt user for database CRUD operations
const main = async () => {
  let answer, isFinished = false;  // user responses
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

  while (!isFinished) {
    // prompt user for DB actions
    const answer = await inquirer.prompt([
      { name: "crud", type: "list", message: "What would you like to do?", choices: options }
    ]);

    if (answer.crud == "Quit") {
      isFinished = true;
    } else {
      // switch block to call correct DB function
      console.log(`You chose ${answer.crud}`);
    }
  }

  db.end();  // maybe move this elsewhere once I promisify mysql2?
}

///////////////////////////////////////////////////////////////////////////////
//                           Executible Statements                           //
///////////////////////////////////////////////////////////////////////////////

// establish connection to MySQL
const db = mysql.createConnection({
  host: process.env.DB_host,
  user: process.env.DB_user,
  password: process.env.DB_password
});

// initialize();

main();

// TODO need to switch mysql2 to promisified version before ending with the line below
// db.end();

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
