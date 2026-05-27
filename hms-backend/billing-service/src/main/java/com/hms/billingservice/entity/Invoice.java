package com.hms.billingservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Data
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long patientId;

    private Long appointmentId;

    @Column(nullable = false)
    private String patientName;

    private Double consultationFee = 0.0;
    
    private Double medicineCost = 0.0;
    
    private Double otherCharges = 0.0;
    
    private Double totalAmount = 0.0;

    @Column(nullable = false)
    private String paymentStatus = "PENDING"; // PAID / PENDING / OVERDUE

    @Column(nullable = false, updatable = false)
    private LocalDateTime billedAt;

    private LocalDateTime paidAt;

    @PrePersist
    protected void onCreate() {
        billedAt = LocalDateTime.now();
        calculateTotalAmount();
    }

    @PreUpdate
    protected void onUpdate() {
        calculateTotalAmount();
    }

    public void calculateTotalAmount() {
        double fee = (consultationFee != null ? consultationFee : 0.0);
        double med = (medicineCost != null ? medicineCost : 0.0);
        double other = (otherCharges != null ? otherCharges : 0.0);
        this.totalAmount = fee + med + other;
    }
}
