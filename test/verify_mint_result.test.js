const web3 = require("web3");
const DigiAvatar = artifacts.require("DigiAvatar");
const DigiAvatarConst = require("./DigiAvatarConst");
const { assert } = require('chai');
const {
	BN,           // Big Number support
	constants,    // Common constants, like the zero address and largest integers
	expectEvent,  // Assertions for emitted events
	expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

contract("DigiAvatar/mint:result", async accounts => {
	let contractInstance;
    const [from_account] = accounts;

	before(async function () {
		contractInstance = await DigiAvatar.deployed();

		for (let attr = 0; attr < DigiAvatarConst.AvatarAttributesProbsRange.length; attr++) {
			const element = DigiAvatarConst.AvatarAttributesProbsRange[attr];
			
			await contractInstance.setAvatarAttributesProbsRange(attr, 0, element[0]);
			await contractInstance.setAvatarAttributesProbsRange(attr, 1, element[0]);
		}

		await contractInstance.unpause();
	});

	it(`mint`, async () => {
		const now = Math.floor(Date.now() / 1000);
		await contractInstance.setStartTime(now);

		const genders = [1,0,0,1,0];
		const value = web3.utils.toWei((DigiAvatarConst.PRICE * genders.length).toString(), 'ether');

		const mint = await contractInstance.mint(genders, {from: from_account, value: value});

		assert.equal(
			mint.receipt.logs.length,
			genders.length,
			"receipt.logs.length == genders.length"
		);
		
		for (let i = 0; i < genders.length; i++) {
			const tokenId = (DigiAvatarConst._publicTokenIdTracker + i).toString();

			expectEvent(mint, 'Transfer', {
				from: constants.ZERO_ADDRESS,
				to: from_account,
				tokenId: tokenId,
			});
		}
	});
});
