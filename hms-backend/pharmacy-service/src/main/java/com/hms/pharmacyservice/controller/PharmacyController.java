package com.hms.pharmacyservice.controller;

import com.hms.pharmacyservice.entity.Medicine;
import com.hms.pharmacyservice.repository.PharmacyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pharmacy")
@CrossOrigin(origins = "http://localhost:5173")
public class PharmacyController {

    @Autowired
    private PharmacyRepository pharmacyRepository;

    @GetMapping
    public ResponseEntity<List<Medicine>> getAllMedicines() {
        return ResponseEntity.ok(pharmacyRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Medicine> getMedicineById(@PathVariable Long id) {
        return pharmacyRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Medicine>> searchMedicines(@RequestParam("name") String name) {
        return ResponseEntity.ok(pharmacyRepository.findByNameContaining(name));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<Medicine>> getLowStockMedicines() {
        return ResponseEntity.ok(pharmacyRepository.findLowStockMedicines());
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getCount() {
        return ResponseEntity.ok(pharmacyRepository.count());
    }

    @PostMapping
    public ResponseEntity<Medicine> createMedicine(@RequestBody Medicine medicine) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pharmacyRepository.save(medicine));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Medicine> updateMedicine(@PathVariable Long id, @RequestBody Medicine medicineDetails) {
        return pharmacyRepository.findById(id)
                .map(medicine -> {
                    medicine.setName(medicineDetails.getName());
                    medicine.setGenericName(medicineDetails.getGenericName());
                    medicine.setManufacturer(medicineDetails.getManufacturer());
                    medicine.setCategory(medicineDetails.getCategory());
                    medicine.setPrice(medicineDetails.getPrice());
                    medicine.setStock(medicineDetails.getStock());
                    medicine.setMinimumStock(medicineDetails.getMinimumStock());
                    medicine.setExpiryDate(medicineDetails.getExpiryDate());
                    medicine.setDescription(medicineDetails.getDescription());
                    return ResponseEntity.ok(pharmacyRepository.save(medicine));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/stock")
    public ResponseEntity<Medicine> updateStock(@PathVariable Long id, @RequestParam("quantity") Integer quantity) {
        return pharmacyRepository.findById(id)
                .map(medicine -> {
                    medicine.setStock(quantity);
                    return ResponseEntity.ok(pharmacyRepository.save(medicine));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedicine(@PathVariable Long id) {
        if (pharmacyRepository.existsById(id)) {
            pharmacyRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
