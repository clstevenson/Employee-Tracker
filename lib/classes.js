"use strict";
const mysql = require('mysql2/promise');

///////////////////////////////////////////////////////////////////////////////
//                          Employee Tracker Classes                         //
///////////////////////////////////////////////////////////////////////////////

// all classes will contain the following (async) CRUD methods
// (Not all of these methods will be in every sub-class)
// create() will create the table in the database.
// -- since this will be an async function it cannot be in the constructor
// list() will return an array of items from the table
// seed() will seed the tables with sample data
// view() will display a formatted table at the CLI
// -- maybe offer optional capability to filter by dept or manager
// add() will add a new row/record to the table
// update() will update an existing row/record
// delete() will remove an existing row/record

/*
 * All class methods require a live
 * database connection to MySQL to allow
 * SQL commands to succeed. It is assumed that the promise
 * version of the mysql2 module is being used since the methods
 * are mostly async
 */

class DepartmentTbl {
  constructor(dbName) {
    this.dbName = dbName;
  }

  async create(dbConn) {
    try {
      // if the database does not exist, create it
      await dbConn.query(`CREATE DATABASE IF NOT EXISTS ${this.dbName}`);
      await dbConn.query(`USE ${this.dbName}`);

      // create table, overwriting any existing table
      // (need to temporarily override any FK constraints)
      await dbConn.query('SET foreign_key_checks=0');
      await dbConn.query('DROP TABLE IF EXISTS department');
      const sql = 'CREATE TABLE department (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(30) NOT NULL)'
      await dbConn.query(sql);
      await dbConn.query('SET foreign_key_checks=1');
    } catch (err) {
      console.log(err);
    }
  } // end create() method

  async seed(dbConn) {
    try {
      const sql = 'INSERT INTO department (name) VALUES("Research"),("Finance"),("Legal"),("Sales")';
      await dbConn.query(sql);
    } catch (err) {
      console.log(err);
    }
  } // end seed() method

  async view(dbConn) { // view all departments: name and ID
    try {
      const sql = 'select id as \`dept_id\`, name as \`dept\` from department';
      const results = await dbConn.query(sql);
      console.table(results[0]);
    } catch (err) {
      console.log(err);
    }
  } // end view() method

  async add(dbConn, deptInfo) { // add a new dept
    // deptInfo is an object with a single property, "dept"
    try {
      const sql = `INSERT INTO department (name) VALUES ('${deptInfo.dept}')`;
      await dbConn.query(sql);
      console.log(`Added new department ${deptInfo.dept} to the database`);
    } catch (err) {
      console.log(err);
    }
  } // end add() method

  async list(dbConn) { // return an array of depts from the DB
    const sql = 'SELECT name FROM department';
    try {
      const [results, fields] = await dbConn.query(sql);
      return results.map(item => item.name);
    } catch (err) {
      console.log(err);
    }
  } // end list() method

}

class RoleTbl {
  constructor(dbName) {
    this.dbName = dbName;
  }

}

class EmployeeTbl {
  constructor(dbName) {
    this.dbName = dbName;
  }

}

module.exports = { DepartmentTbl, RoleTbl, EmployeeTbl }
