-- Create credit_cards table
CREATE TABLE credit_cards (
    card_number VARCHAR(16) NOT NULL,
    account_id BIGINT NOT NULL,
    embossed_name VARCHAR(50) NOT NULL,
    cvv_code VARCHAR(3) NOT NULL,
    expiration_date DATE NOT NULL,
    active_status VARCHAR(1) NOT NULL CHECK (active_status IN ('Y', 'N')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (card_number)
);

-- Create index on account_id for faster lookups
CREATE INDEX idx_account_id ON credit_cards(account_id);

-- Create index on account_id and card_number combination
CREATE INDEX idx_account_card ON credit_cards(account_id, card_number);

-- Add comments to table and columns
COMMENT ON TABLE credit_cards IS 'Stores credit card information for the card management system';
COMMENT ON COLUMN credit_cards.card_number IS 'Unique 16-digit credit card number';
COMMENT ON COLUMN credit_cards.account_id IS '11-digit account identifier';
COMMENT ON COLUMN credit_cards.embossed_name IS 'Name embossed on the credit card (max 50 characters)';
COMMENT ON COLUMN credit_cards.cvv_code IS '3-digit card verification value';
COMMENT ON COLUMN credit_cards.expiration_date IS 'Card expiration date';
COMMENT ON COLUMN credit_cards.active_status IS 'Card status: Y for active, N for inactive';
COMMENT ON COLUMN credit_cards.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN credit_cards.updated_at IS 'Timestamp when the record was last updated';
