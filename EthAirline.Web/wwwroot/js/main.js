var viewModel = new Vue({
    el: '#mainDiv',
    data: {
        utils: window.commonMethods,
        mounted: null,
        metamaskInstalled: null,
        metamaskUnlocked: null,
        web3: null,
        contractService: null,
        flights: [],
        account: null,
        accountBalance: null,
        customerFlights: [],
        refundable: null
    },
    mounted: async function () {
        var instance = this;
        instance.metamaskInstalled = instance.utils.tryGet(() => window.web3.currentProvider.isMetaMask);

        if (instance.metamaskInstalled) {
            instance.web3 = new Web3(window.web3.currentProvider);
            var accounts = await instance.web3.eth.getAccounts();
            var accountsAvailable = instance.utils.tryGet(() => accounts.length > 0);
            instance.metamaskUnlocked = accountsAvailable;

            if (instance.metamaskUnlocked) {
                var contract = new instance.web3.eth.Contract(contract_abi, contract_address);
                instance.contractService = new ContractService(contract);
                instance.account = accounts[0].toLowerCase();
                instance.loadPanels();
            }
        }

        if (instance.contractService) {
            instance.web3.currentProvider.publicConfigStore.on('update', async function (event) {
                instance.account = event.selectedAddress.toLowerCase();
                instance.loadPanels();
            });

            instance.contractService.onFlightPurchased(function (result) {
                var message = 'TRANSACTION COMPLETED.' +
                    ` Destination: [${result.returnValues.name}]` +
                    ` Price: [${instance.convertWeiToEther(result.returnValues.price)} Eth]` +
                    ` Hash: [${result.transactionHash}]`;
                instance.showSnackbar(message);
            });
        }

        instance.mounted = true;
    },
    methods: {
        loadPanels: async function () {
            var instance = this;
            instance.getAccountBalance();
            instance.getFlights();
            instance.getRefundableEther();
            instance.getCustomerFlights();
        },
        getAccountBalance: async function () {
            var instance = this;
            var wei = await instance.web3.eth.getBalance(instance.account);
            instance.accountBalance = instance.convertWeiToEther(wei);
        },
        getFlights: async function () {
            var instance = this;
            var items = await instance.contractService.getFlights();
            instance.flights = items;
        },
        buyFlight: async function (index, flight) {
            var instance = this;
            await instance.contractService.buyFlight(index, instance.account, flight.price);
        },
        getCustomerFlights: async function () {
            var instance = this;
            var items = await instance.contractService.getCustomerFlights(instance.account);
            instance.customerFlights = items;
        },
        getRefundableEther: async function () {
            var instance = this;
            var refundable = await instance.contractService.getRefundableEther(instance.account);
            instance.refundable = refundable;
        },
        redeemLoyaltyPoints: async function () {
            var instance = this;
            await instance.contractService.redeemLoyaltyPoints(instance.account);
        },
        showSnackbar: function (message) {
            var instance = this;
            Snackbar.show({
                text: message,
                pos: 'top-right',
                textColor: '#fff',
                backgroundColor: '#28a745',
                showAction: false,
                duration: 7000
            });
        },
        convertWeiToEther: function (wei) {
            var instance = this;
            return instance.web3.utils.fromWei(wei.toString(), 'ether');
        }
    }
});
