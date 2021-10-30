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

contract("DigiAvatar/setAvatarAttributesProbsRange:revert", async accounts => {
	let contractInstance;
    const [from_account] = accounts;

	before(async function () {
		contractInstance = await DigiAvatar.deployed();

	});

	it(`Wrong number of attributes`, async () => {
		await expectRevert(
			contractInstance.setAvatarAttributesProbsRange(7, 0, []),
			'Wrong number of attributes',
		);
	});

	it(`Gender is 0 or 1`, async () => {
		await expectRevert(
			contractInstance.setAvatarAttributesProbsRange(0, 2, []),
			'Gender is 0 or 1',
		);
	});

	it(`Attributes already exists`, async () => {
		contractInstance.setAvatarAttributesProbsRange(6, 1, DigiAvatarConst.AvatarAttributesProbsRange[0][1])

		await expectRevert(
			contractInstance.setAvatarAttributesProbsRange(6, 1, []),
			'Attributes already exists',
		);
	});

	it(`probsRange length needs to be greater than 1`, async () => {
		await expectRevert(
			contractInstance.setAvatarAttributesProbsRange(0, 1, []),
			'probsRange length needs to be greater than 1',
		);
	});

	it(`probsRange first needs to be greater than 0`, async () => {
		await expectRevert(
			contractInstance.setAvatarAttributesProbsRange(0, 1, [0, 1]),
			'probsRange first needs to be greater than 0',
		);
	});

	it(`probsRange needs to be equal to 100 at the end`, async () => {
		await expectRevert(
			contractInstance.setAvatarAttributesProbsRange(0, 1, [10, 98]),
			'probsRange needs to be equal to 100 at the end',
		);
	});
	
	it(`probsRange must be an orderly increase`, async () => {
		await expectRevert(
			contractInstance.setAvatarAttributesProbsRange(0, 1, [10, 30, 20, 100]),
			'probsRange must be an orderly increase',
		);
	});
	
});
