package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreditCardDetailDTO {
    
    private String cardNumber;
    private Long accountId;
    private String embossedName;
    private String cvvCode;
    private String expirationDate;
    private String activeStatus;
}
