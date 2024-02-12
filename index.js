"use strict";

const mysql = require('mysql2');
const inquirer = require('inquirer');
const q = require('./helpers/query');
require('dotenv').config();
const cTable = require('console.table');

// eventually this will be replaced by name provieded by user
const dbName = process.env.DB_database;

// connect to DB
const db = mysql.createConnection({
  host: process.env.DB_host,
  user: process.env.DB_user,
  password: process.env.DB_password,
  database: dbName
});

q.viewDepts(db);

db.end();

// TODO: create init() function to initialize the app (items 1-2 below, plus starting the DB connection)

// TODO: prepare Inquirer menu and figure out how I will respond to it

/**
 * Sequence of events
 *
 * 1. Prompt user for database name to create. If it already exists give him a change to change it
 * 2. Create the database, the tables, and seed the tables with data
 * 3. Present the menu of options to the user, and react accordingly.
*/

