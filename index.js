"use strict";

const inquirer = require('inquirer');
const q = require('./helpers/query');
require('dotenv').config();
const cTable = require('console.table');

const db = q.init(process.env.DB_database); // input eventually obtained from user thru Inquirer

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

db.end();

// TODO: prepare Inquirer menu and figure out how I will respond to it

/**
 * Sequence of events
 *
 * 1. Prompt user for database name to create. If it already exists give him a change to change it
 * 2. Create the database, the tables, and seed the tables with data
 * 3. Present the menu of options to the user, and react accordingly.
*/

