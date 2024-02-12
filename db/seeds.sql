-- seed values for tables

INSERT INTO department (name)
    VALUES("Research"), ("Finance"), ("Legal"), ("Sales");


INSERT INTO role (title, salary, department_id) VALUES
  ("Lead Scientist", 150000, 1),
  ("Lab Technician", 80000, 1),
  ("Account Manager", 160000, 2),
  ("Accountant", 125000, 2),
  ("Legal Team Lead", 250000, 3),
  ("Lawyer", 190000, 3),
  ("Sales Lead", 100000, 4),
  ("Salesperson", 80000, 4);


INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
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
('Insup', 'Syang', 8, 10);
