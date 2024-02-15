# Employee Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Description
This is a command-line application to view and management employees. It uses node.js and MySQL.

## Installation
1. Clone or download this repo into a directory of your choosing.
2. If necessary, install [Node.js](https://nodejs.org/en) and [MySQL](https://www.mysql.com) on your computer.
3. In the terminal, navigate to the directory where you downloaded this app and type `npm install` to install the necessary dependencies.

## Use
To start the app, type `node index.js`. You will be prompted for a database name. If you name an existing database, be aware that it will be overwritten (there is a warning about this in the app). After you enter the database, three tables are created: department, role, and employee. The schema for these tables are in the `schema.sql` file of the db folder if you are interested. Sample data are seeded to these tables, as shown in the `seeds.sql` file; neither of these files are necessary for the operation of the app.

Once the tables are created, the user is presented with a menu of options (which are not numbered in the app):

1. View All Departments
1. View All Roles
1. View All Employees
1. Add Department
1. Delete Department
1. View Department Total Salary
1. Add Role
1. Delete Role
1. Add Employee
1. Delete Employee
1. Update Employee Role
1. Quit

The first three items present views of the data in the database as does item #6. The other items give the user various options to update or delete the employee data.

[This demonstration video](https://youtu.be/tFSILox2Yu4) gives a brief overview of how the app works.

## Questions
Reach out if you have questions that are not covered here!

- GitHub username: clstevenson
- email: chrislstevenson@gmail.com

## License
This project is licensed under the terms of the [MIT license](https://opensource.org/licenses/MIT).
