package com.abhinand.handrill.controller;

import com.abhinand.handrill.dto.request.CreateReviewRequest;
import com.abhinand.handrill.dto.response.ReviewResponse;
import com.abhinand.handrill.entity.User;
import com.abhinand.handrill.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReviewResponse> create(
        @Valid @RequestBody CreateReviewRequest request,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(reviewService.create(request, user.getId()));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ReviewResponse> getByBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(reviewService.getByBookingId(bookingId));
    }
}
