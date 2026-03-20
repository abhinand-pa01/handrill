package com.abhinand.handrill.service.impl;

import com.abhinand.handrill.dto.response.DashboardResponse;
import com.abhinand.handrill.entity.BookingStatus;
import com.abhinand.handrill.entity.Role;
import com.abhinand.handrill.repository.BookingRepository;
import com.abhinand.handrill.repository.UserRepository;
import com.abhinand.handrill.repository.WorkerProfileRepository;
import com.abhinand.handrill.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminServiceImpl implements AdminService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final WorkerProfileRepository workerProfileRepository;

    @Override
    public DashboardResponse getDashboard() {
        long total = bookingRepository.count();
        long pending = bookingRepository.countByStatus(BookingStatus.PENDING);
        long completed = bookingRepository.countByStatus(BookingStatus.COMPLETED);
        long totalWorkers = userRepository.findByRole(Role.WORKER).size();
        long activeWorkers = workerProfileRepository.findAll().stream()
            .filter(wp -> wp.isOnline()).count();
        long totalCustomers = userRepository.findByRole(Role.CUSTOMER).size();

        return DashboardResponse.builder()
            .totalBookings(total)
            .pendingBookings(pending)
            .completedBookings(completed)
            .totalWorkers(totalWorkers)
            .activeWorkers(activeWorkers)
            .totalCustomers(totalCustomers)
            .totalRevenue(0.0)
            .build();
    }

    @Override
    public List<Map<String, Object>> getMonthlyAnalytics() {
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
        List<Object[]> rows = bookingRepository.getMonthlyStats(sixMonthsAgo);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("month", row[0]);
            entry.put("total", row[1]);
            entry.put("completed", row[2]);
            entry.put("revenue", row[3]);
            result.add(entry);
        }
        return result;
    }

    @Override
    public List<Map<String, Object>> getLeaderboard() {
        return workerProfileRepository.findAll().stream()
            .sorted((a, b) -> b.getPerformanceScore() - a.getPerformanceScore())
            .limit(10)
            .map(wp -> {
                Map<String, Object> entry = new HashMap<>();
                entry.put("workerId", wp.getUser().getId());
                entry.put("name", wp.getUser().getName());
                entry.put("score", wp.getPerformanceScore());
                entry.put("rating", wp.getAverageRating());
                entry.put("jobsCompleted", wp.getTotalJobsCompleted());
                return entry;
            })
            .collect(java.util.stream.Collectors.toList());
    }
}
