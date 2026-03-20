package com.abhinand.handrill.service;

import com.abhinand.handrill.dto.response.DashboardResponse;

import java.util.List;
import java.util.Map;

public interface AdminService {
    DashboardResponse getDashboard();
    List<Map<String, Object>> getMonthlyAnalytics();
    List<Map<String, Object>> getLeaderboard();
}
