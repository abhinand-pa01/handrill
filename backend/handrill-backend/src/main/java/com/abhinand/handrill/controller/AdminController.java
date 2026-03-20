package com.abhinand.handrill.controller;

import com.abhinand.handrill.dto.response.DashboardResponse;
import com.abhinand.handrill.dto.response.UserResponse;
import com.abhinand.handrill.entity.Role;
import com.abhinand.handrill.entity.User;
import com.abhinand.handrill.repository.UserRepository;
import com.abhinand.handrill.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> dashboard() {
        return ResponseEntity.ok(adminService.getDashboard());
    }

    @GetMapping("/analytics/monthly")
    public ResponseEntity<List<Map<String, Object>>> monthly() {
        return ResponseEntity.ok(adminService.getMonthlyAnalytics());
    }

    @GetMapping("/analytics/leaderboard")
    public ResponseEntity<List<Map<String, Object>>> leaderboard() {
        return ResponseEntity.ok(adminService.getLeaderboard());
    }

    @GetMapping("/customers")
    public ResponseEntity<List<UserResponse>> customers() {
        List<UserResponse> list = userRepository.findByRole(Role.CUSTOMER).stream()
            .map(u -> UserResponse.builder()
                .id(u.getId()).name(u.getName()).email(u.getEmail())
                .phone(u.getPhone()).address(u.getAddress()).role(u.getRole())
                .build())
            .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }
}
