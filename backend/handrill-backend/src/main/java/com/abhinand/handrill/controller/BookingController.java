package com.abhinand.handrill.controller;

import com.abhinand.handrill.dto.request.AssignWorkerRequest;
import com.abhinand.handrill.dto.request.CreateBookingRequest;
import com.abhinand.handrill.dto.request.UpdateBookingStatusRequest;
import com.abhinand.handrill.dto.response.BookingResponse;
import com.abhinand.handrill.entity.User;
import com.abhinand.handrill.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<BookingResponse> create(
        @Valid @RequestBody CreateBookingRequest request,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(bookingService.create(request, user.getId()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> myBookings(@AuthenticationPrincipal User user) {
        String role = user.getRole().name();
        return ResponseEntity.ok(bookingService.getMyBookings(user.getId(), role));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getById(
        @PathVariable Long id,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(bookingService.getById(id, user.getId(), user.getRole().name()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('WORKER') or hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> updateStatus(
        @PathVariable Long id,
        @Valid @RequestBody UpdateBookingStatusRequest request,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(bookingService.updateStatus(id, request, user.getId()));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<BookingResponse> cancel(
        @PathVariable Long id,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(bookingService.cancel(id, user.getId()));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> assignWorker(
        @PathVariable Long id,
        @Valid @RequestBody AssignWorkerRequest request
    ) {
        return ResponseEntity.ok(bookingService.assignWorker(id, request));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponse>> getAll() {
        return ResponseEntity.ok(bookingService.getAll());
    }
}
