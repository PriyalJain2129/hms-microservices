package com.hms.pharmacyservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "medicines")
@Data
public class Medicine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String genericName;

    private String manufacturer;

    private String category;

    @Column(nullable = false)
    private Double price = 0.0;

    @Column(nullable = false)
    private Integer stock = 0;

    @Column(nullable = false)
    private Integer minimumStock = 10;

    private LocalDate expiryDate;

    private String description;
}
