class ContractService {

    constructor(contract) {
        this.contract = contract;

        this.getTotalFlights = async function () {
            var bigNumber = await this.contract.methods.totalFlights().call();
            return bigNumber;
        };

        this.getFlights = async function () {
            var total = await this.getTotalFlights();
            var flightsArray = [];

            for (var index = 0; index < total; index++) {
                var flight = await this.contract.methods.flights(index).call();
                flightsArray.push(flight);
            }

            return this.mapFlights(flightsArray);
        }

        this.getCustomerFlights = async function (account) {
            var customerTotalFlights = await this.contract.methods.customerTotalFlights(account).call();
            var customerFlights = [];

            for (var index = 0; index < customerTotalFlights; index++) {
                var flight = await this.contract.methods.customerFlights(account, index).call();
                customerFlights.push(flight);
            }

            return this.mapPurchases(customerFlights);
        }

        this.buyFlight = async function (index, from, value) {
            await this.contract.methods.buyFlight(index).send({
                from: from,
                value: value
            });
        }

        this.getRefundableEther = async function (from) {
            var result = await this.contract.methods.getRefundableEther().call({
                from: from
            });

            return {
                points: result[0],
                wei: result[1]
            };
        }

        this.redeemLoyaltyPoints = async function (from) {
            await this.contract.methods.redeemLoyaltyPoints().send({
                from: from
            });
        }

        this.onFlightPurchased = function (callback) {
            this.contract.events.FlightPurchased({}, (error, data) => {
                if (!error) {
                    callback(data);
                }
            });
        }

        this.mapFlights = function (flightsArray) {
            return flightsArray.map(item => {
                return {
                    name: item[0],
                    price: item[1]
                };
            });
        }

        this.mapPurchases = function (purchasesArray) {
            return purchasesArray.map(item => {
                return {
                    name: item[0],
                    date: new Date(item[1] * 1000).toLocaleString()
                };
            });
        }
    }
}
