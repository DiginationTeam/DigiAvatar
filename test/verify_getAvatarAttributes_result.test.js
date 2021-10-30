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

contract("DigiAvatar/getAvatarAttributes:result", async accounts => {
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

		await contractInstance.mint(genders, {from: from_account, value: value});

		for (let i = 0; i < genders.length; i++) {
			const tokenId = (DigiAvatarConst._publicTokenIdTracker + i).toString();

			const getAvatarAttributes = await contractInstance.getAvatarAttributes(tokenId);

			assert.lengthOf(
				getAvatarAttributes,
				9,
				'getAvatarAttributes has length of 9'
			);

			assert.hasAnyKeys(
				getAvatarAttributes,
				DigiAvatarConst.attributesStruct,
				'getAvatarAttributes has attributesStruct keys'
			);

			assert.propertyVal(
				getAvatarAttributes,
				'Origin',
				DigiAvatarConst.ORIGIN.toString(),
				`getAvatarAttributes.Origin == ${DigiAvatarConst.ORIGIN}`
			);

			assert.propertyVal(
				getAvatarAttributes,
				'Gender',
				(genders[i]).toString(),
				`getAvatarAttributes.Gender == ${genders[i]}`
			);

			const gender = Number(getAvatarAttributes.Gender);
			for (let attr = 0; attr < DigiAvatarConst.AvatarAttributesProbsRange.length; attr++) {
				const probsRange = DigiAvatarConst.AvatarAttributesProbsRange[attr][gender];
				
				const AttrKey = DigiAvatarConst.attributesStruct[attr+2];

				assert.isAtLeast(
					Number(getAvatarAttributes[AttrKey]),
					0,
					`getAvatarAttributes[${AttrKey}] is greater or equal to 0`
				);

				assert.isAtMost(
					Number(getAvatarAttributes[AttrKey]),
					probsRange.length,
					`getAvatarAttributes[${AttrKey}] is less or equal to ${probsRange.length}`
				);
			}
			
		}
	});
});
