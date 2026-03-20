package com.abhinand.handrill.service.impl;

import com.abhinand.handrill.dto.request.AssignWorkerRequest;
import com.abhinand.handrill.dto.request.CreateBookingRequest;
import com.abhinand.handrill.dto.request.UpdateBookingStatusRequest;
import com.abhinand.handrill.dto.response.BookingResponse;
import com.abhinand.handrill.dto.response.ServiceResponse;
import com.abhinand.handrill.dto.response.UserResponse;
import com.abhinand.handrill.entity.*;
import com.abhinand.handrill.exception.BookingStatusException;
import com.abhinand.handrill.exception.InvalidOperationException;
import com.abhinand.handrill.exception.ResourceNotFoundException;
import com.abhinand.handrill.repository.BookingRepository;
import com.abhinand.handrill.repository.ServiceRepository;
import com.abhinand.handrill.repository.UserRepository;
import com.abhinand.handrill.repository.WorkerProfileRepository;
import com.abhinand.handrill.service.BookingService;
import com.abhinand.handrill.util.AssignmentEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final AssignmentEngine assignmentEngine;

    @Override
    public BookingResponse create(CreateBookingRequest request, Long customerId) {
        User customer = userRepository.findById(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        com.abhinand.handrill.entity.Service service = serviceRepository.findById(request.getServiceId())
            .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        List<WorkerProfile> eligible = workerProfileRepository.findEligibleWorkers(service.getId());
        Optional<WorkerProfile> bestWorker = assignmentEngine.findBestWorker(eligible);

        Booking booking = Booking.builder()
            .customer(customer)
            .service(service)
            .worker(bestWorker.map(WorkerProfile::getUser).orElse(null))
            .status(bestWorker.isPresent() ? BookingStatus.ASSIGNED : BookingStatus.PENDING)
            .scheduledAt(request.getScheduledAt())
            .serviceAddress(request.getServiceAddress())
            .notes(request.getNotes())
            .amount(service.getPrice())
            .assignedAt(bestWorker.isPresent() ? LocalDateTime.now() : null)
            .build();

        bookingRepository.save(booking);

        bestWorker.ifPresent(wp -> {
            wp.setActiveJobCount(wp.getActiveJobCount() + 1);
            workerProfileRepository.save(wp);
        });

        service.setTotalBookings(service.getTotalBookings() + 1);
        serviceRepository.save(service);

        return toResponse(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(Long userId, String role) {
        List<Booking> bookings = role.equals("WORKER")
            ? bookingRepository.findByWorkerIdOrderByCreatedAtDesc(userId)
            : bookingRepository.findByCustomerIdOrderByCreatedAtDesc(userId);
        return bookings.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getById(Long id, Long requesterId, String role) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
        if (!role.equals("ADMIN") &&
            !booking.getCustomer().getId().equals(requesterId) &&
            (booking.getWorker() == null || !booking.getWorker().getId().equals(requesterId))) {
            throw new InvalidOperationException("Access denied to this booking");
        }
        return toResponse(booking);
    }

    @Override
    public BookingResponse updateStatus(Long id, UpdateBookingStatusRequest request, Long workerId) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));

        BookingStatus newStatus = request.getStatus();
        BookingStatus current = booking.getStatus();

        boolean validTransition =
            (current == BookingStatus.ASSIGNED && newStatus == BookingStatus.INPROGRESS) ||
            (current == BookingStatus.INPROGRESS && newStatus == BookingStatus.COMPLETED);

        if (!validTransition) {
            throw new BookingStatusException("Invalid status transition: " + current + " -> " + newStatus);
        }

        booking.setStatus(newStatus);

        if (newStatus == BookingStatus.INPROGRESS) {
            booking.setStartedAt(LocalDateTime.now());
        } else if (newStatus == BookingStatus.COMPLETED) {
            booking.setCompletedAt(LocalDateTime.now());
            booking.setPaymentStatus(PaymentStatus.PAID);
            workerProfileRepository.findByUserId(workerId).ifPresent(wp -> {
                wp.setActiveJobCount(Math.max(0, wp.getActiveJobCount() - 1));
                wp.setTotalJobsCompleted(wp.getTotalJobsCompleted() + 1);
                wp.setPerformanceScore(assignmentEngine.computeScore(wp));
                workerProfileRepository.save(wp);
            });
        }

        return toResponse(bookingRepository.save(booking));
    }

    @Override
    public BookingResponse cancel(Long id, Long customerId) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));

        if (!booking.getCustomer().getId().equals(customerId)) {
            throw new InvalidOperationException("You can only cancel your own bookings");
        }
        if (booking.getStatus() == BookingStatus.COMPLETED || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BookingStatusException("Cannot cancel a " + booking.getStatus() + " booking");
        }

        if (booking.getWorker() != null) {
            workerProfileRepository.findByUserId(booking.getWorker().getId()).ifPresent(wp -> {
                wp.setActiveJobCount(Math.max(0, wp.getActiveJobCount() - 1));
                workerProfileRepository.save(wp);
            });
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setPaymentStatus(
            booking.getPaymentStatus() == PaymentStatus.PAID ? PaymentStatus.REFUNDED : PaymentStatus.CANCELLED
        );
        return toResponse(bookingRepository.save(booking));
    }

    @Override
    public BookingResponse assignWorker(Long id, AssignWorkerRequest request) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));

        if (booking.getWorker() != null) {
            workerProfileRepository.findByUserId(booking.getWorker().getId()).ifPresent(wp -> {
                wp.setActiveJobCount(Math.max(0, wp.getActiveJobCount() - 1));
                workerProfileRepository.save(wp);
            });
        }

        User newWorker = userRepository.findById(request.getWorkerId())
            .orElseThrow(() -> new ResourceNotFoundException("Worker not found: " + request.getWorkerId()));

        booking.setWorker(newWorker);
        booking.setStatus(BookingStatus.ASSIGNED);
        booking.setAssignedAt(LocalDateTime.now());

        workerProfileRepository.findByUserId(newWorker.getId()).ifPresent(wp -> {
            wp.setActiveJobCount(wp.getActiveJobCount() + 1);
            workerProfileRepository.save(wp);
        });

        return toResponse(bookingRepository.save(booking));
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getAll() {
        return bookingRepository.findAll().stream()
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    private BookingResponse toResponse(Booking b) {
        return BookingResponse.builder()
            .id(b.getId())
            .customer(toUserResp(b.getCustomer()))
            .service(toServiceResp(b.getService()))
            .worker(b.getWorker() != null ? toUserResp(b.getWorker()) : null)
            .status(b.getStatus())
            .paymentStatus(b.getPaymentStatus())
            .scheduledAt(b.getScheduledAt())
            .serviceAddress(b.getServiceAddress())
            .notes(b.getNotes())
            .amount(b.getAmount())
            .reviewed(b.isReviewed())
            .assignedAt(b.getAssignedAt())
            .startedAt(b.getStartedAt())
            .completedAt(b.getCompletedAt())
            .createdAt(b.getCreatedAt())
            .build();
    }

    private UserResponse toUserResp(User u) {
        if (u == null) return null;
        return UserResponse.builder()
            .id(u.getId()).name(u.getName()).email(u.getEmail())
            .phone(u.getPhone()).address(u.getAddress()).role(u.getRole())
            .build();
    }

    private ServiceResponse toServiceResp(com.abhinand.handrill.entity.Service s) {
        if (s == null) return null;
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
