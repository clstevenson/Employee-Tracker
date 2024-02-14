"use strict";

///////////////////////////////////////////////////////////////////////////////
//                         Function to initialize DB                         //
///////////////////////////////////////////////////////////////////////////////

// creates the necessary schema and seeds them, including a table view of managers
const init = async db => {
  let sql = ``;  // queries to pass to MySQL

  // delete the tables if they exists, needs to be in reverse order due
  // to FK constraints
  try {
    await db.query('DROP TABLE IF EXISTS employee');
    await db.query('DROP TABLE IF EXISTS role');
    await db.query('DROP TABLE IF EXISTS department');
  } catch (err) {
    console.log(err);
  }

  //create the three tables
  try {
    sql = 'CREATE TABLE IF NOT EXISTS department(id INT NOT NULL AUTO_INCREMENT,name VARCHAR(30)NOT NULL,CONSTRAINT department_pk PRIMARY KEY(id))'
  await db.query(sql);

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
    await db.query(sql);

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
    await db.query(sql);

  } catch (err) {
    console.log(err);
  }

  // now to seed the tables
  try {
    sql = 'INSERT INTO department(name) VALUES("Research"),("Finance"),("Legal"),("Sales")';
    await db.query(sql);

    sql = `INSERT INTO role (title, salary, department_id) VALUES
  ("Lead Scientist", 150000, 1),
  ("Lab Technician", 80000, 1),
  ("Account Manager", 160000, 2),
  ("Accountant", 125000, 2),
  ("Legal Team Lead", 250000, 3),
  ("Lawyer", 190000, 3),
  ("Sales Lead", 100000, 4),
  ("Salesperson", 80000, 4)`;
    await db.query(sql);

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
    await db.query(sql);
  } catch (err) {
    console.log(err);
  }

  // the following table view ("virtual table") will be useful in future queries
  try {
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
    await db.query(sql);
  } catch (err) {
    console.log(err);
  }

  console.log('Database and tables initialized and seeded.');
  return db;
};

///////////////////////////////////////////////////////////////////////////////
//                      Functions to view employee data                      //
///////////////////////////////////////////////////////////////////////////////

const viewDepts = async db => {
  // View all departments: dept name and ID

  try {
    const sql = 'select id as \`dept_id\`, name as \`dept\` from department';
    const results = await db.query(sql);
    console.table(results[0]);
  } catch (err) {
    console.log(err);
  }
};

const viewRoles = async db => {
  // view roles/jobs: job title, id, department, and salary
  try {
    const sql = `SELECT
  r.id \`job_id\`, r.title as \`job_title\`, d.\`name\` as \`dept\`, r.salary
FROM \`role\` r
  JOIN department d ON r.department_id = d.id`;

    const results = await db.query(sql);
    console.table(results[0]);
  } catch (err) {
    console.log(err);
  }
}

const viewEmployees = async db => {
  // view employees: id, first & last names, job titles, depts, salaries, managers
  try {
    const sql = `SELECT
  e.id as \`emp_id\`,
  e.first_name,
  e.last_name,
  r.title as \`job_title\`,
  d. \`name\` AS \`dept\`,
  r.salary,
  m.manager
FROM
  employee e
  JOIN \`role\` r ON e.role_id = r.id
  JOIN department d ON r.department_id = d.id
  LEFT JOIN managers m on e.manager_id = m.employee_id
ORDER BY d.\`name\`, e.last_name`;

    const results = await db.query(sql);
    console.table(results[0]);
  } catch (err) {
    console.log(err);
  }
};

///////////////////////////////////////////////////////////////////////////////
//               Functions to update (add/delete) employee data              //
///////////////////////////////////////////////////////////////////////////////

// add a new department to the database
const addDept = async (db, deptInfo) => {
  // deptInfo is an object with a single property, "dept"
  try {
    const sql = `INSERT INTO department (name) VALUES ('${deptInfo.dept}')`;
    await db.query(sql);
    console.log(`Added new department ${deptInfo.dept} to the database`);
  } catch (err) {
    console.log(err);
  }
}

// add a new role (job title) to the database
const addRole = async (db, roleInfo) => {
  // roleInfo object has three inputs: title (ie job title), salary, and dept
  const { title, salary, dept } = roleInfo;

  try {
    const sql = `INSERT INTO \`role\` (title, salary, department_id)
    VALUES('${title}', ${salary}, (
        SELECT
          id FROM department
        WHERE
          \`name\` = '${dept}'))`;

    await db.query(sql);
    console.log(`Added new job ${roleInfo.title} to the ${dept} department`);
  } catch (err) {
    console.log(err);
  }
}

// add a new employee to the database
const addEmployee = async (db, empInfo) => {
  // empInfo has the four properties shown below
  // note that that manager name is the full name, not first + last (or ID)
  const { firstName, lastName, title, managerFullName } = empInfo;

  try {
    const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
    VALUES('${firstName}', '${lastName}', (
        SELECT
          id FROM \`role\`
        WHERE
          title = '${title}'), (
          SELECT
            employee_id FROM managers
          WHERE
            manager = '${managerFullName}'))`;
    await db.query(sql);
    console.log(`Added new employee ${firstName + ' ' + lastName} to the database`);
  } catch (err) {
    console.log(err);
  }
}

// update an existing employee's job title (role)
const updateRole = async (db, roleInfo) => {
  // update a person's role (job title), notably without changing their manager
  // input roleInfo contains two properties: fullName and title
  const { fullName, title } = roleInfo;
  const [firstName, lastName] = fullName.split(' ');

  try {
    const sql = `UPDATE employee
SET
  role_id = (SELECT id FROM \`role\` WHERE title = '${title}')
WHERE
  first_name = '${firstName}' AND last_name = '${lastName}'`;

    await db.query(sql);
    console.log(`Updated ${fullName} role to ${title}`);
  } catch (err) {
    console.log(err);
  }
}

///////////////////////////////////////////////////////////////////////////////
//                            Utility DB Functions                           //
///////////////////////////////////////////////////////////////////////////////

// check to see if the database exists (not used at present)
const dbExists = async (db, dbName) => {
  const sql = `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME='${dbName}'`;
  try {
    const results = await db.query(sql);
    if (results[0].SCHEMA_NAME === undefined) return false;
    else return true;
  } catch (err) {
    console.log(err);
  }
}

// returns an array of current departments
const getDeptList = async db => {
  const sql = 'SELECT name FROM department';
  try {
    const [results, fields]  = await db.query(sql);
    return results.map(item => item.name);
  } catch (err) {
    console.log(err);
  }
}


// export functions
module.exports = { dbExists, init, viewDepts, viewRoles, viewEmployees, addDept, addRole, addEmployee, updateRole, getDeptList };
