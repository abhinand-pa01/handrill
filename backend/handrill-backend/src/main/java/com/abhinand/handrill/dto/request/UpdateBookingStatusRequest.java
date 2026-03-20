package com.abhinand.handrill.dto.request;
import com.abhinand.handrill.entity.BookingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateBookingStatusRequest {
    @NotNull private BookingStatus status;
}
