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
      isFinished = true;
    } else {
      // switch block to call correct DB function
      switch (answer.crud) {
        case "View All Employees":
          await q.viewEmployees(db);
          break;
        case "Add Employee":
          // need to get more info from user
          await q.addEmployee(db);
          break;
        case "Update Employee Role":
          // need to get more info from user
          await q.updateRole(db);
          break;
        case "View All Roles":
          await q.viewRoles(db);
          break;
        case "Add Role":
          // need to get more info from user
          await q.addRole(db);
          break;
        case "View All Departments":
          await q.viewDepts(db);
          break;
        case "Add Department":
          // need to get more info from user
          await q.addDept(db);
          break;
      }
    }
  }

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
