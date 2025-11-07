package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.entity.CreditCard;
import com.example.demo.exception.BusinessException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.CreditCardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CreditCardService {
    
    private static final int PAGE_SIZE = 7;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    
    private final CreditCardRepository creditCardRepository;
    
    @Transactional(readOnly = true)
    public CreditCardDetailDTO getCardDetails(String cardNumber) {
        log.info("Fetching card details for card number: {}", cardNumber);
        
        CreditCard card = creditCardRepository.findByCardNumber(cardNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Credit card not found with card number: " + cardNumber));
        
        return convertToDetailDTO(card);
    }
    
    @Transactional(readOnly = true)
    public CreditCardDetailDTO searchCard(Long accountId, String cardNumber) {
        log.info("Searching card with accountId: {} and cardNumber: {}", accountId, cardNumber);
        
        if (accountId == null && cardNumber == null) {
            throw new BusinessException("At least one search criteria (account ID or card number) must be provided");
        }
        
        CreditCard card;
        if (accountId != null && cardNumber != null) {
            card = creditCardRepository.findByAccountIdAndCardNumber(accountId, cardNumber)
                    .orElseThrow(() -> new ResourceNotFoundException("Credit card not found for the given account and card number combination"));
        } else if (cardNumber != null) {
            card = creditCardRepository.findByCardNumber(cardNumber)
                    .orElseThrow(() -> new ResourceNotFoundException("Credit card not found with card number: " + cardNumber));
        } else {
            List<CreditCard> cards = creditCardRepository.findByAccountId(accountId);
            if (cards.isEmpty()) {
                throw new ResourceNotFoundException("No credit cards found for account ID: " + accountId);
            }
            card = cards.get(0);
        }
        
        return convertToDetailDTO(card);
    }
    
    @Transactional
    public CreditCardDetailDTO updateCard(CreditCardUpdateRequestDTO updateRequest) {
        log.info("Updating card: {}", updateRequest.getCardNumber());
        
        validateUpdateRequest(updateRequest);
        
        CreditCard existingCard = creditCardRepository.findByCardNumberForUpdate(updateRequest.getCardNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Credit card not found with card number: " + updateRequest.getCardNumber()));
        
        if (!existingCard.getAccountId().equals(updateRequest.getAccountId())) {
            throw new BusinessException("Account ID mismatch. Cannot update card for different account.");
        }
        
        CreditCard originalCard = new CreditCard(
                existingCard.getCardNumber(),
                existingCard.getAccountId(),
                existingCard.getEmbossedName(),
                existingCard.getCvvCode(),
                existingCard.getExpirationDate(),
                existingCard.getActiveStatus()
        );
        
        String normalizedName = updateRequest.getEmbossedName().toUpperCase().trim();
        LocalDate newExpirationDate = LocalDate.of(
                updateRequest.getExpirationYear(),
                updateRequest.getExpirationMonth(),
                existingCard.getExpirationDate().getDayOfMonth()
        );
        
        if (hasCardChanged(existingCard, originalCard)) {
            throw new BusinessException("Card was modified by another user. Please refresh and try again.");
        }
        
        existingCard.setEmbossedName(normalizedName);
        existingCard.setActiveStatus(updateRequest.getActiveStatus());
        existingCard.setExpirationDate(newExpirationDate);
        
        CreditCard updatedCard = creditCardRepository.save(existingCard);
        log.info("Card updated successfully: {}", updatedCard.getCardNumber());
        
        return convertToDetailDTO(updatedCard);
    }
    
    @Transactional(readOnly = true)
    public CreditCardListResponseDTO listCards(Long accountId, String cardNumber, Integer page) {
        log.info("Listing cards with accountId: {}, cardNumber: {}, page: {}", accountId, cardNumber, page);
        
        int pageNumber = (page != null && page > 0) ? page - 1 : 0;
        Pageable pageable = PageRequest.of(pageNumber, PAGE_SIZE);
        
        Page<CreditCard> cardPage = creditCardRepository.findByFilters(accountId, cardNumber, pageable);
        
        List<CreditCardListItemDTO> cardItems = cardPage.getContent().stream()
                .map(this::convertToListItemDTO)
                .collect(Collectors.toList());
        
        return new CreditCardListResponseDTO(
                cardItems,
                pageNumber + 1,
                cardPage.hasNext(),
                cardPage.hasPrevious(),
                cardItems.size()
        );
    }
    
    private void validateUpdateRequest(CreditCardUpdateRequestDTO request) {
        if (!request.getEmbossedName().matches("^[a-zA-Z ]+$")) {
            throw new BusinessException("Card name must contain only alphabets and spaces");
        }
        
        if (!request.getActiveStatus().matches("^[YN]$")) {
            throw new BusinessException("Card status must be Y or N");
        }
        
        if (request.getExpirationMonth() < 1 || request.getExpirationMonth() > 12) {
            throw new BusinessException("Expiration month must be between 1 and 12");
        }
        
        if (request.getExpirationYear() < 1950 || request.getExpirationYear() > 2099) {
            throw new BusinessException("Expiration year must be between 1950 and 2099");
        }
    }
    
    private boolean hasCardChanged(CreditCard current, CreditCard original) {
        return !current.getEmbossedName().equals(original.getEmbossedName()) ||
               !current.getActiveStatus().equals(original.getActiveStatus()) ||
               !current.getExpirationDate().equals(original.getExpirationDate()) ||
               !current.getCvvCode().equals(original.getCvvCode());
    }
    
    private CreditCardDetailDTO convertToDetailDTO(CreditCard card) {
        return new CreditCardDetailDTO(
                card.getCardNumber(),
                card.getAccountId(),
                card.getEmbossedName(),
                card.getCvvCode(),
                card.getExpirationDate().format(DATE_FORMATTER),
                card.getActiveStatus()
        );
    }
    
    private CreditCardListItemDTO convertToListItemDTO(CreditCard card) {
        return new CreditCardListItemDTO(
                card.getCardNumber(),
                card.getAccountId(),
                card.getActiveStatus()
        );
    }
}
