"use strict";

///////////////////////////////////////////////////////////////////////////////
//                         Function to initialize DB                         //
///////////////////////////////////////////////////////////////////////////////

// creates the necessary schema and seeds them, including a table view of managers
const init = async db => {

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

///////////////////////////////////////////////////////////////////////////////
//                            Utility DB Functions                           //
///////////////////////////////////////////////////////////////////////////////

// returns an array of current employees
const getEmployeeList = async db => {
  const sql = 'SELECT CONCAT(first_name, " ", last_name) as `name` FROM employee ORDER BY last_name';
  try {
    const [results, fields] = await db.query(sql);
    return results.map(item => item.name);
  } catch (err) {
    console.log(err);
  }
}

// export functions
module.exports = { init, viewEmployees, addEmployee, getEmployeeList };
