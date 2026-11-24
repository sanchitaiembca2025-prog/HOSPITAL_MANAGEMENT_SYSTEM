package com.hms.service;

import com.hms.dto.request.LoginRequest;
import com.hms.dto.response.LoginResponse;
import com.hms.entity.User;
import com.hms.enums.Role;
import com.hms.exception.ResourceNotFoundException;
import com.hms.repository.UserRepository;
import com.hms.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock AuthenticationManager authenticationManager;
    @Mock UserRepository userRepository;
    @Mock JwtUtil jwtUtil;

    @InjectMocks AuthService authService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId(1L);
        user.setUsername("doctor1");
        user.setFullName("Dr. Alice");
        user.setRole(Role.DOCTOR);
        user.setIsActive(true);
        user.setPasswordHash("hashed");
    }

    @Test
    void login_validCredentials_returnsTokenAndRole() {
        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(userRepository.findByUsername("doctor1")).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken("doctor1", "DOCTOR", 1L)).thenReturn("jwt-token-abc");

        LoginResponse response = authService.login(new LoginRequest("doctor1", "password"));

        assertThat(response.token()).isEqualTo("jwt-token-abc");
        assertThat(response.role()).isEqualTo("DOCTOR");
        assertThat(response.userId()).isEqualTo(1L);
        assertThat(response.name()).isEqualTo("Dr. Alice");
    }

    @Test
    void login_wrongPassword_throwsBadCredentials() {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(new LoginRequest("doctor1", "wrong")))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    void login_userNotFoundAfterAuth_throwsResourceNotFound() {
        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any())).thenReturn(auth);
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(new LoginRequest("ghost", "pw")))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
    }
}
