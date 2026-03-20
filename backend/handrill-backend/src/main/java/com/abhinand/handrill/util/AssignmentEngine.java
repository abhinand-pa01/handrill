package com.abhinand.handrill.util;

import com.abhinand.handrill.entity.WorkerProfile;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Component
public class AssignmentEngine {

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    public Optional<WorkerProfile> findBestWorker(List<WorkerProfile> eligibleWorkers) {
        return eligibleWorkers.stream()
            .filter(this::isAvailableNow)
            .findFirst();
    }

    private boolean isAvailableNow(WorkerProfile wp) {
        if (wp.getWorkStartTime() == null || wp.getWorkEndTime() == null) return true;
        try {
            LocalTime now = LocalTime.now();
            LocalTime start = LocalTime.parse(wp.getWorkStartTime(), TIME_FMT);
            LocalTime end = LocalTime.parse(wp.getWorkEndTime(), TIME_FMT);
            return !now.isBefore(start) && !now.isAfter(end);
        } catch (Exception e) {
            return true;
        }
    }

    public int computeScore(WorkerProfile wp) {
        double ratingScore = (wp.getAverageRating() / 5.0) * 40;
        double jobScore = Math.min(wp.getTotalJobsCompleted() / 200.0, 1.0) * 40;
        double onlineScore = wp.isOnline() ? 20 : 0;
        return (int) Math.round(ratingScore + jobScore + onlineScore);
    }
}
