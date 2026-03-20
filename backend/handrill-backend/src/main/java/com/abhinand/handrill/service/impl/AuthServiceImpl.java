package com.abhinand.handrill.service.impl;

import com.abhinand.handrill.config.AppProperties;
import com.abhinand.handrill.dto.request.LoginRequest;
import com.abhinand.handrill.dto.request.RefreshTokenRequest;
import com.abhinand.handrill.dto.request.RegisterRequest;
import com.abhinand.handrill.dto.response.AuthResponse;
import com.abhinand.handrill.dto.response.UserResponse;
import com.abhinand.handrill.entity.RefreshToken;
import com.abhinand.handrill.entity.Role;
import com.abhinand.handrill.entity.User;
import com.abhinand.handrill.exception.DuplicateResourceException;
import com.abhinand.handrill.exception.InvalidOperationException;
import com.abhinand.handrill.repository.RefreshTokenRepository;
import com.abhinand.handrill.repository.UserRepository;
import com.abhinand.handrill.security.JwtUtil;
import com.abhinand.handrill.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authManager;
    private final AppProperties appProperties;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }
        User user = User.builder()
            .name(request.getName())
            .email(request.getEmail())
            .phone(request.getPhone())
            .address(request.getAddress())
            .password(passwordEncoder.encode(request.getPassword()))
            .role(Role.CUSTOMER)
            .build();
        userRepository.save(user);
        return buildAuthResponse(user);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new InvalidOperationException("User not found"));
        return buildAuthResponse(user);
    }

    @Override
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken stored = refreshTokenRepository.findByToken(request.getRefreshToken())
            .orElseThrow(() -> new InvalidOperationException("Invalid refresh token"));
        if (stored.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenRepository.delete(stored);
            throw new InvalidOperationException("Refresh token expired. Please login again.");
        }
        return buildAuthResponse(stored.getUser());
    }

    @Override
    public void logout(String email) {
        userRepository.findByEmail(email).ifPresent(user ->
            refreshTokenRepository.deleteByUserId(user.getId())
        );
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse me(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new InvalidOperationException("User not found"));
        return toUserResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtUtil.generateToken(user);
        String refreshTokenValue = UUID.randomUUID().toString();

        refreshTokenRepository.deleteByUserId(user.getId());

        RefreshToken refreshToken = RefreshToken.builder()
            .token(refreshTokenValue)
            .user(user)
            .expiresAt(Instant.now().plusMillis(appProperties.getJwt().getRefreshExpirationMs()))
            .build();
        refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshTokenValue)
            .user(toUserResponse(user))
            .build();
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
            .id(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .phone(user.getPhone())
            .address(user.getAddress())
            .role(user.getRole())
            .build();
    }
}
