// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.1;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

import { Base64 } from "./libraries/Base64.sol";

contract CosmicNFT is ERC721URIStorage {
	// OpenZeppelin Counter to help us keep track of tokenIds.
	using Counters for Counters.Counter;
	Counters.Counter private _tokenIds;

	// We split the SVG at the part where it asks for the background color.
  string svgPartOne = "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 350 350'><style>.base { fill: white; font-family: serif; font-size: 24px; }</style><rect width='100%' height='100%' fill='";
  string svgPartTwo = "'/><text x='50%' y='50%' class='base' dominant-baseline='middle' text-anchor='middle'>";

	// arrays each with their own theme of random words.
	string[] firstWords = ["Fantastic", "Epic", "Terrible", "Crazy", "Wild", "Awesome", "Insane", "Spooky"];
	string[] secondWords = ["Cupcake", "Milkshake", "Muffin", "Pizza", "Chicken", "Curry", "Sandwich", "Salad"];
	string[] thirdWords = ["Ninja", "Naruto", "Coder", "Sakura", "Goku", "Sasuke", "Fighter", "Holder", "Freak"];

	string[] colors = ["#753a88", "#08C2A8", "black", "#4184A4", "#cc2b5e", "green", "#F27455", "#191C1F"];

	event NewCosmicNFTMinted(address sender, uint256 tokenId, string metadata);

	constructor() ERC721 ("CosmicNFT", "COSMIC") {
		console.log("This is my NFT contract. Whoa!");
	}

	// I create a function to randomly pick a word from each array.
	function pickRandomFirstWord(uint256 tokenId) public view returns (string memory) {
		// I seed the random generator. More on this in the lesson. 
		uint256 rand = random(string(abi.encodePacked("FIRST_WORD", Strings.toString(tokenId))));
		// Squash the # between 0 and the length of the array to avoid going out of bounds.
		rand = rand % firstWords.length;
		return firstWords[rand];
	}

	function pickRandomSecondWord(uint256 tokenId) public view returns (string memory) {
		uint256 rand = random(string(abi.encodePacked("SECOND_WORD", Strings.toString(tokenId))));
		rand = rand % secondWords.length;
		return secondWords[rand];
	}

	function pickRandomThirdWord(uint256 tokenId) public view returns (string memory) {
		uint256 rand = random(string(abi.encodePacked("THIRD_WORD", Strings.toString(tokenId))));
		rand = rand % thirdWords.length;
		return thirdWords[rand];
	}

	function pickRandomColor(uint256 tokenId) public view returns (string memory) {
    uint256 rand = random(string(abi.encodePacked("COLOR", Strings.toString(tokenId))));
    rand = rand % colors.length;
    return colors[rand];
  }

	function random(string memory input) internal pure returns (uint256) {
			return uint256(keccak256(abi.encodePacked(input)));
	}

	function makeACosmicNFT() public {
		// Get the current tokenId, this starts at 0.
		uint256 newItemId = _tokenIds.current();

		string memory firstWord = pickRandomFirstWord(newItemId);
		string memory secondWord = pickRandomSecondWord(newItemId);
		string memory thirdWord = pickRandomThirdWord(newItemId);
		string memory combinedWord = string(abi.encodePacked(firstWord, secondWord, thirdWord));

		string memory randomColor = pickRandomColor(newItemId);
		// concatenate it all together, and then close the <text> and <svg> tags.
    string memory finalSvg = string(abi.encodePacked(svgPartOne, randomColor, svgPartTwo, combinedWord, "</text></svg>"));

		// Get all the JSON metadata in place and base64 encode it.
		string memory json = Base64.encode(
			bytes(
				string(
					abi.encodePacked(
						'{"name": "',
						// We set the title of our NFT as the generated word.
						combinedWord,
						'", "description": "A highly acclaimed collection of Cosmic NFTs.", "image": "data:image/svg+xml;base64,',
						// We add data:image/svg+xml;base64 and then append our base64 encode our svg.
						Base64.encode(bytes(finalSvg)),
						'"}'
					)
				)
			)
		);
		string memory finalTokenUri = string(
				abi.encodePacked("data:application/json;base64,", json)
		);
		console.log("\n--------------------");
		console.log(
			string(
				abi.encodePacked(
					"https://nftpreview.0xdev.codes/?code=",
					finalTokenUri
				)
			)
		);
		console.log("--------------------\n");

		// Actually mint the NFT to the sender using msg.sender.
		_safeMint(msg.sender, newItemId);
		// Set the NFTs data.
		_setTokenURI(newItemId, finalTokenUri);
		console.log("An NFT w/ ID %s has been minted to %s", newItemId, msg.sender);
		// Increment the counter for when the next NFT is minted.
		_tokenIds.increment();

		emit NewCosmicNFTMinted(msg.sender, newItemId, finalTokenUri);
	}
}