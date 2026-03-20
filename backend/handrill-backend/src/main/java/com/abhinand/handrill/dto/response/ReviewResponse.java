package com.abhinand.handrill.dto.response;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ReviewResponse {
    private Long id;
    private Long bookingId;
    private UserResponse customer;
    private UserResponse worker;
    private int rating;
    private String comment;
    private LocalDateTime createdAt;
}
