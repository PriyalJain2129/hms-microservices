package com.hms.pharmacyservice.repository;

import com.hms.pharmacyservice.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PharmacyRepository extends JpaRepository<Medicine, Long> {
    List<Medicine> findByNameContaining(String name);
    List<Medicine> findByStockLessThanEqual(Integer stock);

    @Query("SELECT m FROM Medicine m WHERE m.stock <= m.minimumStock")
    List<Medicine> findLowStockMedicines();
}

