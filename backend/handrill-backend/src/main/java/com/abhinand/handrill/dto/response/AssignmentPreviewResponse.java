package com.abhinand.handrill.dto.response;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AssignmentPreviewResponse {
    private WorkerProfileResponse worker;
    private int availableCount;
    private String estimatedWait;
}
