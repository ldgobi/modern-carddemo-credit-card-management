package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.service.CreditCardService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/credit-cards")
@RequiredArgsConstructor
@Slf4j
@Validated
public class CreditCardController {
    
    private final CreditCardService creditCardService;
    
    @GetMapping("/{cardNumber}")
    public ResponseEntity<CreditCardDetailDTO> getCardDetails(
            @PathVariable 
            @Pattern(regexp = "^\\d{16}$", message = "Card number must be a 16-digit number") 
            String cardNumber) {
        log.info("GET /api/credit-cards/{} - Fetching card details", cardNumber);
        CreditCardDetailDTO cardDetails = creditCardService.getCardDetails(cardNumber);
        return ResponseEntity.ok(cardDetails);
    }
    
    @GetMapping("/search")
    public ResponseEntity<CreditCardDetailDTO> searchCard(
            @RequestParam(required = false) 
            @Min(value = 10000000000L, message = "Account ID must be an 11-digit number")
            @Max(value = 99999999999L, message = "Account ID must be an 11-digit number")
            Long accountId,
            @RequestParam(required = false) 
            @Pattern(regexp = "^\\d{16}$", message = "Card number must be a 16-digit number")
            String cardNumber) {
        log.info("GET /api/credit-cards/search - Searching card with accountId: {}, cardNumber: {}", accountId, cardNumber);
        CreditCardDetailDTO cardDetails = creditCardService.searchCard(accountId, cardNumber);
        return ResponseEntity.ok(cardDetails);
    }
    
    @PutMapping("/{cardNumber}")
    public ResponseEntity<CreditCardDetailDTO> updateCard(
            @PathVariable 
            @Pattern(regexp = "^\\d{16}$", message = "Card number must be a 16-digit number") 
            String cardNumber,
            @Valid @RequestBody CreditCardUpdateRequestDTO updateRequest) {
        log.info("PUT /api/credit-cards/{} - Updating card", cardNumber);
        
        if (!cardNumber.equals(updateRequest.getCardNumber())) {
            log.error("Card number mismatch in path and body");
            return ResponseEntity.badRequest().build();
        }
        
        CreditCardDetailDTO updatedCard = creditCardService.updateCard(updateRequest);
        return ResponseEntity.ok(updatedCard);
    }
    
    @GetMapping
    public ResponseEntity<CreditCardListResponseDTO> listCards(
            @RequestParam(required = false) 
            @Min(value = 10000000000L, message = "Account ID must be an 11-digit number")
            @Max(value = 99999999999L, message = "Account ID must be an 11-digit number")
            Long accountId,
            @RequestParam(required = false) 
            @Pattern(regexp = "^\\d{16}$", message = "Card number must be a 16-digit number")
            String cardNumber,
            @RequestParam(required = false, defaultValue = "1") 
            @Min(value = 1, message = "Page number must be at least 1")
            Integer page) {
        log.info("GET /api/credit-cards - Listing cards with accountId: {}, cardNumber: {}, page: {}", accountId, cardNumber, page);
        CreditCardListResponseDTO response = creditCardService.listCards(accountId, cardNumber, page);
        return ResponseEntity.ok(response);
    }
}
