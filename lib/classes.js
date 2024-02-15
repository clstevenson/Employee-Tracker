"use strict";

///////////////////////////////////////////////////////////////////////////////
//                          Employee Tracker Classes                         //
///////////////////////////////////////////////////////////////////////////////

class DepartmentTbl {
  constructor(dbName) {
    this.dbName = dbName;
  }

  // create table in database
  async create(dbConn) {
    try {
      // if the database does not exist, create it
      await dbConn.query(`CREATE DATABASE IF NOT EXISTS ${this.dbName}`);
      await dbConn.query(`USE ${this.dbName}`);

      // create table, overwriting any existing table
      // (need to temporarily override any FK constraints)
      await dbConn.query('SET foreign_key_checks=0');
      await dbConn.query('DROP TABLE IF EXISTS department');
      const sql = 'CREATE TABLE department (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(30) NOT NULL)';
      await dbConn.query(sql);
      await dbConn.query('SET foreign_key_checks=1');
    } catch (err) {
      console.log(err);
    }
  } // end create() method

  // add some sample data into the table for testing purposes
  async seed(dbConn) {
    try {
      const sql = 'INSERT INTO department (name) VALUES("Research"),("Finance"),("Legal"),("Sales")';
      await dbConn.query(sql);
    } catch (err) {
      console.log(err);
    }
  } // end seed() method

  // view all departments: name and ID
  async view(dbConn) {
    try {
      const sql = 'select id as \`dept_id\`, name as \`dept\` from department';
      const results = await dbConn.query(sql);
      console.table(results[0]);
    } catch (err) {
      console.log(err);
    }
  } // end view() method

  // add a new dept
  async add(dbConn, deptInfo) {
    // deptInfo is an object with a single property, "dept"
    try {
      const sql = `INSERT INTO department (name) VALUES ('${deptInfo.dept}')`;
      await dbConn.query(sql);
      console.log(`Added new department ${deptInfo.dept} to the database`);
    } catch (err) {
      console.log(err);
    }
  } // end add() method

  // delete a dept
  async delete(dbConn, deptInfo) {
    // deptInfo contains just one property: the name of the dept to delete
    const sql = `DELETE FROM department where name='${deptInfo.dept}'`;
    await dbConn.query(sql);
    console.log(`The department ${deptInfo.dept} was deleted, which might leave NULLs in the role table.`);
  } // end delete() method

  // return an array of depts from the DB
  async list(dbConn) {
    const sql = 'SELECT name FROM department';
    try {
      const [results, fields] = await dbConn.query(sql);
      return results.map(item => item.name);
    } catch (err) {
      console.log(err);
    }
  } // end list() method
} // end DepartmentTbl class

class RoleTbl {
  constructor(dbName) {
    this.dbName = dbName;
  }

  // create the "role" table in the DB
  async create(dbConn) {
    try {
      // if the database does not exist, create it
      await dbConn.query(`CREATE DATABASE IF NOT EXISTS ${this.dbName}`);
      await dbConn.query(`USE ${this.dbName}`);

      // create table, overwriting any existing table
      // (need to temporarily override any FK constraints)
      await dbConn.query('SET foreign_key_checks=0');
      await dbConn.query('DROP TABLE IF EXISTS role');
      const sql = `CREATE TABLE role (
        id INT NOT NULL AUTO_INCREMENT,
        title VARCHAR(30) DEFAULT NULL,
        salary DECIMAL DEFAULT 0,
        department_id INT,
        CONSTRAINT role_pk
          PRIMARY KEY (id),
        CONSTRAINT role_fk_department
          FOREIGN KEY (department_id) REFERENCES department (id) ON DELETE SET NULL)`;
      await dbConn.query(sql);
      await dbConn.query('SET foreign_key_checks=1');
    } catch (err) {
      console.log(err);
    }
  } // end create() method

  // add some sample data into the table for testing purposes
  async seed(dbConn) {
    try {
      const sql = `INSERT INTO role (title, salary, department_id) VALUES
        ("Lead Scientist", 150000, 1),
        ("Lab Technician", 80000, 1),
        ("Account Manager", 160000, 2),
        ("Accountant", 125000, 2),
        ("Legal Team Lead", 250000, 3),
        ("Lawyer", 190000, 3),
        ("Sales Lead", 100000, 4),
        ("Salesperson", 80000, 4)`;
      await dbConn.query(sql);
    } catch (err) {
      console.log(err);
    }
  } // end seed() method

  // view table of job titles
  // need to do left join in case of dept deletions
  async view(dbConn) {
    try {
      const sql = `SELECT
        r.id \`job_id\`, r.title as \`job_title\`, d.\`name\` as \`dept\`, r.salary
        FROM \`role\` r
        LEFT JOIN department d ON r.department_id = d.id`;
      const results = await dbConn.query(sql);
      console.table(results[0]);
    } catch (err) {
      console.log(err);
    }
  } // end view() method

  // add a new job/role
  async add(dbConn, roleInfo) {
    // roleInfo object has three inputs: title (ie job title), salary, and dept
    const { title, salary, dept } = roleInfo;
    try {
      const sql = `INSERT INTO \`role\` (title, salary, department_id)
        VALUES('${title}', ${salary}, (
        SELECT
          id FROM department
        WHERE
          \`name\` = '${dept}'))`;
      await dbConn.query(sql);
      console.log(`Added new job ${roleInfo.title} to the ${dept} department`);
    } catch (err) {
      console.log(err);
    }
  } // end add() method

  // delete one row from the table
  async delete(dbConn, roleInfo) {
    // roleInfo contains just one property: the job title to delete
    const sql = `DELETE FROM \`role\` WHERE title = '${roleInfo.title}'`;
    await dbConn.query(sql);
    console.log(`The role ${roleInfo.title} was deleted, which might leave NULLs in the employee table.`);
  } // end delete() method

  // update an existing emploee's job title/role
  async update(dbConn, roleInfo) {
    // input roleInfo contains two properties: full name and job title (ie, role)
    const { name, role } = roleInfo;
    const [firstName, lastName] = name.split(' ');
    try {
      const sql = `UPDATE employee
        SET
          role_id = (SELECT id FROM \`role\` WHERE title = '${role}')
        WHERE
          first_name = '${firstName}' AND last_name = '${lastName}'`;
      await dbConn.query(sql);
      console.log(`Updated ${name} role to ${role}`);
    } catch (err) {
      console.log(err);
    }
  } // end update() method

  // return an array of roles from the DB
  async list(dbConn) {
    const sql = 'SELECT title FROM role ORDER BY title';
    try {
      const [results, fields] = await dbConn.query(sql);
      return results.map(item => item.title);
    } catch (err) {
      console.log(err);
    }
  } // end list() method
} // end RoleTbl class

class EmployeeTbl {
  constructor(dbName) {
    this.dbName = dbName;
  }

  // create the employee table and managers virtual table in the DB
  async create(dbConn) {
    try {
      // if the database does not exist, create it
      await dbConn.query(`CREATE DATABASE IF NOT EXISTS ${this.dbName}`);
      await dbConn.query(`USE ${this.dbName}`);

      // create table, overwriting any existing table
      // (need to temporarily override any FK constraints)
      await dbConn.query('SET foreign_key_checks=0');
      await dbConn.query('DROP TABLE IF EXISTS employee');
      const sql = `CREATE TABLE IF NOT EXISTS employee (
        id INT NOT NULL AUTO_INCREMENT,
        first_name VARCHAR(30) DEFAULT NULL,
        last_name VARCHAR(30) DEFAULT NULL,
        role_id INT,
        manager_id INT DEFAULT NULL,
        CONSTRAINT employee_pk PRIMARY KEY (id),
        CONSTRAINT employee_fk_role
          FOREIGN KEY (role_id) REFERENCES role (id) ON DELETE SET NULL,
        CONSTRAINT employee_fk_employee
          FOREIGN KEY (manager_id) REFERENCES employee (id) ON DELETE SET NULL)`;
      await dbConn.query(sql);
      await dbConn.query('SET foreign_key_checks=1');
    } catch (err) {
      console.log(err);
    }
  } // end create method

  // add some sample data into the table for testing purposes
  async seed(dbConn) {
    try {
      const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
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
      await dbConn.query(sql);
    } catch (err) {
      console.log(err);
    }
  } // end seed() method

  // view table of employees
  // left join with Role needed in case deletions leave the role-id NULL
  // left (self) join with employee needed since managers don't have managers themselves (by default anyway)
  async view(dbConn) {
    try {
      const sql = `SELECT
                     e.id,
                     e.first_name,
                     e.last_name,
                     r.title,
                     r.salary,
                     CONCAT(e2.first_name, ' ', e2.last_name) as \`manager\`
                   FROM
                     employee e
                     LEFT JOIN \`role\` r ON e.role_id = r.id
                     LEFT JOIN employee e2 ON e.manager_id = e2.id
                   ORDER BY e.id`;
      const results = await dbConn.query(sql);
      console.table(results[0]);
    } catch (err) {
      console.log(err);
    }
  } // end view() method

  // add new employee
  async add(dbConn, empInfo) {
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
                             e.id FROM (select * from employee) as e
                           WHERE
                             CONCAT(first_name, ' ', last_name) = '${managerFullName}'))`;
      await dbConn.query(sql);
      console.log(`Added new employee ${firstName + ' ' + lastName} to the database`);
    } catch (err) {
      console.log(err);
    }
  } // end add() method

  // delete an employee from the DB
  async delete(dbConn, empInfo) {
    // empInfo will have the full name of the employee to delete
    const [ firstName, lastName ] = empInfo.fullName.split(' ');
    const sql = `DELETE FROM employee where first_name='${firstName}' AND last_name='${lastName}'`;
    await dbConn.query(sql);
    console.log(`${empInfo.fullName} was deleted from the database`);
  } // end delete method

  // returns array of current employees
  async list(dbConn) {
    const sql = 'SELECT CONCAT(first_name, " ", last_name) as `name` FROM employee ORDER BY last_name';
    try {
      const [results, fields] = await dbConn.query(sql);
      return results.map(item => item.name);
    } catch (err) {
      console.log(err);
    }
  } // end list() method
} // end EmployeeTbl class

module.exports = { DepartmentTbl, RoleTbl, EmployeeTbl }
