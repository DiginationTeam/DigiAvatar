const DigiAvatar = artifacts.require("DigiAvatar");

module.exports = async function(callback) {
	const contract = await DigiAvatar.deployed();

	console.log('unpause');
	
	const tx = await contract.unpause();
	console.debug(tx);


	console.log('Done');

	callback();
}