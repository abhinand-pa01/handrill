package com.abhinand.handrill.service;

import com.abhinand.handrill.dto.request.AssignWorkerRequest;
import com.abhinand.handrill.dto.request.CreateBookingRequest;
import com.abhinand.handrill.dto.request.UpdateBookingStatusRequest;
import com.abhinand.handrill.dto.response.BookingResponse;

import java.util.List;

public interface BookingService {
    BookingResponse create(CreateBookingRequest request, Long customerId);
    List<BookingResponse> getMyBookings(Long userId, String role);
    BookingResponse getById(Long id, Long requesterId, String role);
    BookingResponse updateStatus(Long id, UpdateBookingStatusRequest request, Long workerId);
    BookingResponse cancel(Long id, Long customerId);
    BookingResponse assignWorker(Long id, AssignWorkerRequest request);
    List<BookingResponse> getAll();
}
