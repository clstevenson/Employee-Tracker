"use strict";

const inquirer = require('inquirer');
const q = require('./helpers/query');
require('dotenv').config();
const cTable = require('console.table');

const db = q.init(process.env.DB_database); // input eventually obtained from user thru Inquirer

q.viewDepts(db);

q.viewRoles(db);

db.end();

// TODO: prepare Inquirer menu and figure out how I will respond to it

/**
 * Sequence of events
 *
 * 1. Prompt user for database name to create. If it already exists give him a change to change it
 * 2. Create the database, the tables, and seed the tables with data
 * 3. Present the menu of options to the user, and react accordingly.
*/

