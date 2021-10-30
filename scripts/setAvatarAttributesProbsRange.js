const DigiAvatar = artifacts.require("DigiAvatar");

module.exports = async function(callback) {
	const contract = await DigiAvatar.deployed();

	console.log('setAvatarAttributesProbsRange');

	const AvatarAttributesProbsRange = [
		{
			1: [10,20,30,40,50,55,60,65,70,75,80,85,90,95,100],
			0: [10,20,30,40,50,55,60,65,70,75,80,85,90,95,100],
		},
		{
			1: [10,20,30,40,50,55,60,65,70,75,80,85,90,95,100],
			0: [10,20,30,40,50,55,60,65,70,75,80,85,90,95,100],
		},
		{
			1: [10,20,30,40,50,55,60,65,70,75,80,85,90,95,100],
			0: [10,20,30,40,50,55,60,65,70,75,80,85,90,95,100],
		},
		{
			1: [10,20,30,40,50,55,60,65,70,75,80,85,90,95,100],
			0: [10,20,30,40,50,55,60,65,70,75,80,85,90,95,100],
		},
		{
			1: [10,20,30,40,50,55,60,65,70,75,80,85,90,95,100],
			0: [10,20,30,40,50,55,60,65,70,75,80,85,90,95,100],
		},
		{
			1: [10,20,30,40,50,55,60,65,70,75,80,85,90,95,100],
			0: [10,20,30,40,50,55,60,65,70,75,80,85,90,95,100],
		},
		{
			1: [10,20,30,40,50,55,60,65,70,75,80,85,90,95,100],
			0: [10,20,30,40,50,55,60,65,70,75,80,85,90,95,100],
		},
	]

	for (let attr = 0; attr < AvatarAttributesProbsRange.length; attr++) {
		const element = AvatarAttributesProbsRange[attr];
		
		console.debug(attr, 0, await contract.setAvatarAttributesProbsRange(attr, 0, element[0]) );
		console.debug(attr, 1, await contract.setAvatarAttributesProbsRange(attr, 1, element[0]) );
	}

	console.log('Done');

	callback();
}