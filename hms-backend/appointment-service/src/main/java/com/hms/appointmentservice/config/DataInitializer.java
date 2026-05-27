package com.hms.appointmentservice.config;

import com.hms.appointmentservice.entity.Appointment;
import com.hms.appointmentservice.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Override
    public void run(String... args) throws Exception {
        if (appointmentRepository.count() == 0) {
            saveAppointment(1L, 1L, LocalDateTime.now().plusDays(1), "SCHEDULED", "Routine cardiac checkup.");
            saveAppointment(2L, 2L, LocalDateTime.now().plusDays(2), "SCHEDULED", "Migraine follow-up treatment.");
            saveAppointment(3L, 3L, LocalDateTime.now().plusDays(3), "SCHEDULED", "Knee joint pain consultation.");
            saveAppointment(4L, 4L, LocalDateTime.now().plusHours(4), "SCHEDULED", "Regular pediatric growth monitoring.");
            saveAppointment(5L, 1L, LocalDateTime.now().minusDays(1), "COMPLETED", "Urgent chest pain evaluation.");
            System.out.println("Appointment database initialized with 5 sample appointments.");
        }
    }

    private void saveAppointment(Long patientId, Long doctorId, LocalDateTime date, String status, String notes) {
        Appointment app = new Appointment();
        app.setPatientId(patientId);
        app.setDoctorId(doctorId);
        app.setAppointmentDate(date);
        app.setStatus(status);
        app.setNotes(notes);
        appointmentRepository.save(app);
    }
}
