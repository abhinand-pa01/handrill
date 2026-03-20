package com.abhinand.handrill.service;

import com.abhinand.handrill.dto.request.CreateReviewRequest;
import com.abhinand.handrill.dto.response.ReviewResponse;

import java.util.List;

public interface ReviewService {
    ReviewResponse create(CreateReviewRequest request, Long customerId);
    ReviewResponse getByBookingId(Long bookingId);
    List<ReviewResponse> getWorkerReviews(Long workerId);
}
