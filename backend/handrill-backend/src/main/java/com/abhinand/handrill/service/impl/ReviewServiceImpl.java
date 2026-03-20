package com.abhinand.handrill.service.impl;

import com.abhinand.handrill.dto.request.CreateReviewRequest;
import com.abhinand.handrill.dto.response.ReviewResponse;
import com.abhinand.handrill.dto.response.UserResponse;
import com.abhinand.handrill.entity.Booking;
import com.abhinand.handrill.entity.BookingStatus;
import com.abhinand.handrill.entity.Review;
import com.abhinand.handrill.entity.User;
import com.abhinand.handrill.exception.DuplicateResourceException;
import com.abhinand.handrill.exception.InvalidOperationException;
import com.abhinand.handrill.exception.ResourceNotFoundException;
import com.abhinand.handrill.repository.BookingRepository;
import com.abhinand.handrill.repository.ReviewRepository;
import com.abhinand.handrill.repository.WorkerProfileRepository;
import com.abhinand.handrill.service.ReviewService;
import com.abhinand.handrill.util.AssignmentEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final AssignmentEngine assignmentEngine;

    @Override
    public ReviewResponse create(CreateReviewRequest request, Long customerId) {
        Booking booking = bookingRepository.findById(request.getBookingId())
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getCustomer().getId().equals(customerId)) {
            throw new InvalidOperationException("You can only review your own bookings");
        }
        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new InvalidOperationException("Can only review completed bookings");
        }
        if (reviewRepository.existsByBookingId(booking.getId())) {
            throw new DuplicateResourceException("Review already submitted for this booking");
        }
        if (booking.getWorker() == null) {
            throw new InvalidOperationException("No worker to review for this booking");
        }

        Review review = Review.builder()
            .booking(booking)
            .customer(booking.getCustomer())
            .worker(booking.getWorker())
            .rating(request.getRating())
            .comment(request.getComment())
            .build();
        reviewRepository.save(review);

        booking.setReviewed(true);
        bookingRepository.save(booking);

        // Recalculate worker average rating
        workerProfileRepository.findByUserId(booking.getWorker().getId()).ifPresent(wp -> {
            Double avg = reviewRepository.getAverageRatingForWorker(booking.getWorker().getId());
            if (avg != null) {
                wp.setAverageRating(Math.round(avg * 10.0) / 10.0);
            }
            wp.setPerformanceScore(assignmentEngine.computeScore(wp));
            workerProfileRepository.save(wp);
        });

        return toResponse(review);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewResponse getByBookingId(Long bookingId) {
        Review review = reviewRepository.findByBookingId(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found for booking: " + bookingId));
        return toResponse(review);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getWorkerReviews(Long workerId) {
        return reviewRepository.findByWorkerIdOrderByCreatedAtDesc(workerId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private ReviewResponse toResponse(Review r) {
        return ReviewResponse.builder()
            .id(r.getId())
            .bookingId(r.getBooking().getId())
            .customer(toUserResp(r.getCustomer()))
            .worker(toUserResp(r.getWorker()))
            .rating(r.getRating())
            .comment(r.getComment())
            .createdAt(r.getCreatedAt())
            .build();
    }

    private UserResponse toUserResp(User u) {
        return UserResponse.builder()
            .id(u.getId()).name(u.getName()).email(u.getEmail())
            .phone(u.getPhone()).role(u.getRole()).build();
    }
}
