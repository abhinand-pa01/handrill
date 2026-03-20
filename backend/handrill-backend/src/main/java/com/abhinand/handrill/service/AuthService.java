package com.abhinand.handrill.service;

import com.abhinand.handrill.dto.request.LoginRequest;
import com.abhinand.handrill.dto.request.RefreshTokenRequest;
import com.abhinand.handrill.dto.request.RegisterRequest;
import com.abhinand.handrill.dto.response.AuthResponse;
import com.abhinand.handrill.dto.response.UserResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refresh(RefreshTokenRequest request);
    void logout(String email);
    UserResponse me(String email);
}
