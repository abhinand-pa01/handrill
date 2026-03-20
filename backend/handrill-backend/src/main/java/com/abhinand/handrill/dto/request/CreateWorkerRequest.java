package com.abhinand.handrill.dto.request;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class CreateWorkerRequest {
    @NotBlank private String name;
    @NotBlank @Email private String email;
    private String phone;
    private String location;
    private String bio;
    private Integer experience;
    private String languages;
    private String workStartTime;
    private String workEndTime;
    private boolean idProof;
    private List<Long> specializationIds;
}
