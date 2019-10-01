
export default ({documentEditor}) => {
	return documentEditor.saveAsBlob('Sfdt').then(async (blob) => {
		// console.log('blob', blob)
		// https://developer.mozilla.org/en-US/docs/Web/API/Blob#Example_for_extracting_data_from_a_Blob
		const json = await (new Response(blob)).json()

		// let result = {error: true}

		return json
	})
}
