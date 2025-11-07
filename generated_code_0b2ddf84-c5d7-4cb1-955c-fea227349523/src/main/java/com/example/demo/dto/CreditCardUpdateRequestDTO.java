package com.example.demo.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreditCardUpdateRequestDTO {
    
    @NotBlank(message = "Card number is mandatory")
    @Pattern(regexp = "^\\d{16}$", message = "Card number must be a 16-digit number")
    private String cardNumber;
    
    @NotNull(message = "Account ID is mandatory")
    @Min(value = 10000000000L, message = "Account ID must be an 11-digit number")
    @Max(value = 99999999999L, message = "Account ID must be an 11-digit number")
    private Long accountId;
    
    @NotBlank(message = "Embossed name is mandatory")
    @Size(max = 50, message = "Embossed name must not exceed 50 characters")
    @Pattern(regexp = "^[a-zA-Z ]+$", message = "Embossed name must contain only alphabets and spaces")
    private String embossedName;
    
    @NotBlank(message = "Active status is mandatory")
    @Pattern(regexp = "^[YN]$", message = "Active status must be Y or N")
    private String activeStatus;
    
    @NotNull(message = "Expiration month is mandatory")
    @Min(value = 1, message = "Expiration month must be between 1 and 12")
    @Max(value = 12, message = "Expiration month must be between 1 and 12")
    private Integer expirationMonth;
    
    @NotNull(message = "Expiration year is mandatory")
    @Min(value = 1950, message = "Expiration year must be between 1950 and 2099")
    @Max(value = 2099, message = "Expiration year must be between 1950 and 2099")
    private Integer expirationYear;
}
