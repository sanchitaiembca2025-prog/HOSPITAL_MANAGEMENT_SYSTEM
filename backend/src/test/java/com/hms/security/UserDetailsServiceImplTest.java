package com.hms.security;

import com.hms.entity.User;
import com.hms.enums.Role;
import com.hms.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserDetailsServiceImplTest {

    @Mock UserRepository userRepository;
    @InjectMocks UserDetailsServiceImpl userDetailsService;

    @Test
    void loadUserByUsername_activeUser_returnsUserDetailsWithCorrectAuthority() {
        User user = user(Role.DOCTOR, true);
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(user));

        UserDetails details = userDetailsService.loadUserByUsername("alice");

        assertThat(details.getUsername()).isEqualTo("alice");
        assertThat(details.getAuthorities())
                .extracting(a -> a.getAuthority())
                .containsExactly("ROLE_DOCTOR");
    }

    @Test
    void loadUserByUsername_clerkRole_returnsCorrectAuthority() {
        User user = user(Role.CLERK, true);
        when(userRepository.findByUsername("clerk1")).thenReturn(Optional.of(user));

        UserDetails details = userDetailsService.loadUserByUsername("clerk1");

        assertThat(details.getAuthorities())
                .extracting(a -> a.getAuthority())
                .containsExactly("ROLE_CLERK");
    }

    @Test
    void loadUserByUsername_inactiveUser_throwsUsernameNotFoundException() {
        User user = user(Role.DOCTOR, false);
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> userDetailsService.loadUserByUsername("alice"))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining("deactivated");
    }

    @Test
    void loadUserByUsername_unknownUser_throwsUsernameNotFoundException() {
        when(userRepository.findByUsername("nobody")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userDetailsService.loadUserByUsername("nobody"))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining("not found");
    }

    private User user(Role role, boolean active) {
        User u = new User();
        u.setUserId(1L);
        u.setFullName("Test User");
        u.setUsername(role == Role.DOCTOR ? "alice" : "clerk1");
        u.setPasswordHash("hash");
        u.setRole(role);
        u.setIsActive(active);
        return u;
    }
}
