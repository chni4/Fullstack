package com.example.backend.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<user, Integer> {
    Optional<user> findByEmail(String email);

}
