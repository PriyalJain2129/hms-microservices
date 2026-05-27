USE patient_db;
INSERT INTO patients (first_name, last_name, email, phone, date_of_birth, gender, blood_group, address, registered_at)
VALUES
('Rahul','Sharma','rahul@email.com','9876543210','1990-05-15','MALE','A+','Mumbai',NOW()),
('Priya','Patel','priya@email.com','9123456780','1985-08-22','FEMALE','B+','Delhi',NOW()),
('Amit','Singh','amit@email.com','9988776655','2000-01-10','MALE','O+','Pune',NOW()),
('Sneha','Gupta','sneha@email.com','9871234560','1995-11-30','FEMALE','AB+','Nagpur',NOW());

USE doctor_db;
INSERT INTO doctors (first_name, last_name, specialization, email, phone, department, qualification, experience_years, available)
VALUES
('Rajesh','Kumar','Cardiologist','rajesh@hospital.com','9000011111','Cardiology','MBBS MD',10,true),
('Meena','Iyer','Neurologist','meena@hospital.com','9000022222','Neurology','MBBS DM',8,true),
('Arjun','Nair','Orthopedic','arjun@hospital.com','9000033333','Orthopedics','MBBS MS',12,true);

USE pharmacy_db;
INSERT INTO medicines (name, generic_name, manufacturer, category, price, stock, minimum_stock, expiry_date, description)
VALUES
('Paracetamol','Acetaminophen','Cipla','Analgesic',10.5,100,10,'2027-12-31','Pain reliever'),
('Amoxicillin','Amoxicillin','Sun Pharma','Antibiotic',25.0,50,10,'2027-06-30','Antibiotic'),
('Metformin','Metformin HCl','Dr Reddys','Antidiabetic',15.0,8,10,'2026-12-31','Diabetes medicine');
