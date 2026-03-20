package com.abhinand.handrill.dto.request;
import lombok.Data;
import java.util.List;

@Data
public class UpdateWorkerProfileRequest {
    private String bio;
    private String location;
    private String languages;
    private String workStartTime;
    private String workEndTime;
    private List<Long> specializationIds;
}
