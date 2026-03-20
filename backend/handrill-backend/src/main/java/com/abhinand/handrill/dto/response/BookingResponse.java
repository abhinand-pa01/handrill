package com.abhinand.handrill.dto.response;
import com.abhinand.handrill.entity.BookingStatus;
import com.abhinand.handrill.entity.PaymentStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class BookingResponse {
    private Long id;
    private UserResponse customer;
    private ServiceResponse service;
    private UserResponse worker;
    private BookingStatus status;
    private PaymentStatus paymentStatus;
    private LocalDateTime scheduledAt;
    private String serviceAddress;
    private String notes;
    private BigDecimal amount;
    private boolean reviewed;
    private LocalDateTime assignedAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
}
