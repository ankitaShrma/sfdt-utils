import typescript from 'rollup-plugin-typescript'
// import terser from 'rollup-plugin-terser'

export default {
    input: {
        index: 'src/index.ts',
        populate: 'src/populate.ts',
        processInlines: 'src/processInlines.ts',
        getCurrentSelection: 'src/getCurrentSelection.ts',

        updateBookmarkContent: 'src/updateBookmarkContent.ts',
        insertBookmark: 'src/insertBookmark.ts',
        toggleBookmark: 'src/toggleBookmark.ts',
        queryBookmark: 'src/queryBookmark.ts',
        bookmarkHighlight: 'src/bookmarkHighlight.ts',

        getSFDTjson: 'src/getSFDTjson.ts',
        getSFDTstring: 'src/getSFDTstring.ts',
        showCaret: 'src/showCaret.ts',
    },
    external: [
        'lodash',
    ],
    output: [
        {
            dir: '.',
            format: 'cjs'
        }
    ],
	plugins: [
		// terser(),
		typescript()
	]
}
