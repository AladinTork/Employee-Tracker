const inquirer = require("inquirer");
// const sequelize = require("./config/connection");
const { Pool } = require("pg");
// const { Department, Role, Employee } = require("./models");
require("dotenv").config();

// list of prompt questions for the menu
const menuQuestions = [
  {
    type: "list",
    name: "menu",
    message: "Please choose between the following options",
    choices: [
      "View all departments",
      "View all roles",
      "View all employees",
      "Add a department",
      "Add a role",
      "Add an employee",
      "Update an employee role",
    ],
  },
];

//connect to the database
const pool = new Pool(
  {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: "localhost",
    database: "employee_db",
  },
  console.log(`Connected to the employee_db database.`)
);

pool.connect();

//main program / prompts for user
function init() {
  inquirer.prompt(menuQuestions).then((answer) => {
    if (answer.menu === "View all departments") {
      viewAllDepartments();
    } else if (answer.menu === "View all roles") {
      viewAllRoles();
    } else if (answer.menu === "View all employees") {
        viewAllEmployees();
      } else if (answer.menu === "Add a department") {
        addDepartment();
      } else if (answer.menu === "Add a role") {
        addRole();
      } else if (answer.menu === "Add an employee") {
        addEmployee();
      } else if (answer.menu === "Update an employee role") {
        updateEmployeeRole();
      }
  });
}

// Function to view all departments
const viewAllDepartments = async () => {
  const query =
    'SELECT id AS "Department ID", name AS "Department Name" FROM department ORDER BY id;';
  const result = await pool.query(query);
  const formattedRows = result.rows.map((row) => ({
    "Department ID": row["Department ID"],
    "Department Name": row["Department Name"],
  }));
  console.table(formattedRows);
  init();
};

// Function to view all roles
const viewAllRoles = async () => {
  const query = `
      SELECT 
        role.id AS "Role ID", 
        role.title AS "Job Title", 
        department.name AS "Department", 
        role.salary AS "Salary"
      FROM 
        role
      JOIN 
        department 
      ON 
        role.department_id = department.id
      ORDER BY 
        role.id;
    `;
  const result = await pool.query(query);
  console.table(result.rows);
  init();
};

// Function to view all employees
const viewAllEmployees = async () => {
  const query = `
      SELECT 
        employee.id AS "Employee ID",
        employee.first_name AS "First Name",
        employee.last_name AS "Last Name",
        role.title AS "Job Title",
        department.name AS "Department",
        role.salary AS "Salary",
        CONCAT(manager.first_name, ' ', manager.last_name) AS "Manager"
      FROM 
        employee
      JOIN 
        role 
      ON 
        employee.role_id = role.id
      JOIN 
        department 
      ON 
        role.department_id = department.id
      LEFT JOIN 
        employee manager
      ON 
        employee.manager_id = manager.id
      ORDER BY 
        employee.id;
    `;
  const result = await pool.query(query);
  console.table(result.rows);
  init();
};

// Function to add a department
const addDepartment = async () => {
  const { name } = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "Enter the name of the department:",
    },
  ]);

  const query = "INSERT INTO department (name) VALUES ($1) RETURNING *;";
  await pool.query(query, [name]);
  console.log(`Department "${name}" added successfully!`);
  init();
};

// Function to add a role
const addRole = async () => {
  const departments = await pool.query("SELECT id, name FROM department;");
  const departmentChoices = departments.rows.map((d) => ({
    name: d.name,
    value: d.id,
  }));

  const { title, salary, department_id } = await inquirer.prompt([
    {
      type: "input",
      name: "title",
      message: "Enter the name of the role:",
    },
    {
      type: "input",
      name: "salary",
      message: "Enter the salary for the role:",
    },
    {
      type: "list",
      name: "department_id",
      message: "Select the department for this role:",
      choices: departmentChoices,
    },
  ]);

  const query =
    "INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3) RETURNING *;";
  await pool.query(query, [title, salary, department_id]);
  console.log(`Role "${title}" added successfully!`);
  init();
};

// Function to add an employee
const addEmployee = async () => {
  const roles = await pool.query("SELECT id, title FROM role;");
  const roleChoices = roles.rows.map((r) => ({ name: r.title, value: r.id }));

  const employees = await pool.query(
    "SELECT id, first_name, last_name FROM employee;"
  );
  const managerChoices = employees.rows.map((e) => ({
    name: `${e.first_name} ${e.last_name}`,
    value: e.id,
  }));
  managerChoices.unshift({ name: "None", value: null });

  const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
    {
      type: "input",
      name: "first_name",
      message: "Enter the employee's first name:",
    },
    {
      type: "input",
      name: "last_name",
      message: "Enter the employee's last name:",
    },
    {
      type: "list",
      name: "role_id",
      message: "Select the role for this employee:",
      choices: roleChoices,
    },
    {
      type: "list",
      name: "manager_id",
      message: "Select the manager for this employee:",
      choices: managerChoices,
    },
  ]);

  const query =
    "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4) RETURNING *;";
  await pool.query(query, [first_name, last_name, role_id, manager_id]);
  console.log(`Employee "${first_name} ${last_name}" added successfully!`);
  init();
};

// Function to update an employee role
const updateEmployeeRole = async () => {
  const employees = await pool.query(
    "SELECT id, first_name, last_name FROM employee;"
  );
  const employeeChoices = employees.rows.map((e) => ({
    name: `${e.first_name} ${e.last_name}`,
    value: e.id,
  }));

  const roles = await pool.query("SELECT id, title FROM role;");
  const roleChoices = roles.rows.map((r) => ({ name: r.title, value: r.id }));

  const { employee_id, role_id } = await inquirer.prompt([
    {
      type: "list",
      name: "employee_id",
      message: "Select the employee to update:",
      choices: employeeChoices,
    },
    {
      type: "list",
      name: "role_id",
      message: "Select the new role for this employee:",
      choices: roleChoices,
    },
  ]);

  const query = "UPDATE employee SET role_id = $1 WHERE id = $2 RETURNING *;";
  await pool.query(query, [role_id, employee_id]);
  console.log(`Employee role updated successfully!`);
  init();
};

init();
