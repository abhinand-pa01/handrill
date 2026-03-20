package com.abhinand.handrill.service;

import com.abhinand.handrill.dto.request.CreateWorkerRequest;
import com.abhinand.handrill.dto.request.UpdateWorkerProfileRequest;
import com.abhinand.handrill.dto.response.AssignmentPreviewResponse;
import com.abhinand.handrill.dto.response.WorkerProfileResponse;

import java.util.List;

public interface WorkerService {
    WorkerProfileResponse getMyProfile(Long userId);
    WorkerProfileResponse toggleAvailability(Long userId);
    WorkerProfileResponse updateProfile(Long userId, UpdateWorkerProfileRequest request);
    WorkerProfileResponse createWorker(CreateWorkerRequest request);
    List<WorkerProfileResponse> getAll();
    WorkerProfileResponse getById(Long id);
    AssignmentPreviewResponse getAssignmentPreview(Long serviceId);
}
