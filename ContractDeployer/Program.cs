namespace ContractDeployer.App
{
    using System;
    using System.Configuration;
    using System.Threading.Tasks;
    using Nethereum.Contracts;
    using Nethereum.RPC.Eth.DTOs;
    using Nethereum.Web3;
    using Nethereum.Web3.Accounts;

    public static class Program
    {
        private static void Main()
        {
            try
            {
                var smartContractService = new SmartContractService();
                var deployTask = smartContractService.DeployContract();
                deployTask.Wait();

                var receipt = deployTask.Result;
                Console.WriteLine($"CONTRACT DEPLOYED AT ADDRESS: {receipt.ContractAddress}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"EXCEPTION: {ex.GetBaseException().Message}");
            }

            Console.ReadKey();
        }

        public class SmartContractService
        {
            private readonly Web3 _web3;

            private class StandardContractDeployment : ContractDeploymentMessage
            {
                public static string Bytecode { get; set; }
                public StandardContractDeployment()
                    : base(Bytecode) { }
            }

            public SmartContractService()
            {
                var rpcServer = ConfigurationManager.AppSettings["RpcServer"];
                var accountPrivateKey = ConfigurationManager.AppSettings["AccountPrivateKey"];
                var bytecode = ConfigurationManager.AppSettings["ContractBytecode"];

                _web3 = new Web3(new Account(accountPrivateKey), rpcServer);
                StandardContractDeployment.Bytecode = bytecode;
            }

            public async Task<TransactionReceipt> DeployContract()
            {
                var deploymentMessage = new StandardContractDeployment();
                var deploymentHandler = _web3.Eth.GetContractDeploymentHandler<StandardContractDeployment>();
                var transactionReceipt = await deploymentHandler.SendRequestAndWaitForReceiptAsync(deploymentMessage);
                return transactionReceipt;
            }
        }
    }
}
