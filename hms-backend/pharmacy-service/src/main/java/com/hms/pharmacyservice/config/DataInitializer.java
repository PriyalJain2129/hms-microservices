package com.hms.pharmacyservice.config;

import com.hms.pharmacyservice.entity.Medicine;
import com.hms.pharmacyservice.repository.PharmacyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private PharmacyRepository pharmacyRepository;

    @Override
    public void run(String... args) throws Exception {
        if (pharmacyRepository.count() == 0) {
            saveMedicine("Paracetamol", "Acetaminophen", "Cipla", "Analgesic", 15.0, 150, 15, LocalDate.of(2027, 12, 31), "Common pain reliever and fever reducer.");
            saveMedicine("Amoxicillin", "Amoxicillin Trihydrate", "Sun Pharma", "Antibiotic", 45.0, 60, 10, LocalDate.of(2027, 6, 30), "Broad spectrum antibiotic.");
            saveMedicine("Metformin", "Metformin Hydrochloride", "Dr. Reddy's", "Antidiabetic", 25.0, 8, 15, LocalDate.of(2026, 12, 31), "Oral diabetes medicine that helps control blood sugar levels.");
            saveMedicine("Atorvastatin", "Atorvastatin Calcium", "Lupin", "Statin", 85.0, 120, 20, LocalDate.of(2027, 3, 31), "Statins to treat high cholesterol and prevent cardiovascular disease.");
            saveMedicine("Ibuprofen", "Ibuprofen", "Abbott", "NSAID", 35.0, 200, 15, LocalDate.of(2028, 1, 31), "Anti-inflammatory drug for pain relief.");
            System.out.println("Pharmacy database initialized with 5 sample medicines.");
        }
    }

    private void saveMedicine(String name, String genericName, String manufacturer, String category, double price, int stock, int minStock, LocalDate expiryDate, String description) {
        Medicine med = new Medicine();
        med.setName(name);
        med.setGenericName(genericName);
        med.setManufacturer(manufacturer);
        med.setCategory(category);
        med.setPrice(price);
        med.setStock(stock);
        med.setMinimumStock(minStock);
        med.setExpiryDate(expiryDate);
        med.setDescription(description);
        pharmacyRepository.save(med);
    }
}
