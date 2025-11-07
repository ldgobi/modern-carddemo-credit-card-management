package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreditCardListItemDTO {
    
    private String cardNumber;
    private Long accountId;
    private String activeStatus;
}
