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

/************ table views *******************/
-- view all department: ID, name
SELECT * FROM department;

-- create virtual table of depts with managers for convenience
CREATE or REPLACE VIEW managers AS
SELECT
  r.title,
  e.id as employee_id,
  CONCAT(e.first_name, ' ', e.last_name) AS manager,
  d.id as `department_id`,
  d.`name` as `department_name`
FROM employee e
  JOIN role r ON e.role_id = r.id
  JOIN department d ON r.department_id = d.id
WHERE e.manager_id IS NULL;

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
VALUES ('Paralegal', 80000, 3);

-- adding an employee (prompted for first, last, role, and manager)
-- need to do two lookups here: role -> role_ID and manager -> manager_id
-- let's say we are adding Sam Smith as a paralegal and his manager is Denny Zizka

SELECT id FROM `role` WHERE title = "Paralegal"; -- returned 9
SELECT employee_id from managers WHERE manager = 'Denny Zizka'; -- returned 7
-- but if the new employee is also a manager, need to change manager_id to NULL
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Sam', 'Smith', 9, 7);


-- updating a role/job (prompted to select employee and their new role, both selected from lists of current options)