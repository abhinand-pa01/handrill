package com.abhinand.handrill.controller;

import com.abhinand.handrill.dto.response.AssignmentPreviewResponse;
import com.abhinand.handrill.dto.response.ServiceResponse;
import com.abhinand.handrill.entity.Service;
import com.abhinand.handrill.exception.ResourceNotFoundException;
import com.abhinand.handrill.repository.ServiceRepository;
import com.abhinand.handrill.service.WorkerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceRepository serviceRepository;
    private final WorkerService workerService;

    @GetMapping
    public ResponseEntity<List<ServiceResponse>> getAll() {
        List<ServiceResponse> list = serviceRepository.findByActiveTrue().stream()
            .map(this::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceResponse> getById(@PathVariable Long id) {
        Service s = serviceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Service not found: " + id));
        return ResponseEntity.ok(toResponse(s));
    }

    @GetMapping("/{id}/assignment-preview")
    public ResponseEntity<AssignmentPreviewResponse> preview(@PathVariable Long id) {
        return ResponseEntity.ok(workerService.getAssignmentPreview(id));
    }

    private ServiceResponse toResponse(Service s) {
        return ServiceResponse.builder()
            .id(s.getId()).name(s.getName()).category(s.getCategory())
            .description(s.getDescription()).price(s.getPrice())
            .durationMinutes(s.getDurationMinutes()).icon(s.getIcon())
            .color(s.getColor()).rating(s.getRating())
            .totalBookings(s.getTotalBookings()).active(s.isActive())
            .features(s.getFeatures())
            .build();
    }
}
