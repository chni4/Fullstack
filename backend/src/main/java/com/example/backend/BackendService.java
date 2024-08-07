package com.example.backend;

import com.example.backend.auth.AuthenticationRequest;
import com.example.backend.auth.AuthenticationResponse;
import com.example.backend.auth.RegisterRequest;
import com.example.backend.config.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BackendService {

    private final BackendRepository repo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public Mitarbeiter createMitarbeiter(Mitarbeiter mitarbeiter) {
        return repo.save(mitarbeiter);
    }

    public Mitarbeiter updateMitarbeiter(Mitarbeiter mitarbeiterDetails) {
        if (mitarbeiterDetails.getBildUrl() == null) {
            Optional<Mitarbeiter> found = repo.findById(mitarbeiterDetails.getUserid());
            if (found.isEmpty()) return null;
            mitarbeiterDetails.setBildUrl(found.get().getBildUrl());
        }
        if (mitarbeiterDetails.getInitialPW() == null){
            Optional<Mitarbeiter> found = repo.findById(mitarbeiterDetails.getUserid());
            if (found.get().getInitialPW().isEmpty()) return null;
            mitarbeiterDetails.setInitialPW(found.get().getInitialPW());
        }
        repo.deleteById(mitarbeiterDetails.getUserid());
        mitarbeiterDetails.setInitialPW(passwordEncoder.encode(mitarbeiterDetails.getInitialPW()));
        return repo.save(mitarbeiterDetails);
    }

    public List<Mitarbeiter> getAllMitarbeiter() {
        return repo.findAll();
    }

    public Mitarbeiter getMitarbeiterById(String token) {
        String userId = jwtService.extractUsername(token);
        return repo.findById(userId).orElseThrow();
    }

    public void deleteMitarbeiter(String userId) {
        repo.deleteById(userId);
    }

    public Optional<List<Mitarbeiter>> getExtendedMitarbeiter(ExtendedSearch search) {
        List<Mitarbeiter> allMitarbeiter = repo.findAll();
        Optional<List<Mitarbeiter>> toReturn = null;

        for (Mitarbeiter m : allMitarbeiter) {

        }

        return null;
    }

    public AuthenticationResponse register(RegisterRequest request) {
        var user = Mitarbeiter.builder()
                .name(request.getName())
                .bildUrl(request.getBildUrl())
                .gebaeude(request.getGebaeude())
                .geschaeftsadresse(request.getGeschaeftsadresse())
                .geschlecht(request.getGeschlecht())
                .nachname(request.getNachname())
                .ort(request.getOrt())
                .telefonnummer(request.getTelefonnummer())
                .userid(request.getUserid())
                .initialPW(passwordEncoder.encode(request.getInitialPW()))
                .rolle(request.getRolle())
                .pultnummer(request.getPultnummer())
                .stock(request.getStock())
                .build();
        repo.save(user);

        var jtwToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jtwToken)
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUserid(),
                        request.getPassword()
                )
        );
        var user = repo.findById(request.getUserid())
                .orElseThrow();
        var jtwToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jtwToken)
                .build();
    }


    public boolean updateMitarbeiterPassword(String token, String password) {
        String userid = jwtService.extractUsername(token);

        Optional<Mitarbeiter> toUpdate = repo.findById(userid);

        if (toUpdate.isPresent()) {
            Mitarbeiter actualMitarbeiter = toUpdate.get();
            actualMitarbeiter.setInitialPW(passwordEncoder.encode(password));
            repo.deleteById(userid);
            repo.save(actualMitarbeiter);
            return true;
        } else {
            return false;
        }
    }


    public Optional<Mitarbeiter> getMitarbeiterByUserId(String userid) {
        return repo.findById(userid);
    }

    public Role getRole(String token) {
        String userid = jwtService.extractUsername(token);
        Optional<Mitarbeiter> foundUser = repo.findById(userid);
        return foundUser.map(Mitarbeiter::getRolle).orElse(null);
    }
}