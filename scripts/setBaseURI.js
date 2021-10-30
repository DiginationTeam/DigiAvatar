const DigiAvatar = artifacts.require("DigiAvatar");

module.exports = async function(callback) {
	const contract = await DigiAvatar.deployed();

	const tx = await contract.setBaseURI('https://ipfs.io/ipfs/QmPzATF53dhfCJj45UF9WiFnHwuoAMA2XEcvPLoLLeHLSK/');
	console.debug(tx);

	const uri = await contract.tokenURI(0);
	console.debug(uri);

	callback();
}