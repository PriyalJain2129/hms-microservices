package com.hms.doctorservice.repository;

import com.hms.doctorservice.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    List<Doctor> findByDepartment(String department);
    List<Doctor> findByAvailable(boolean available);
    List<Doctor> findByFirstNameContainingOrLastNameContaining(String firstName, String lastName);
}
