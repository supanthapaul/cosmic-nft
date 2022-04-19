import React, {useState, useEffect} from 'react'

const NftPreview = ({ nftMetadata, nftLink }) => {

	const [codeJson, setCodeJson] = useState(null);
  const [codeImage, setCodeImage] = useState(null);

	useEffect(() => {
		try {
			if (!nftMetadata) {
				return;
			}

			const [, jsonContentEncoded] = nftMetadata.split("base64,");
			if (!jsonContentEncoded) {
				throw new Error("json content is not valid");
			}
			const { image, ...jsonContent } = JSON.parse(window.atob(jsonContentEncoded));
			setCodeJson(jsonContent);
			setCodeImage(image);

		} catch (error) {
			console.error(error);
			setCodeJson(null);
			setCodeImage(null);
		}
	}, [nftMetadata])

	return (
		<div className="grid items-center" >
      <div>
        <div className="text-white" style={{width: "100%", maxWidth: 650}}>
          <h3 className="font-bold mb-2" style={{fontWeight: 700, fontSize: 24, marginBottom: "12px"}}>🎉 Your NFT is Minted 🎉</h3>
					{nftLink && (<p>{`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: `} <a target="_blank" href={nftLink} style={{color: "#38BDF8"}}>View on OpenSea.</a> In the meantime, here's an instant preview of your newly minted NFT,</p>)}
          {codeJson && (
            <div className="grid grid-cols-3 gap-4 my-8">
              {Object.keys(codeJson).map((key) => (
                <>
                  <div key={key} className="col-start-1 col-end-2 font-bold">
                    {key}
                  </div>
                  <div key={`${key}-value`} className="col-start-2 col-end-4">
                    {codeJson[key]}
                  </div>
                </>
              ))}
            </div>
          )}

          {codeImage && (
            <img
              className="max-w-full max-h-full w-auto"
              src={codeImage}
              alt="NFT preview"
            />
          )}
        </div>
      </div>
    </div>
	)
}

export default NftPreview;