package com.hms.appointmentservice.controller;

import com.hms.appointmentservice.client.DoctorClient;
import com.hms.appointmentservice.client.PatientClient;
import com.hms.appointmentservice.entity.Appointment;
import com.hms.appointmentservice.repository.AppointmentRepository;
import com.hms.appointmentservice.dto.AppointmentResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:5173")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientClient patientClient;

    @Autowired
    private DoctorClient doctorClient;

    private String fetchPatientName(Long patientId) {
        try {
            Object response = patientClient.getPatient(patientId);
            if (response instanceof java.util.Map) {
                java.util.Map<?, ?> map = (java.util.Map<?, ?>) response;
                Object first = map.get("firstName");
                Object last = map.get("lastName");
                if (first != null || last != null) {
                    return (first != null ? first.toString() : "") + " " + (last != null ? last.toString() : "");
                }
            }
        } catch (Exception e) {
            // fallback
        }
        return "Patient #" + patientId;
    }

    private String fetchDoctorName(Long doctorId) {
        try {
            Object response = doctorClient.getDoctor(doctorId);
            if (response instanceof java.util.Map) {
                java.util.Map<?, ?> map = (java.util.Map<?, ?>) response;
                Object first = map.get("firstName");
                Object last = map.get("lastName");
                if (first != null || last != null) {
                    return "Dr. " + (first != null ? first.toString() : "") + " " + (last != null ? last.toString() : "");
                }
            }
        } catch (Exception e) {
            // fallback
        }
        return "Doctor #" + doctorId;
    }

    private AppointmentResponse toResponse(Appointment appointment) {
        return new AppointmentResponse(
                appointment.getId(),
                appointment.getPatientId(),
                appointment.getDoctorId(),
                appointment.getAppointmentDate(),
                appointment.getStatus(),
                appointment.getNotes(),
                appointment.getCreatedAt(),
                fetchPatientName(appointment.getPatientId()),
                fetchDoctorName(appointment.getDoctorId())
        );
    }

    @GetMapping
    public ResponseEntity<List<com.hms.appointmentservice.dto.AppointmentResponse>> getAllAppointments() {
        List<com.hms.appointmentservice.dto.AppointmentResponse> list = appointmentRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<com.hms.appointmentservice.dto.AppointmentResponse> getAppointmentById(@PathVariable Long id) {
        return appointmentRepository.findById(id)
                .map(this::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<com.hms.appointmentservice.dto.AppointmentResponse>> getAppointmentsByPatient(@PathVariable Long patientId) {
        List<com.hms.appointmentservice.dto.AppointmentResponse> list = appointmentRepository.findByPatientId(patientId).stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<com.hms.appointmentservice.dto.AppointmentResponse>> getAppointmentsByDoctor(@PathVariable Long doctorId) {
        List<com.hms.appointmentservice.dto.AppointmentResponse> list = appointmentRepository.findByDoctorId(doctorId).stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/today")
    public ResponseEntity<List<com.hms.appointmentservice.dto.AppointmentResponse>> getTodayAppointments() {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().atTime(LocalTime.MAX);
        List<com.hms.appointmentservice.dto.AppointmentResponse> list = appointmentRepository.findByAppointmentDateBetween(start, end).stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getCount() {
        return ResponseEntity.ok(appointmentRepository.count());
    }

    @GetMapping("/count/today")
    public ResponseEntity<Long> getTodayCount() {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().atTime(LocalTime.MAX);
        return ResponseEntity.ok(appointmentRepository.countByAppointmentDateBetween(start, end));
    }

    @PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody Appointment appointment) {
        try {
            // Verify patient
            try {
                Object patient = patientClient.getPatient(appointment.getPatientId());
                if (patient == null) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Patient not found");
                }
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error verifying Patient: " + e.getMessage());
            }

            // Verify doctor
            try {
                Object doctor = doctorClient.getDoctor(appointment.getDoctorId());
                if (doctor == null) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Doctor not found");
                }
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error verifying Doctor: " + e.getMessage());
            }

            appointment.setStatus("SCHEDULED");
            return ResponseEntity.status(HttpStatus.CREATED).body(appointmentRepository.save(appointment));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Appointment> updateStatus(@PathVariable Long id, @RequestParam("status") String status) {
        return appointmentRepository.findById(id)
                .map(appointment -> {
                    appointment.setStatus(status);
                    return ResponseEntity.ok(appointmentRepository.save(appointment));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        if (appointmentRepository.existsById(id)) {
            appointmentRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
