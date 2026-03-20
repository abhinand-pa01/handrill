package com.abhinand.handrill.dto.request;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateBookingRequest {
    @NotNull private Long serviceId;
    @NotNull private LocalDateTime scheduledAt;
    @NotNull private String serviceAddress;
    private String notes;
}
