INSERT INTO department (name)
VALUES (Engineering), 
        (Finance), 
        (Legal), 
        (Sales)

INSERT INTO role (title, salary, department_id)
VALUES ("Sales Lead", 80000, 4), 
        ("Salesperson", 60000, 4), 
        ("Lead Engineer", 160000, 1), 
        ("Software Engineer", 120000, 1), 
        ("Account Manager", 150000, 2),
        ("Accountant", 100000, 2), 
        ("Lawyer", 190000, 3)

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("John", "Smith", 3, NULL),
        ("Zac", "Doe", 4, 1),
        ("Kevin", "Lambert", 5, NULL),
        ("Jasmin", "Aladdin", 6, 3),
        ("Mike", "Ike", 6, 3),
        ("Silvy", "Star", 7, NULL)
