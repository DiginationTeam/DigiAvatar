const web3 = require("web3");
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const DigiAvatar = artifacts.require("DigiAvatar");
const DigiAvatarConst = require("./DigiAvatarConst");
const { assert } = require('chai');
const {
	BN,           // Big Number support
	constants,    // Common constants, like the zero address and largest integers
	expectEvent,  // Assertions for emitted events
	expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

contract("DigiAvatar/mintByWhitelist:revert", async accounts => {
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

	beforeEach(async function () {
		const now = Math.floor(Date.now() / 1000);
		await contractInstance.setStartTime(now + 10);
	});

	it(`Pre-Public Mint has not started`, async () => {
		const now = Math.floor(Date.now() / 1000);
		await contractInstance.setStartTime(now + DigiAvatarConst.prePublicMintDuration + 10);

		const genders = [1];

		await expectRevert(
			contractInstance.mintByWhitelist(genders, [], {from: from_account, value: web3.utils.toWei((DigiAvatarConst.PRICE).toString(), 'ether')}),
			'Pre-Public Mint has not started',
		);
	});

	it(`Pre-Public Mint is over`, async () => {
		const now = Math.floor(Date.now() / 1000);
		await contractInstance.setStartTime(now - 10);

		const genders = [1];

		await expectRevert(
			contractInstance.mintByWhitelist(genders, [], {from: from_account, value: web3.utils.toWei((DigiAvatarConst.PRICE).toString(), 'ether')}),
			'Pre-Public Mint is over',
		);
	});

	it(`Incorrect price`, async () => {
		const genders = [1];

		await expectRevert(
			contractInstance.mintByWhitelist(genders, [], {from: from_account}),
			'Incorrect price',
		);

		await expectRevert(
			contractInstance.mintByWhitelist(genders, [], {from: from_account, value: web3.utils.toWei((DigiAvatarConst.PRICE-0.01).toString(), 'ether')}),
			'Incorrect price',
		);

	});

	it(`Each whitelist address holds up to 5`, async () => {
		const genders = [1,1,1,1,1,1];
		const value = web3.utils.toWei((DigiAvatarConst.PRICE * genders.length).toString(), 'ether');

		await expectRevert(
			contractInstance.mintByWhitelist(genders, [], {from: from_account, value: value}),
			'Each whitelist address holds up to 5',
		);
	});

	it(`MerkleProof verify faild`, async () => {
		const genders = [1];

		// WhiteList
		const elements = [
			from_account,
			accounts[1],
			accounts[2],
		];

		// MerkleTree
		const merkleTree = new MerkleTree(elements, keccak256, { hashLeaves: true, sortPairs: true });
		const root = merkleTree.getHexRoot();
		const leaf = keccak256(from_account);
		const proof = merkleTree.getHexProof(leaf);

		// Set MerkleTree Root
		await contractInstance.setWhiteListMerkleRoot(root);

		await expectRevert(
			contractInstance.mintByWhitelist(genders, proof, {from: accounts[9], value: web3.utils.toWei((DigiAvatarConst.PRICE).toString(), 'ether')}),
			'MerkleProof verify faild',
		);
	});
});
