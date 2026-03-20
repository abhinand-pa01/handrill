package com.abhinand.handrill.dto.request;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignWorkerRequest {
    @NotNull private Long workerId;
}
