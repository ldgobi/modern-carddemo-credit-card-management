package com.example.demo.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreditCardSearchRequestDTO {
    
    @Min(value = 10000000000L, message = "Account ID must be an 11-digit number")
    @Max(value = 99999999999L, message = "Account ID must be an 11-digit number")
    private Long accountId;
    
    @Pattern(regexp = "^\\d{16}$", message = "Card number must be a 16-digit number")
    private String cardNumber;
}
