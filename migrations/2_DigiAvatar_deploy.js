const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const DigiAvatar = artifacts.require("DigiAvatar");

module.exports = async function(deployer, network) {
	console.debug(network);

	await deployProxy(
		DigiAvatar,
		[
			'DigiAvatar',
			'DGA',
			'',
		],
		{
			deployer,
			initializer: 'initialize'
		}
	);
};
