/*
Tasks for which queries must be written

1. View all employees: empl ID, first, last, title, dept, salary, manager
2. Add employee
3. Update employee role
4. View all roles: job title, role ID, dept, salary
5. Add role
6. View all departments: dept name and ID
7. Add department

Snippets below are used for these tasks
 */

CREATE TABLE test (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(30) NOT NULL);

/************ table views *******************/
-- view all department: ID, name

SELECT
  *
FROM
  department;

USE challenge12;

CREATE OR REPLACE VIEW managers AS
SELECT
  r.title,
  e.id AS employee_id,
  CONCAT(
    e.first_name, ' ', e.last_name) AS manager,
  d.id AS `department_id`,
  d. `name` AS `department_name`
FROM
  employee e
  JOIN ROLE r ON e.role_id = r.id
  JOIN department d ON r.department_id = d.id
WHERE
  e.manager_id IS NULL;

-- view all roles: ID, title, dept, salary, and dept manager
-- note that the video did not show the manager. Should it be the position? Or the person?
SELECT *
FROM employee;

SELECT
  r.id `job_id`, r.title as `job_title`, d.`name` as `department`, r.salary
FROM `role` r
  JOIN department d ON r.department_id = d.id;


-- view all employees: ID, first, last, title, dept, salary, manager (or null if manager)
SELECT
  e.id,
  e.first_name,
  e.last_name,
  r.title,
  d. `name` AS `department`,
  r.salary,
  m.manager
FROM
  employee e
  JOIN `role` r ON e.role_id = r.id
  JOIN department d ON r.department_id = d.id
  LEFT JOIN managers m on e.manager_id = m.employee_id
ORDER BY d.`name`, e.last_name;


/************ table updates *******************/

-- adding a department: example is HR
INSERT INTO department (name) VALUES ('HR');

-- adding a role (with prompts for name, salary, and dept)
-- need to be able to get the department ID from the input. Can this be done solely in SQL?
-- OR do we need to use two queries in JS, store the result in a variable, and then use it

-- from a department (say "Legal") list the appropriate ID (ie, a lookup)
SELECT id from department WHERE `name` = 'Legal'; -- returned 3
-- then use the result to insert a new role, say 'paralegal'

INSERT INTO `role` (title, salary, department_id)
    VALUES('Paralegal', 80000, (
        SELECT
          id FROM department
        WHERE
          `name` = 'Legal'));

-- adding an employee (prompted for first, last, role, and manager)
-- need to do two lookups here: role -> role_ID and manager -> manager_id
-- let's say we are adding Sam Smith as a paralegal and his manager is Denny Zizka

SELECT id FROM `role` WHERE title = "Paralegal"; -- returned 9
SELECT employee_id from managers WHERE manager = 'Denny Zizka'; -- returned 7
-- if the new employee is also a manager, do I need to change manager_id to NULL?

INSERT INTO employee (first_name, last_name, role_id, manager_id)
    VALUES('Sam', 'Smith', (
        SELECT
          id FROM `role`
        WHERE
          title = "Paralegal"), (
          SELECT
            employee_id FROM managers
          WHERE
            manager = 'Denny Zizka'));

-- updating a role/job (prompted to select employee and their new role, both selected from lists of current options)
-- need to do lookups: employee.id from name, role.id from role, and manager_id from the department_id (Using managers)
SELECT id FROM (SELECT * from employee) e WHERE e.first_name = "Sashi" AND e.last_name = "Reeker"; -- returns 4
SELECT id FROM `role` WHERE title = 'Accountant';

UPDATE
  employee
SET
  role_id = (SELECT id FROM `role` WHERE title = 'Paralegal')
WHERE
  first_name = 'Chris' AND last_name = 'Stevenson';