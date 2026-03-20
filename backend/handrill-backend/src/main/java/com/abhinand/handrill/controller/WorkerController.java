package com.abhinand.handrill.controller;

import com.abhinand.handrill.dto.request.CreateWorkerRequest;
import com.abhinand.handrill.dto.request.UpdateWorkerProfileRequest;
import com.abhinand.handrill.dto.response.ReviewResponse;
import com.abhinand.handrill.dto.response.WorkerProfileResponse;
import com.abhinand.handrill.entity.User;
import com.abhinand.handrill.service.ReviewService;
import com.abhinand.handrill.service.WorkerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/workers")
@RequiredArgsConstructor
public class WorkerController {

    private final WorkerService workerService;
    private final ReviewService reviewService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<WorkerProfileResponse> getMyProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(workerService.getMyProfile(user.getId()));
    }

    @PatchMapping("/me/availability")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<WorkerProfileResponse> toggleAvailability(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(workerService.toggleAvailability(user.getId()));
    }

    @PatchMapping("/me/profile")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<WorkerProfileResponse> updateProfile(
        @Valid @RequestBody UpdateWorkerProfileRequest request,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(workerService.updateProfile(user.getId(), request));
    }

    @GetMapping("/me/reviews")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<List<ReviewResponse>> getMyReviews(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(reviewService.getWorkerReviews(user.getId()));
    }

    @PostMapping("/admin/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WorkerProfileResponse> createWorker(@Valid @RequestBody CreateWorkerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(workerService.createWorker(request));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<WorkerProfileResponse>> getAll() {
        return ResponseEntity.ok(workerService.getAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WorkerProfileResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(workerService.getById(id));
    }
}
