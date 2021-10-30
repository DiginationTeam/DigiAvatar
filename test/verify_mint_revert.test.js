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

contract("DigiAvatar/mint:revert", async accounts => {
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

		const now = Math.floor(Date.now() / 1000);
		await contractInstance.setStartTime(now);
	});

	beforeEach(async function () {
		const now = Math.floor(Date.now() / 1000);
		await contractInstance.setStartTime(now);
	});

	it(`Public Mint has not started`, async () => {
		const now = Math.floor(Date.now() / 1000);
		await contractInstance.setStartTime(now + 10);

		const genders = [1];

		await expectRevert(
			contractInstance.mint(genders, {from: from_account, value: web3.utils.toWei((DigiAvatarConst.PRICE).toString(), 'ether')}),
			'Public Mint has not started',
		);
	});

	it(`Public Mint is over`, async () => {
		const now = Math.floor(Date.now() / 1000);
		await contractInstance.setStartTime(now - DigiAvatarConst.publicMintDuration);

		const genders = [1];

		await expectRevert(
			contractInstance.mint(genders, {from: from_account, value: web3.utils.toWei((DigiAvatarConst.PRICE).toString(), 'ether')}),
			'Public Mint is over',
		);
	});

	it(`Incorrect price`, async () => {
		const genders = [1];

		await expectRevert(
			contractInstance.mint(genders, {from: from_account}),
			'Incorrect price',
		);

		await expectRevert(
			contractInstance.mint(genders, {from: from_account, value: web3.utils.toWei((DigiAvatarConst.PRICE-0.01).toString(), 'ether')}),
			'Incorrect price',
		);

	});

	it(`Can only mint 1 to 5 avatar at a time`, async () => {
		await expectRevert(
			contractInstance.mint([], {from: from_account, value: web3.utils.toWei((DigiAvatarConst.PRICE).toString(), 'ether')}),
			'Can only mint 1 to 5 avatar at a time',
		);

		const genders = [1,1,1,1,1,1];
		const value = web3.utils.toWei((DigiAvatarConst.PRICE * genders.length).toString(), 'ether');

		await expectRevert(
			contractInstance.mint(genders, {from: from_account, value: value}),
			'Can only mint 1 to 5 avatar at a time',
		);
	});
	
	it(`Caller cannot be contract`, async () => {
		const contractAddress = await contractInstance.address;

		await expectRevert(
			contractInstance.mint([1], {from: contractAddress, value: web3.utils.toWei((DigiAvatarConst.PRICE).toString(), 'ether')}),
			'Caller cannot be contract',
		);
	});

	it(`Gender is 0 or 1`, async () => {
		await expectRevert(
			contractInstance.mint([2], {from: from_account, value: web3.utils.toWei((DigiAvatarConst.PRICE).toString(), 'ether')}),
			'Gender is 0 or 1',
		);
	});
	
});
