package com.abhinand.handrill.dto.response;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class ServiceResponse {
    private Long id;
    private String name;
    private String category;
    private String description;
    private BigDecimal price;
    private Integer durationMinutes;
    private String icon;
    private String color;
    private BigDecimal rating;
    private Long totalBookings;
    private boolean active;
    private List<String> features;
}
