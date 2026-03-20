package com.abhinand.handrill.seeder;

import com.abhinand.handrill.entity.*;
import com.abhinand.handrill.repository.*;
import com.abhinand.handrill.util.AssignmentEngine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepo;
    private final ServiceRepository serviceRepo;
    private final WorkerProfileRepository workerProfileRepo;
    private final BookingRepository bookingRepo;
    private final ReviewRepository reviewRepo;
    private final PasswordEncoder passwordEncoder;
    private final AssignmentEngine assignmentEngine;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepo.count() > 0) {
            log.info("Data already seeded — skipping.");
            return;
        }
        log.info("Seeding demo data...");

        String pw = passwordEncoder.encode("demo123");

        // ── Services ────────────────────────────────────────────────────────
        com.abhinand.handrill.entity.Service plumbing = serviceRepo.save(
            com.abhinand.handrill.entity.Service.builder()
                .name("Plumbing").category("Repair")
                .description("Pipe repairs, leakage fixing, tap installations")
                .price(new BigDecimal("599.00")).durationMinutes(60)
                .icon("Wrench").color("#3B82F6").rating(new BigDecimal("4.7"))
                .totalBookings(1240L).active(true)
                .features(new ArrayList<>(List.of("Pipe repair","Tap installation","Drain cleaning")))
                .build());

        com.abhinand.handrill.entity.Service electrical = serviceRepo.save(
            com.abhinand.handrill.entity.Service.builder()
                .name("Electrical").category("Repair")
                .description("Wiring, switchboard repair, fan and light installations")
                .price(new BigDecimal("749.00")).durationMinutes(90)
                .icon("Zap").color("#F59E0B").rating(new BigDecimal("4.8"))
                .totalBookings(980L).active(true)
                .features(new ArrayList<>(List.of("Wiring repair","Switchboard fix","Fan installation")))
                .build());

        com.abhinand.handrill.entity.Service cleaning = serviceRepo.save(
            com.abhinand.handrill.entity.Service.builder()
                .name("Cleaning").category("Cleaning")
                .description("Deep home cleaning, kitchen scrubbing, bathroom sanitization")
                .price(new BigDecimal("399.00")).durationMinutes(120)
                .icon("Sparkles").color("#14B8A6").rating(new BigDecimal("4.6"))
                .totalBookings(2100L).active(true)
                .features(new ArrayList<>(List.of("Deep cleaning","Kitchen scrub","Bathroom sanitize")))
                .build());

        com.abhinand.handrill.entity.Service acService = serviceRepo.save(
            com.abhinand.handrill.entity.Service.builder()
                .name("AC Service").category("Appliance")
                .description("AC cleaning, gas refilling, compressor repair")
                .price(new BigDecimal("449.00")).durationMinutes(75)
                .icon("Wind").color("#8B5CF6").rating(new BigDecimal("4.5"))
                .totalBookings(760L).active(true)
                .features(new ArrayList<>(List.of("Filter cleaning","Gas refill","Compressor check")))
                .build());

        com.abhinand.handrill.entity.Service carpentry = serviceRepo.save(
            com.abhinand.handrill.entity.Service.builder()
                .name("Carpentry").category("Repair")
                .description("Furniture repair, door fitting, cabinet installation")
                .price(new BigDecimal("499.00")).durationMinutes(90)
                .icon("Hammer").color("#D97706").rating(new BigDecimal("4.4"))
                .totalBookings(540L).active(true)
                .features(new ArrayList<>(List.of("Furniture repair","Door fitting","Cabinet work")))
                .build());

        com.abhinand.handrill.entity.Service painting = serviceRepo.save(
            com.abhinand.handrill.entity.Service.builder()
                .name("Painting").category("Renovation")
                .description("Interior and exterior wall painting with premium finish")
                .price(new BigDecimal("749.00")).durationMinutes(180)
                .icon("PaintBucket").color("#EC4899").rating(new BigDecimal("4.3"))
                .totalBookings(430L).active(true)
                .features(new ArrayList<>(List.of("Wall painting","Texture finish","Primer coat")))
                .build());

        com.abhinand.handrill.entity.Service pestControl = serviceRepo.save(
            com.abhinand.handrill.entity.Service.builder()
                .name("Pest Control").category("Cleaning")
                .description("Termite, cockroach, mosquito and rat control treatment")
                .price(new BigDecimal("349.00")).durationMinutes(60)
                .icon("ShieldCheck").color("#EF4444").rating(new BigDecimal("4.6"))
                .totalBookings(890L).active(true)
                .features(new ArrayList<>(List.of("Termite control","Cockroach spray","Mosquito fogging")))
                .build());

        com.abhinand.handrill.entity.Service appliance = serviceRepo.save(
            com.abhinand.handrill.entity.Service.builder()
                .name("Appliance Repair").category("Appliance")
                .description("Washing machine, refrigerator, microwave and TV repairs")
                .price(new BigDecimal("399.00")).durationMinutes(60)
                .icon("Settings").color("#10B981").rating(new BigDecimal("4.5"))
                .totalBookings(670L).active(true)
                .features(new ArrayList<>(List.of("Washing machine","Fridge repair","Microwave fix")))
                .build());

        // ── Users ────────────────────────────────────────────────────────────
        User admin = userRepo.save(User.builder()
            .name("Admin Handrill").email("admin@handrill.com").password(pw)
            .phone("+91 80000 00001").address("Handrill HQ, Thrissur, Kerala")
            .role(Role.ADMIN).build());

        User c1 = userRepo.save(User.builder()
            .name("Arjun Pillai").email("customer@handrill.com").password(pw)
            .phone("+91 94470 12345").address("45 MG Road, Swaraj Round, Thrissur, Kerala - 680001")
            .role(Role.CUSTOMER).build());

        // Demo worker account (Vinod Varma)
        User vinod = userRepo.save(User.builder()
            .name("Vinod Varma").email("worker@handrill.com").password(pw)
            .phone("+91 98765 43216").role(Role.WORKER).build());

        WorkerProfile vinodProfile = WorkerProfile.builder()
            .user(vinod).online(true).location("Thrissur").experience(7)
            .bio("Multi-skilled technician. Handles electrical, plumbing and appliance repairs efficiently.")
            .languages("Malayalam, English").idProof(true)
            .averageRating(4.7).totalJobsCompleted(298).activeJobCount(1)
            .workStartTime("08:00").workEndTime("20:00")
            .specializations(new ArrayList<>(List.of(electrical, appliance, plumbing)))
            .build();
        vinodProfile.setPerformanceScore(assignmentEngine.computeScore(vinodProfile));
        workerProfileRepo.save(vinodProfile);

        // ── Historical bookings (for admin charts) ───────────────────────────
        LocalDateTime now = LocalDateTime.now();

        // Current / recent
        Booking b1 = bookingRepo.save(Booking.builder()
            .customer(c1).service(electrical).worker(vinod)
            .status(BookingStatus.INPROGRESS).paymentStatus(PaymentStatus.PAID)
            .amount(new BigDecimal("749.00")).serviceAddress("45 MG Road, Thrissur")
            .notes("Living room fan not working").scheduledAt(now)
            .assignedAt(now.minusDays(1)).startedAt(now).build());

        bookingRepo.save(Booking.builder()
            .customer(c1).service(plumbing)
            .status(BookingStatus.PENDING).paymentStatus(PaymentStatus.PENDING)
            .amount(new BigDecimal("599.00")).serviceAddress("45 MG Road, Thrissur")
            .notes("Kitchen sink leaking").scheduledAt(now.plusDays(2)).build());

        // This month — completed
        Booking b3 = bookingRepo.save(Booking.builder()
            .customer(c1).service(appliance).worker(vinod)
            .status(BookingStatus.COMPLETED).paymentStatus(PaymentStatus.PAID)
            .amount(new BigDecimal("399.00")).serviceAddress("45 MG Road, Thrissur")
            .notes("Washing machine not draining").reviewed(true)
            .scheduledAt(now.minusDays(5)).assignedAt(now.minusDays(5))
            .startedAt(now.minusDays(5)).completedAt(now.minusDays(5))
            .createdAt(now.minusDays(6)).build());

        // 1 month ago
        LocalDateTime m1 = now.minusMonths(1);
        Booking b5 = bookingRepo.save(Booking.builder()
            .customer(c1).service(electrical).worker(vinod)
            .status(BookingStatus.COMPLETED).paymentStatus(PaymentStatus.PAID)
            .amount(new BigDecimal("749.00")).serviceAddress("45 MG Road, Thrissur")
            .notes("Full home rewiring check").reviewed(true)
            .scheduledAt(m1.withDayOfMonth(10)).assignedAt(m1.withDayOfMonth(10))
            .startedAt(m1.withDayOfMonth(10)).completedAt(m1.withDayOfMonth(10))
            .createdAt(m1.withDayOfMonth(9)).build());

        bookingRepo.save(Booking.builder()
            .customer(c1).service(appliance).worker(vinod)
            .status(BookingStatus.COMPLETED).paymentStatus(PaymentStatus.PAID)
            .amount(new BigDecimal("399.00")).serviceAddress("45 MG Road, Thrissur")
            .notes("Refrigerator not cooling")
            .scheduledAt(m1.withDayOfMonth(20)).assignedAt(m1.withDayOfMonth(20))
            .startedAt(m1.withDayOfMonth(20)).completedAt(m1.withDayOfMonth(20))
            .createdAt(m1.withDayOfMonth(19)).build());

        bookingRepo.save(Booking.builder()
            .customer(c1).service(acService)
            .status(BookingStatus.COMPLETED).paymentStatus(PaymentStatus.PAID)
            .amount(new BigDecimal("449.00")).serviceAddress("45 MG Road, Thrissur")
            .notes("AC gas refill")
            .scheduledAt(m1.withDayOfMonth(25)).assignedAt(m1.withDayOfMonth(25))
            .startedAt(m1.withDayOfMonth(25)).completedAt(m1.withDayOfMonth(25))
            .createdAt(m1.withDayOfMonth(24)).build());

        // 2 months ago
        LocalDateTime m2 = now.minusMonths(2);
        Booking b8 = bookingRepo.save(Booking.builder()
            .customer(c1).service(plumbing).worker(vinod)
            .status(BookingStatus.COMPLETED).paymentStatus(PaymentStatus.PAID)
            .amount(new BigDecimal("599.00")).serviceAddress("45 MG Road, Thrissur")
            .notes("Bathroom tap replacement").reviewed(true)
            .scheduledAt(m2.withDayOfMonth(5)).assignedAt(m2.withDayOfMonth(5))
            .startedAt(m2.withDayOfMonth(5)).completedAt(m2.withDayOfMonth(5))
            .createdAt(m2.withDayOfMonth(4)).build());

        bookingRepo.save(Booking.builder()
            .customer(c1).service(pestControl)
            .status(BookingStatus.COMPLETED).paymentStatus(PaymentStatus.PAID)
            .amount(new BigDecimal("349.00")).serviceAddress("45 MG Road, Thrissur")
            .notes("Cockroach problem in kitchen")
            .scheduledAt(m2.withDayOfMonth(15)).assignedAt(m2.withDayOfMonth(15))
            .startedAt(m2.withDayOfMonth(15)).completedAt(m2.withDayOfMonth(15))
            .createdAt(m2.withDayOfMonth(14)).build());

        // 3 months ago
        LocalDateTime m3 = now.minusMonths(3);
        Booking b11 = bookingRepo.save(Booking.builder()
            .customer(c1).service(appliance).worker(vinod)
            .status(BookingStatus.COMPLETED).paymentStatus(PaymentStatus.PAID)
            .amount(new BigDecimal("399.00")).serviceAddress("45 MG Road, Thrissur")
            .notes("Microwave not heating")
            .scheduledAt(m3.withDayOfMonth(8)).assignedAt(m3.withDayOfMonth(8))
            .startedAt(m3.withDayOfMonth(8)).completedAt(m3.withDayOfMonth(8))
            .createdAt(m3.withDayOfMonth(7)).build());

        Booking b12 = bookingRepo.save(Booking.builder()
            .customer(c1).service(electrical).worker(vinod)
            .status(BookingStatus.COMPLETED).paymentStatus(PaymentStatus.PAID)
            .amount(new BigDecimal("749.00")).serviceAddress("45 MG Road, Thrissur")
            .notes("MCB trips frequently").reviewed(true)
            .scheduledAt(m3.withDayOfMonth(18)).assignedAt(m3.withDayOfMonth(18))
            .startedAt(m3.withDayOfMonth(18)).completedAt(m3.withDayOfMonth(18))
            .createdAt(m3.withDayOfMonth(17)).build());

        // 4 months ago
        LocalDateTime m4 = now.minusMonths(4);
        bookingRepo.save(Booking.builder()
            .customer(c1).service(painting)
            .status(BookingStatus.COMPLETED).paymentStatus(PaymentStatus.PAID)
            .amount(new BigDecimal("749.00")).serviceAddress("45 MG Road, Thrissur")
            .notes("Living room painting")
            .scheduledAt(m4.withDayOfMonth(12)).assignedAt(m4.withDayOfMonth(12))
            .startedAt(m4.withDayOfMonth(12)).completedAt(m4.withDayOfMonth(12))
            .createdAt(m4.withDayOfMonth(11)).build());

        bookingRepo.save(Booking.builder()
            .customer(c1).service(plumbing).worker(vinod)
            .status(BookingStatus.COMPLETED).paymentStatus(PaymentStatus.PAID)
            .amount(new BigDecimal("599.00")).serviceAddress("45 MG Road, Thrissur")
            .notes("Water heater repair")
            .scheduledAt(m4.withDayOfMonth(25)).assignedAt(m4.withDayOfMonth(25))
            .startedAt(m4.withDayOfMonth(25)).completedAt(m4.withDayOfMonth(25))
            .createdAt(m4.withDayOfMonth(24)).build());

        // 5 months ago
        LocalDateTime m5 = now.minusMonths(5);
        bookingRepo.save(Booking.builder()
            .customer(c1).service(carpentry)
            .status(BookingStatus.COMPLETED).paymentStatus(PaymentStatus.PAID)
            .amount(new BigDecimal("499.00")).serviceAddress("45 MG Road, Thrissur")
            .notes("Wardrobe door hinge repair")
            .scheduledAt(m5.withDayOfMonth(7)).assignedAt(m5.withDayOfMonth(7))
            .startedAt(m5.withDayOfMonth(7)).completedAt(m5.withDayOfMonth(7))
            .createdAt(m5.withDayOfMonth(6)).build());

        bookingRepo.save(Booking.builder()
            .customer(c1).service(acService)
            .status(BookingStatus.COMPLETED).paymentStatus(PaymentStatus.PAID)
            .amount(new BigDecimal("449.00")).serviceAddress("45 MG Road, Thrissur")
            .notes("AC annual service")
            .scheduledAt(m5.withDayOfMonth(20)).assignedAt(m5.withDayOfMonth(20))
            .startedAt(m5.withDayOfMonth(20)).completedAt(m5.withDayOfMonth(20))
            .createdAt(m5.withDayOfMonth(19)).build());

        // ── Reviews ──────────────────────────────────────────────────────────
        reviewRepo.save(Review.builder().booking(b3).customer(c1).worker(vinod)
            .rating(5).comment("Excellent! Fixed the washing machine quickly. Very professional.").build());
        reviewRepo.save(Review.builder().booking(b5).customer(c1).worker(vinod)
            .rating(4).comment("Good electrical work. Explained everything clearly.").build());
        reviewRepo.save(Review.builder().booking(b8).customer(c1).worker(vinod)
            .rating(5).comment("Tap fixed perfectly. Arrived on time and very courteous.").build());
        reviewRepo.save(Review.builder().booking(b12).customer(c1).worker(vinod)
            .rating(4).comment("MCB issue resolved. Knowledgeable technician.").build());

        // Update Vinod's stats post-seed
        vinodProfile.setTotalJobsCompleted(298 + 6);
        vinodProfile.setPerformanceScore(assignmentEngine.computeScore(vinodProfile));
        workerProfileRepo.save(vinodProfile);

        log.info("Demo data seeded. Accounts: customer@handrill.com / worker@handrill.com / admin@handrill.com — all password: demo123");
    }
}
