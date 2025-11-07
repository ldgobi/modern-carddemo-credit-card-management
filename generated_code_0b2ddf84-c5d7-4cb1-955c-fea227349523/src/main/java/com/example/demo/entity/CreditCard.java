package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "credit_cards", indexes = {
    @Index(name = "idx_account_id", columnList = "account_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreditCard {
    
    @Id
    @Column(name = "card_number", length = 16, nullable = false)
    private String cardNumber;
    
    @Column(name = "account_id", nullable = false, length = 11)
    private Long accountId;
    
    @Column(name = "embossed_name", nullable = false, length = 50)
    private String embossedName;
    
    @Column(name = "cvv_code", nullable = false, length = 3)
    private String cvvCode;
    
    @Column(name = "expiration_date", nullable = false)
    private LocalDate expirationDate;
    
    @Column(name = "active_status", nullable = false, length = 1)
    private String activeStatus;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    public CreditCard(String cardNumber, Long accountId, String embossedName, String cvvCode, LocalDate expirationDate, String activeStatus) {
        this.cardNumber = cardNumber;
        this.accountId = accountId;
        this.embossedName = embossedName;
        this.cvvCode = cvvCode;
        this.expirationDate = expirationDate;
        this.activeStatus = activeStatus;
    }
    
    public boolean isActive() {
        return "Y".equals(activeStatus);
    }
    
    public boolean isExpired() {
        return expirationDate.isBefore(LocalDate.now());
    }
}
