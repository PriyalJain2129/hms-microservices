package com.hms.billingservice.config;

import com.hms.billingservice.entity.Invoice;
import com.hms.billingservice.repository.BillingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private BillingRepository billingRepository;

    @Override
    public void run(String... args) throws Exception {
        if (billingRepository.count() == 0) {
            saveInvoice(1L, 1L, "Rahul Sharma", 500.0, 150.0, 100.0, "PAID", LocalDateTime.now().minusDays(5), LocalDateTime.now().minusDays(5));
            saveInvoice(2L, 2L, "Priya Patel", 800.0, 250.0, 0.0, "PENDING", LocalDateTime.now().minusDays(2), null);
            saveInvoice(3L, 3L, "Amit Singh", 600.0, 90.0, 50.0, "PAID", LocalDateTime.now().minusDays(1), LocalDateTime.now().minusDays(1));
            System.out.println("Billing database initialized with 3 sample invoices.");
        }
    }

    private void saveInvoice(Long patientId, Long appointmentId, String patientName, double consultationFee, double medicineCost, double otherCharges, String paymentStatus, LocalDateTime billedAt, LocalDateTime paidAt) {
        Invoice invoice = new Invoice();
        invoice.setPatientId(patientId);
        invoice.setAppointmentId(appointmentId);
        invoice.setPatientName(patientName);
        invoice.setConsultationFee(consultationFee);
        invoice.setMedicineCost(medicineCost);
        invoice.setOtherCharges(otherCharges);
        invoice.setPaymentStatus(paymentStatus);
        invoice.setBilledAt(billedAt);
        invoice.setPaidAt(paidAt);
        // Total amount is auto-calculated on save via PrePersist
        billingRepository.save(invoice);
    }
}
