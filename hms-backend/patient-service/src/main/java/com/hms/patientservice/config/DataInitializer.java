package com.hms.patientservice.config;

import com.hms.patientservice.entity.Patient;
import com.hms.patientservice.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private PatientRepository patientRepository;

    @Override
    public void run(String... args) throws Exception {
        if (patientRepository.count() == 0) {
            savePatient("Rahul", "Sharma", "rahul.sharma@email.com", "9876543210", LocalDate.of(1990, 5, 15), "MALE", "A+", "Nagpur");
            savePatient("Priya", "Patel", "priya.patel@email.com", "9123456780", LocalDate.of(1985, 8, 22), "FEMALE", "B+", "Nagpur");
            savePatient("Amit", "Singh", "amit.singh@email.com", "9988776655", LocalDate.of(2000, 1, 10), "MALE", "O+", "Nagpur");
            savePatient("Sneha", "Gupta", "sneha.gupta@email.com", "9871234560", LocalDate.of(1995, 11, 30), "FEMALE", "AB+", "Nagpur");
            savePatient("Vikram", "Rao", "vikram.rao@email.com", "9012345678", LocalDate.of(1988, 3, 25), "MALE", "O-", "Nagpur");
            System.out.println("Patient database initialized with 5 sample patients.");
        }
    }

    private void savePatient(String firstName, String lastName, String email, String phone, LocalDate dob, String gender, String bloodGroup, String address) {
        Patient patient = new Patient();
        patient.setFirstName(firstName);
        patient.setLastName(lastName);
        patient.setEmail(email);
        patient.setPhone(phone);
        patient.setDateOfBirth(dob);
        patient.setGender(gender);
        patient.setBloodGroup(bloodGroup);
        patient.setAddress(address);
        patientRepository.save(patient);
    }
}
