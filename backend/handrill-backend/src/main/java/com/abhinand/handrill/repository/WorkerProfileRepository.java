package com.abhinand.handrill.repository;

import com.abhinand.handrill.entity.WorkerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface WorkerProfileRepository extends JpaRepository<WorkerProfile, Long> {

    Optional<WorkerProfile> findByUserId(Long userId);

    @Query("SELECT wp FROM WorkerProfile wp JOIN wp.specializations s WHERE s.id = :serviceId AND wp.online = true ORDER BY wp.activeJobCount ASC, wp.averageRating DESC")
    List<WorkerProfile> findEligibleWorkers(@Param("serviceId") Long serviceId);
}
