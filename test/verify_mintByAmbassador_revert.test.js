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

contract("DigiAvatar/mintByAmbassador:revert", async accounts => {
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
		await contractInstance.setStartTime(now - DigiAvatarConst.publicMintDuration - 10);
	});

	it(`Gender is 0 or 1`, async () => {
		await expectRevert(
			contractInstance.mintByAmbassador(2, [], {from: from_account, value: web3.utils.toWei((DigiAvatarConst.PRICE).toString(), 'ether')}),
			'Gender is 0 or 1',
		);
	});

	it(`Ambassador Mint has not started`, async () => {
		const now = Math.floor(Date.now() / 1000);
		await contractInstance.setStartTime(now - DigiAvatarConst.publicMintDuration + 10);

		await expectRevert(
			contractInstance.mintByAmbassador(1, [], {from: from_account, value: web3.utils.toWei((DigiAvatarConst.PRICE).toString(), 'ether')}),
			'Ambassador Mint has not started',
		);
	});

	it(`Ambassador Mint is over`, async () => {
		const now = Math.floor(Date.now() / 1000);
		await contractInstance.setStartTime(now - DigiAvatarConst.publicMintDuration - DigiAvatarConst.ambassadorMintDuration - 10);

		await expectRevert(
			contractInstance.mintByAmbassador(1, [], {from: from_account, value: web3.utils.toWei((DigiAvatarConst.PRICE).toString(), 'ether')}),
			'Ambassador Mint is over',
		);
	});

	it(`Incorrect price`, async () => {
		await expectRevert(
			contractInstance.mintByAmbassador(1, [], {from: from_account}),
			'Incorrect price',
		);

		await expectRevert(
			contractInstance.mintByAmbassador(1, [], {from: from_account, value: web3.utils.toWei((DigiAvatarConst.PRICE-0.01).toString(), 'ether')}),
			'Incorrect price',
		);
	});

	it(`Each ambassador address holds up to 1`, async () => {

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
		await contractInstance.setAmbassadorMerkleRoot(root);

		await contractInstance.mintByAmbassador(1, proof, {from: from_account, value: web3.utils.toWei((DigiAvatarConst.PRICE).toString(), 'ether')})

		await expectRevert(
			contractInstance.mintByAmbassador(1, [], {from: from_account, value: web3.utils.toWei((DigiAvatarConst.PRICE).toString(), 'ether')}),
			'Each ambassador address holds up to 1',
		);
	});

	it(`MerkleProof verify faild`, async () => {
		// Ambassador
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
		await contractInstance.setAmbassadorMerkleRoot(root);

		await expectRevert(
			contractInstance.mintByAmbassador(1, proof, {from: accounts[9], value: web3.utils.toWei((DigiAvatarConst.PRICE).toString(), 'ether')}),
			'MerkleProof verify faild',
		);
	});
});
