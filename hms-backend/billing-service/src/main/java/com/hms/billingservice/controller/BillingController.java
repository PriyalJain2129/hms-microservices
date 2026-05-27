package com.hms.billingservice.controller;

import com.hms.billingservice.entity.Invoice;
import com.hms.billingservice.repository.BillingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/billing")
@CrossOrigin(origins = "http://localhost:5173")
public class BillingController {

    @Autowired
    private BillingRepository billingRepository;

    @GetMapping
    public ResponseEntity<List<Invoice>> getAllInvoices() {
        return ResponseEntity.ok(billingRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Invoice> getInvoiceById(@PathVariable Long id) {
        return billingRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Invoice>> getInvoicesByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(billingRepository.findByPatientId(patientId));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Invoice>> getPendingInvoices() {
        return ResponseEntity.ok(billingRepository.findByPaymentStatus("PENDING"));
    }

    @GetMapping("/revenue/total")
    public ResponseEntity<Double> getTotalRevenue() {
        return ResponseEntity.ok(billingRepository.getTotalRevenue());
    }

    @GetMapping("/count/pending")
    public ResponseEntity<Long> getPendingCount() {
        return ResponseEntity.ok(billingRepository.countByPaymentStatus("PENDING"));
    }

    @PostMapping
    public ResponseEntity<Invoice> createInvoice(@RequestBody Invoice invoice) {
        invoice.calculateTotalAmount();
        return ResponseEntity.status(HttpStatus.CREATED).body(billingRepository.save(invoice));
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<Invoice> markAsPaid(@PathVariable Long id) {
        return billingRepository.findById(id)
                .map(invoice -> {
                    invoice.setPaymentStatus("PAID");
                    invoice.setPaidAt(LocalDateTime.now());
                    return ResponseEntity.ok(billingRepository.save(invoice));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable Long id) {
        if (billingRepository.existsById(id)) {
            billingRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
