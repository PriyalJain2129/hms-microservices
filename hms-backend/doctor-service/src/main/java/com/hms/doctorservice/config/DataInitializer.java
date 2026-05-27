package com.hms.doctorservice.config;

import com.hms.doctorservice.entity.Doctor;
import com.hms.doctorservice.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private DoctorRepository doctorRepository;

    @Override
    public void run(String... args) throws Exception {
        if (doctorRepository.count() == 0) {
            saveDoctor("Rajesh", "Kumar", "Cardiologist", "rajesh.kumar@hospital.com", "9000011111", "Cardiology", "MBBS MD", 10);
            saveDoctor("Meena", "Iyer", "Neurologist", "meena.iyer@hospital.com", "9000022222", "Neurology", "MBBS DM", 8);
            saveDoctor("Arjun", "Nair", "Orthopedic", "arjun.nair@hospital.com", "9000033333", "Orthopedics", "MBBS MS", 12);
            saveDoctor("Kavita", "Sharma", "Pediatrician", "kavita.sharma@hospital.com", "9000044444", "Pediatrics", "MBBS DCH", 6);
            System.out.println("Doctor database initialized with 4 sample doctors.");
        }
    }

    private void saveDoctor(String firstName, String lastName, String specialization, String email, String phone, String department, String qualification, int experienceYears) {
        Doctor doctor = new Doctor();
        doctor.setFirstName(firstName);
        doctor.setLastName(lastName);
        doctor.setSpecialization(specialization);
        doctor.setEmail(email);
        doctor.setPhone(phone);
        doctor.setDepartment(department);
        doctor.setAvailable(true);
        doctor.setQualification(qualification);
        doctor.setExperienceYears(experienceYears);
        doctorRepository.save(doctor);
    }
}
