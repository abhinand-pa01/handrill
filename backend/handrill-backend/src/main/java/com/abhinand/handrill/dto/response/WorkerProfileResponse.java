package com.abhinand.handrill.dto.response;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class WorkerProfileResponse {
    private Long id;
    private UserResponse user;
    private boolean online;
    private String workStartTime;
    private String workEndTime;
    private String bio;
    private String location;
    private Integer experience;
    private String languages;
    private boolean idProof;
    private double averageRating;
    private int totalJobsCompleted;
    private int activeJobCount;
    private int performanceScore;
    private List<ServiceResponse> specializations;
}
