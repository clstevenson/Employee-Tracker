-- if necessary, delete tables in reverse order due to FK constraints
DROP TABLE IF EXISTS employee;
DROP TABLE IF EXISTS role;
DROP TABLE IF EXISTS department;

-- Department table
CREATE TABLE IF NOT EXISTS department (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(30) NOT NULL,
  CONSTRAINT department_pk PRIMARY KEY (id)
);

-- Employee role in a department
CREATE TABLE IF NOT EXISTS role (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(30) DEFAULT NULL,
  salary DECIMAL DEFAULT 0,
  department_id INT,
  CONSTRAINT role_pk
    PRIMARY KEY (id),
  CONSTRAINT role_fk_department
    FOREIGN KEY (department_id) REFERENCES department (id) ON DELETE SET NULL
);

-- Employee table
CREATE TABLE IF NOT EXISTS employee (
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
);