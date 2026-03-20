package com.abhinand.handrill.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "worker_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Builder.Default
    private boolean online = false;

    private String workStartTime;
    private String workEndTime;

    @Column(length = 1000)
    private String bio;

    private String location;

    private Integer experience;

    private String languages;

    @Builder.Default
    private boolean idProof = false;

    // Plain double — NO @Column annotation — Hibernate 6 does not support precision/scale on float types
    @Builder.Default
    private double averageRating = 0.0;

    @Builder.Default
    private int totalJobsCompleted = 0;

    @Builder.Default
    private int activeJobCount = 0;

    @Builder.Default
    private int performanceScore = 0;

    @Builder.Default
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "worker_specializations",
        joinColumns = @JoinColumn(name = "worker_profile_id"),
        inverseJoinColumns = @JoinColumn(name = "service_id")
    )
    private List<Service> specializations = new ArrayList<>();
}
