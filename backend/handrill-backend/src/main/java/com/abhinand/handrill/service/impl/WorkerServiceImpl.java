package com.abhinand.handrill.service.impl;

import com.abhinand.handrill.dto.request.CreateWorkerRequest;
import com.abhinand.handrill.dto.request.UpdateWorkerProfileRequest;
import com.abhinand.handrill.dto.response.AssignmentPreviewResponse;
import com.abhinand.handrill.dto.response.ServiceResponse;
import com.abhinand.handrill.dto.response.UserResponse;
import com.abhinand.handrill.dto.response.WorkerProfileResponse;
import com.abhinand.handrill.entity.Role;
import com.abhinand.handrill.entity.User;
import com.abhinand.handrill.entity.WorkerProfile;
import com.abhinand.handrill.exception.DuplicateResourceException;
import com.abhinand.handrill.exception.ResourceNotFoundException;
import com.abhinand.handrill.repository.ServiceRepository;
import com.abhinand.handrill.repository.UserRepository;
import com.abhinand.handrill.repository.WorkerProfileRepository;
import com.abhinand.handrill.service.WorkerService;
import com.abhinand.handrill.util.AssignmentEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkerServiceImpl implements WorkerService {

    private final WorkerProfileRepository workerProfileRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final PasswordEncoder passwordEncoder;
    private final AssignmentEngine assignmentEngine;

    @Override
    @Transactional(readOnly = true)
    public WorkerProfileResponse getMyProfile(Long userId) {
        WorkerProfile wp = workerProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found"));
        return toResponse(wp);
    }

    @Override
    public WorkerProfileResponse toggleAvailability(Long userId) {
        WorkerProfile wp = workerProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found"));
        wp.setOnline(!wp.isOnline());
        return toResponse(workerProfileRepository.save(wp));
    }

    @Override
    public WorkerProfileResponse updateProfile(Long userId, UpdateWorkerProfileRequest request) {
        WorkerProfile wp = workerProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found"));

        if (request.getBio() != null) wp.setBio(request.getBio());
        if (request.getLocation() != null) wp.setLocation(request.getLocation());
        if (request.getLanguages() != null) wp.setLanguages(request.getLanguages());
        if (request.getWorkStartTime() != null) wp.setWorkStartTime(request.getWorkStartTime());
        if (request.getWorkEndTime() != null) wp.setWorkEndTime(request.getWorkEndTime());
        if (request.getSpecializationIds() != null) {
            List<com.abhinand.handrill.entity.Service> specs = serviceRepository.findAllById(request.getSpecializationIds());
            wp.setSpecializations(specs);
        }

        return toResponse(workerProfileRepository.save(wp));
    }

    @Override
    public WorkerProfileResponse createWorker(CreateWorkerRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
            .name(request.getName())
            .email(request.getEmail())
            .phone(request.getPhone())
            .password(passwordEncoder.encode("demo123"))
            .role(Role.WORKER)
            .build();
        userRepository.save(user);

        List<com.abhinand.handrill.entity.Service> specs = new ArrayList<>();
        if (request.getSpecializationIds() != null) {
            specs = serviceRepository.findAllById(request.getSpecializationIds());
        }

        WorkerProfile wp = WorkerProfile.builder()
            .user(user)
            .location(request.getLocation() != null ? request.getLocation() : "Thrissur")
            .bio(request.getBio())
            .experience(request.getExperience() != null ? request.getExperience() : 1)
            .languages(request.getLanguages() != null ? request.getLanguages() : "Malayalam")
            .workStartTime(request.getWorkStartTime() != null ? request.getWorkStartTime() : "09:00")
            .workEndTime(request.getWorkEndTime() != null ? request.getWorkEndTime() : "18:00")
            .idProof(request.isIdProof())
            .specializations(specs)
            .build();

        return toResponse(workerProfileRepository.save(wp));
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkerProfileResponse> getAll() {
        return workerProfileRepository.findAll().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public WorkerProfileResponse getById(Long id) {
        WorkerProfile wp = workerProfileRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Worker not found: " + id));
        return toResponse(wp);
    }

    @Override
    @Transactional(readOnly = true)
    public AssignmentPreviewResponse getAssignmentPreview(Long serviceId) {
        List<WorkerProfile> eligible = workerProfileRepository.findEligibleWorkers(serviceId);
        Optional<WorkerProfile> best = assignmentEngine.findBestWorker(eligible);

        return AssignmentPreviewResponse.builder()
            .worker(best.map(this::toResponse).orElse(null))
            .availableCount(eligible.size())
            .estimatedWait(best.isPresent() ? "30-45 minutes" : null)
            .build();
    }

    private WorkerProfileResponse toResponse(WorkerProfile wp) {
        User u = wp.getUser();
        return WorkerProfileResponse.builder()
            .id(wp.getId())
            .user(UserResponse.builder()
                .id(u.getId()).name(u.getName()).email(u.getEmail())
                .phone(u.getPhone()).address(u.getAddress()).role(u.getRole())
                .build())
            .online(wp.isOnline())
            .workStartTime(wp.getWorkStartTime())
            .workEndTime(wp.getWorkEndTime())
            .bio(wp.getBio())
            .location(wp.getLocation())
            .experience(wp.getExperience())
            .languages(wp.getLanguages())
            .idProof(wp.isIdProof())
            .averageRating(wp.getAverageRating())
            .totalJobsCompleted(wp.getTotalJobsCompleted())
            .activeJobCount(wp.getActiveJobCount())
            .performanceScore(wp.getPerformanceScore())
            .specializations(wp.getSpecializations() == null ? List.of() :
                wp.getSpecializations().stream().map(s -> ServiceResponse.builder()
                    .id(s.getId()).name(s.getName()).category(s.getCategory())
                    .description(s.getDescription()).price(s.getPrice())
                    .durationMinutes(s.getDurationMinutes()).icon(s.getIcon())
                    .color(s.getColor()).rating(s.getRating())
                    .totalBookings(s.getTotalBookings()).active(s.isActive())
                    .features(s.getFeatures())
                    .build()).collect(Collectors.toList()))
            .build();
    }
}
