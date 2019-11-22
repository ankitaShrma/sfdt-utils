import {DocumentEditor} from '@syncfusion/ej2-documenteditor'

import bookmarkHighlight from './bookmarkHighlight'

type options = {
	bookmarkName: string;
	bookmarkContent: string;
	highlightColor?: string;
	noForceUpdate?: boolean
}

const debug = false

/**
* Insert a bookmark at the currently selected point in the editor
*
* @param {Object} options - {
*                         	bookmarkName: String = Name of the bookmark to insert
*                         	highlightColor?: String =  Hex code of background: eg: '#FFFFFF'
*                         	bookmarkContent?: string = Change contents of the bookmark to this string
*                         }
* @param {Object} documentEditor
*/
const insertBookmark: (options: options, documentEditor: DocumentEditor) => void = (options, documentEditor) => {
	debug && console.log('Bookmark name:', options.bookmarkName)

	documentEditor.editor.insertBookmark(options.bookmarkName)

	if (options.highlightColor) {
		// NOTE: setTimeout is required, else sometimes this will not apply highlight properly
		setTimeout(() => {
			// 	debug && console.log('Adding highlight:', options.highlightColor)
			bookmarkHighlight(options.bookmarkName, documentEditor, options.highlightColor)
		}, 0)
	}

	if (options.bookmarkContent) {
		debug && console.log('Bookmark content:', options.bookmarkContent)
		documentEditor.editor.insertText(options.bookmarkContent)
	} else {

		// option here because this will break if selection is paragraph, eg: lose paragraph formatting
		if (!options.noForceUpdate) {
			// update text to stop formatting bug
			documentEditor.editor.insertText(documentEditor.selection.text)
		}
	}

}

export default insertBookmark
