"use strict";

const mysql = require('mysql2');

/*
 * Create functions for the following
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

///////////////////////////////////////////////////////////////////////////////
//                         Function to initialize app                        //
///////////////////////////////////////////////////////////////////////////////

/**
 * Takes a datababse name as input and returns a connection object initiated
 * by the mysql2 module. Use that object when calling subsequent DB queries.
 *
 * Also creates the necessary schema and seeds them, including a table view
 * of manager data.
 */

const init = dbName => {
  const db = mysql.createConnection({
    host: process.env.DB_host,
    user: process.env.DB_user,
    password: process.env.DB_password,
    database: dbName
  });

  let sql = ``;  // queries to pass to MySQL
  let params = [];

  // delete the tables if they exists, needs to be in reverse order due
  // to FK constraints
  db.query('DROP TABLE IF EXISTS employee', (err, results) => {
    if (err) console.log(err);
  });
  db.query('DROP TABLE IF EXISTS role', (err, results) => {
    if (err) console.log(err);
  });
  db.query('DROP TABLE IF EXISTS department', (err, results) => {
    if (err) console.log(err);
  });

  //create the three tables
  sql = 'CREATE TABLE IF NOT EXISTS department(id INT NOT NULL AUTO_INCREMENT,name VARCHAR(30)NOT NULL,CONSTRAINT department_pk PRIMARY KEY(id))'
  db.query(sql, err => {
    if (err) console.log(err);
  });

  sql = `CREATE TABLE role (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(30) DEFAULT NULL,
  salary DECIMAL DEFAULT 0,
  department_id INT,
  CONSTRAINT role_pk
    PRIMARY KEY (id),
  CONSTRAINT role_fk_department
    FOREIGN KEY (department_id) REFERENCES department (id) ON DELETE SET NULL
)`;
  db.query(sql, err => {
    if (err) console.log(err);
  });

  sql = `CREATE TABLE IF NOT EXISTS employee (
  id INT NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(30) DEFAULT NULL,
  last_name VARCHAR(30) DEFAULT NULL,
  role_id INT,
  manager_id INT DEFAULT NULL,
  CONSTRAINT employee_pk PRIMARY KEY (id),
  CONSTRAINT employee_fk_role
    FOREIGN KEY (role_id) REFERENCES role (id) ON DELETE SET NULL,
  CONSTRAINT employee_fk_employee
    FOREIGN KEY (manager_id) REFERENCES employee (id) ON DELETE SET NULL
)`;
  db.query(sql, err => {
    if (err) console.log(err);
  });

  // now to seed the tables
  sql = 'INSERT INTO department(name) VALUES("Research"),("Finance"),("Legal"),("Sales")';
  db.query(sql, err => {
    if (err) console.log(err);
  });

  sql = `INSERT INTO role (title, salary, department_id) VALUES
  ("Lead Scientist", 150000, 1),
  ("Lab Technician", 80000, 1),
  ("Account Manager", 160000, 2),
  ("Accountant", 125000, 2),
  ("Legal Team Lead", 250000, 3),
  ("Lawyer", 190000, 3),
  ("Sales Lead", 100000, 4),
  ("Salesperson", 80000, 4)`;
  db.query(sql, err => {
    if (err) console.log(err);
  });

  sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
('Giap', 'Capobianchi', 1, NULL),
('Xiaobin', 'Geffroy', 2, 1),
('Sungwon', 'Ratnaker', 2, 1),
('Sashi', 'Reeker', 3, NULL),
('Kristian', 'Falck', 4, 4),
('Frederique', 'Serna', 4, 4),
('Denny', 'Zizka', 5, NULL),
('Mohammed', 'VanScheik', 6, 7),
('Nitsan', 'Jansch', 6, 7),
('Yolla', 'Antonakopoulos', 7, NULL),
('Ayakannu', 'Senzako', 8, 10),
('Jianwen', 'Kemmerer', 8, 10),
('Gro', 'Vendrig', 2, 1),
('Insup', 'Syang', 8, 10)`;
  db.query(sql, err => {
    if (err) console.log(err);
  });

  // the following table view ("virtual table") will be useful in future queries
  sql = `CREATE or REPLACE VIEW managers AS
SELECT
  r.title,
  e.id as employee_id,
  CONCAT(e.first_name, ' ', e.last_name) AS manager,
  d.id as \`department_id\`,
  d.\`name\` as \`department_name\`
FROM employee e
  JOIN role r ON e.role_id = r.id
  JOIN department d ON r.department_id = d.id
WHERE e.manager_id IS NULL`;
    db.query(sql, err => {
    if (err) console.log(err);
  });

  console.log('Database and tables initialized and seeded.');

  return db;
};

///////////////////////////////////////////////////////////////////////////////
//                      Functions to view employee data                      //
///////////////////////////////////////////////////////////////////////////////

const viewDepts = db => {
  // View all departments: dept name and ID
  // call showTable() to display

  const sql = 'select * from department';

  db.query(sql, (err, results) => {
    if (err) console.log(err);
    else console.table(results);
  });
};

const viewRoles = db => {
  // view roles/jobs: job title, id, department, and salary
  const sql = `SELECT
  r.id \`job_id\`, r.title as \`job_title\`, d.\`name\` as \`department\`, r.salary
FROM \`role\` r
  JOIN department d ON r.department_id = d.id`;

  db.query(sql, (err, results) => {
    if (err) console.log(err);
    console.table(results);
  });
};

const viewEmployees = db => {
  // view employees: id, first & last names, job titles, depts, salaries, managers
  const sql = `SELECT
  e.id,
  e.first_name,
  e.last_name,
  r.title,
  d. \`name\` AS \`department\`,
  r.salary,
  m.manager
FROM
  employee e
  JOIN \`role\` r ON e.role_id = r.id
  JOIN department d ON r.department_id = d.id
  LEFT JOIN managers m on e.manager_id = m.employee_id
ORDER BY d.\`name\`, e.last_name`;

  db.query(sql, (err, results) => {
    if (err) console.log(err);
    console.table(results);
  });
};

///////////////////////////////////////////////////////////////////////////////
//               Functions to update (add/delete) employee data              //
///////////////////////////////////////////////////////////////////////////////


// export functions
module.exports = { init, viewDepts, viewRoles, viewEmployees };
