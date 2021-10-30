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

contract("DigiAvatar/mintByAmbassador:result", async accounts => {
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

	it(`mintByAmbassador`, async () => {
		const now = Math.floor(Date.now() / 1000);
		await contractInstance.setStartTime(now - DigiAvatarConst.publicMintDuration);

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
		const receipt = await contractInstance.setAmbassadorMerkleRoot(root);

		expectEvent(receipt, 'AmbassadorMerkleRootChanged', {
			oldRoot: constants.ZERO_BYTES32,
			newRoot: root,
		});

		// mintByAmbassador
		const gender = 1;
		const value = web3.utils.toWei((DigiAvatarConst.PRICE).toString(), 'ether');

		const mint = await contractInstance.mintByAmbassador(gender, proof, {from: from_account, value: value});

		assert.equal(
			mint.receipt.logs.length,
			1 + 1,
			"receipt.logs.length == Transfer + WhiteListMintedAmount) "
		);
		
		expectEvent(mint, 'AmbassadorMintedAmount', {
			account: from_account,
			amount: '1',
		});

		const tokenId = (DigiAvatarConst._AmbassadorTokenIdTracker).toString();
		
		expectEvent(mint, 'Transfer', {
			from: constants.ZERO_ADDRESS,
			to: from_account,
			tokenId: tokenId,
		});
	});
});
