package com.example.demo.repository;

import com.example.demo.entity.CreditCard;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

@Repository
public interface CreditCardRepository extends JpaRepository<CreditCard, String> {
    
    Optional<CreditCard> findByCardNumber(String cardNumber);
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM CreditCard c WHERE c.cardNumber = :cardNumber")
    Optional<CreditCard> findByCardNumberForUpdate(@Param("cardNumber") String cardNumber);
    
    List<CreditCard> findByAccountId(Long accountId);
    
    Optional<CreditCard> findByAccountIdAndCardNumber(Long accountId, String cardNumber);
    
    Page<CreditCard> findAllByOrderByCardNumberAsc(Pageable pageable);
    
    Page<CreditCard> findByAccountIdOrderByCardNumberAsc(Long accountId, Pageable pageable);
    
    @Query("SELECT c FROM CreditCard c WHERE " +
           "(:accountId IS NULL OR c.accountId = :accountId) AND " +
           "(:cardNumber IS NULL OR c.cardNumber = :cardNumber) " +
           "ORDER BY c.cardNumber ASC")
    Page<CreditCard> findByFilters(@Param("accountId") Long accountId, 
                                    @Param("cardNumber") String cardNumber, 
                                    Pageable pageable);
    
    boolean existsByCardNumber(String cardNumber);
}
