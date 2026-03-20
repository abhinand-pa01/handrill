package com.abhinand.handrill.repository;

import com.abhinand.handrill.entity.Booking;
import com.abhinand.handrill.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<Booking> findByWorkerIdOrderByCreatedAtDesc(Long workerId);

    List<Booking> findByWorkerIdAndStatusIn(Long workerId, List<BookingStatus> statuses);

    @Query(value = """
        SELECT EXTRACT(MONTH FROM created_at) AS month,
               COUNT(*) AS total,
               SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed,
               SUM(CASE WHEN status = 'COMPLETED' THEN amount ELSE 0 END) AS revenue
        FROM bookings
        WHERE created_at >= :from
        GROUP BY EXTRACT(MONTH FROM created_at)
        ORDER BY EXTRACT(MONTH FROM created_at)
        """, nativeQuery = true)
    List<Object[]> getMonthlyStats(@Param("from") LocalDateTime from);

    long countByStatus(BookingStatus status);
}
