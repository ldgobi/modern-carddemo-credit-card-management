package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreditCardListResponseDTO {
    
    private List<CreditCardListItemDTO> cards;
    private Integer currentPage;
    private Boolean hasNextPage;
    private Boolean hasPreviousPage;
    private Integer totalRecordsOnPage;
}
