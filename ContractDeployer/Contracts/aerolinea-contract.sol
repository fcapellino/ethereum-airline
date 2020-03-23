pragma solidity ^0.4.25;

contract Airline {
    address public owner;
    
    struct Customer{
        uint loyaltyPoints;
        uint totalFlights;
    }
    
    struct Flight{
        string name;
        uint price;
    }
    
    struct Purchase{
        string name;
        uint date;
    }
    
    Flight[] public flights;
    mapping(address=> Customer) public customers;
    mapping(address=> Purchase[]) public customerFlights;
    mapping(address=> uint) public customerTotalFlights;
    
    uint private etherPerPoint = 0.5 ether;
    event FlightPurchased(address indexed customer, string name, uint price);
    
    constructor() public{
        owner=msg.sender;
        flights.push(Flight('Portugal', 4 ether));
        flights.push(Flight('San Petersburgo', 3 ether));
        flights.push(Flight('Londres', 4 ether));
		flights.push(Flight('San Francisco', 3 ether));
    }
    
    function buyFlight(uint flightIndex) public payable{
        Flight memory flight = flights[flightIndex];
        require(msg.value == flight.price);
        
        Customer storage customer = customers[msg.sender];
        customer.loyaltyPoints += 5;
        customer.totalFlights += 1;
        
        customerFlights[msg.sender].push(Purchase(flight.name,now));
        customerTotalFlights[msg.sender] +=1;
        
        emit FlightPurchased(msg.sender, flight.name, flight.price);
    }
    
    function totalFlights() public view returns(uint){
        return flights.length;
    }
    
    function redeemLoyaltyPoints() public{
        Customer storage customer = customers[msg.sender];
        uint etherToRefund = etherPerPoint * customer.loyaltyPoints;
        msg.sender.transfer(etherToRefund);
        customer.loyaltyPoints=0;
    }
    
    function getRefundableEther() public view returns(uint,uint){
        uint loyaltyPoints = customers[msg.sender].loyaltyPoints;
        uint refundableEther = etherPerPoint * customers[msg.sender].loyaltyPoints;
        return (loyaltyPoints, refundableEther);
    }
    
    function getAirlineBalance() public isOwner view returns(uint){
        address airlineAddress = this;
        return airlineAddress.balance;
    }
    
    modifier isOwner(){
        require(msg.sender==owner);
        _;
    }
}
