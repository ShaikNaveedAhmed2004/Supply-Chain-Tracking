// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SupplyChain
 * @dev Smart contract for tracking supply chain events on the blockchain
 * 
 * This contract provides immutable storage for supply chain events and payment releases.
 * Each event is recorded permanently on-chain for transparency and traceability.
 * 
 * Deployment Instructions:
 * 1. Install Hardhat or Truffle
 * 2. Deploy to Ethereum testnet (Sepolia, Goerli) or local Ganache
 * 3. Update backend application.properties with contract address
 * 4. Generate Java contract wrapper: web3j generate solidity
 */
contract SupplyChain {
    
    // Event structure for supply chain tracking
    struct SupplyChainEvent {
        uint256 batchId;
        string productId;
        address fromParty;
        address toParty;
        string location;
        string status;
        uint256 timestamp;
        bool exists;
    }
    
    // Payment structure
    struct Payment {
        uint256 batchId;
        uint256 amount;
        address recipient;
        uint256 releasedAt;
        bool released;
    }
    
    // Mapping from batchId to array of events
    mapping(uint256 => SupplyChainEvent[]) private batchEvents;
    
    // Mapping from batchId to payment
    mapping(uint256 => Payment) private batchPayments;
    
    // Contract owner
    address public owner;
    
    // Events for logging
    event EventRecorded(
        uint256 indexed batchId,
        string productId,
        address fromParty,
        address toParty,
        string status,
        uint256 timestamp
    );
    
    event PaymentReleased(
        uint256 indexed batchId,
        uint256 amount,
        address recipient,
        uint256 timestamp
    );
    
    // Modifier to restrict functions to contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Records a new supply chain event
     * @param batchId The batch identifier
     * @param productId The product identifier
     * @param fromParty The sender address
     * @param toParty The recipient address
     * @param location The current location
     * @param status The current status
     */
    function recordEvent(
        uint256 batchId,
        string memory productId,
        address fromParty,
        address toParty,
        string memory location,
        string memory status
    ) public {
        require(bytes(productId).length > 0, "Product ID cannot be empty");
        require(bytes(location).length > 0, "Location cannot be empty");
        require(bytes(status).length > 0, "Status cannot be empty");
        
        SupplyChainEvent memory newEvent = SupplyChainEvent({
            batchId: batchId,
            productId: productId,
            fromParty: fromParty,
            toParty: toParty,
            location: location,
            status: status,
            timestamp: block.timestamp,
            exists: true
        });
        
        batchEvents[batchId].push(newEvent);
        
        emit EventRecorded(
            batchId,
            productId,
            fromParty,
            toParty,
            status,
            block.timestamp
        );
    }
    
    /**
     * @dev Retrieves all events for a specific batch
     * @param batchId The batch identifier
     * @return Array of supply chain events
     */
    function getEventsByBatchId(uint256 batchId) 
        public 
        view 
        returns (SupplyChainEvent[] memory) 
    {
        return batchEvents[batchId];
    }
    
    /**
     * @dev Gets the count of events for a batch
     * @param batchId The batch identifier
     * @return Number of events
     */
    function getEventCount(uint256 batchId) public view returns (uint256) {
        return batchEvents[batchId].length;
    }
    
    /**
     * @dev Releases payment for a delivered batch
     * @param batchId The batch identifier
     * @param recipient The payment recipient address
     */
    function releasePayment(
        uint256 batchId,
        address recipient
    ) public payable {
        require(msg.value > 0, "Payment amount must be greater than 0");
        require(recipient != address(0), "Invalid recipient address");
        require(!batchPayments[batchId].released, "Payment already released");
        
        batchPayments[batchId] = Payment({
            batchId: batchId,
            amount: msg.value,
            recipient: recipient,
            releasedAt: block.timestamp,
            released: true
        });
        
        // Transfer funds to recipient
        payable(recipient).transfer(msg.value);
        
        emit PaymentReleased(batchId, msg.value, recipient, block.timestamp);
    }
    
    /**
     * @dev Gets payment information for a batch
     * @param batchId The batch identifier
     * @return Payment details
     */
    function getPayment(uint256 batchId) 
        public 
        view 
        returns (Payment memory) 
    {
        return batchPayments[batchId];
    }
    
    /**
     * @dev Checks if payment has been released for a batch
     * @param batchId The batch identifier
     * @return True if payment released, false otherwise
     */
    function isPaymentReleased(uint256 batchId) public view returns (bool) {
        return batchPayments[batchId].released;
    }
}
