const web3 = require("web3");
const DigiAvatar = artifacts.require("DigiAvatar");

module.exports = async function(callback) {
	const contract = await DigiAvatar.deployed();

	console.debug( await contract.totalSupply() );

	const value = web3.utils.toWei('0.08', 'ether');
	const receipt = await contract.mint([0], {value: value});

	console.debug(receipt);

	receipt.logs.forEach(log => {
		console.debug(log.args.tokenId.toNumber());
	});

	callback();
}