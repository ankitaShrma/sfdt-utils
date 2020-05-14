import get from 'lodash/get';
import populate from '../populate';
import toggleBookmark from '../toggleBookmark';
import getCrossRefData from '../crossReference';
import tableInlines from './fixtures/tableInlines';
import nestedCrossRef from './fixtures/nestedCrossRef';
import emptyBlockSection from './fixtures/emptyBlockSection';
import multiRefInSingleInline from './fixtures/mutiRefInSingleInline';
import sfdtWithCrossRef from './fixtures/crossreference-fromStyleName';
import nestedTableInlines from './fixtures/nestedTableInlines';
import {getSFDT, getInline, getInlines} from '../../__tests__/utils';

const data = {
	K1: '123'
};
const data1 = {
	K1: -12,
	K2: false
};

const inlines = getInlines();

const sfdt = getSFDT(inlines);

describe('SFDT Parser', function() {
	test('populate', function() {
		const orignalLength = getInline(sfdt).length;

		// run function we are testing
		const result = populate(data, sfdt);
		// console.log('result', result)

		// get results we want to look at
		const currentInlines = getInline(result);
		// console.log('result', currentInlines)

		// make sure we get the same amount of data back, no additions.
		expect(currentInlines.length).toEqual(orignalLength);

		// check replacement went well
		expect(currentInlines[2].text).toEqual('123');
		expect(currentInlines[2].fieldType).toBeUndefined();
		expect(currentInlines[2].hasFieldEnd).toBeUndefined();
	});

	test('populate when data already exists', function() {
		// run function we are testing
		const sfdtWithData = {
			sections: [
				{
					blocks: [
						{
							inlines: [...inlines]
						}
					]
				}
			]
		};

		const orignalLength = getInline(sfdtWithData).length;
		sfdtWithData.sections[0].blocks[0].inlines[2].text = '123';

		const result = populate(data, sfdtWithData);
		// console.log('result', result)

		// get results we want to look at
		const currentInlines = getInline(result);
		// console.log('result', currentInlines)

		// make sure we get the same amount of data back, no additions.
		expect(currentInlines.length).toEqual(orignalLength);

		// check replacement went well
		expect(currentInlines[2].text).toEqual('123');
	});

	test('populate and inject string data to stop breaking sfdt', function() {
		const orignalLength = getInline(sfdt).length;
		const result = populate(data1, sfdt);

		const currentInlines = getInline(result);

		// make sure we get the same amount of data back, no additions.
		expect(currentInlines.length).toEqual(orignalLength);

		// check replacement went well and data is converted to string
		expect(currentInlines[2].text).toEqual('-12');
		expect(currentInlines[5].text).toEqual('false');
	});
});

describe('Populate', () => {
	test('inject data in table', () => {
		const sfdtWithInlines = getSFDT(tableInlines);
		const data = {
			'field.list.weeks': 'Monday'
		};

		const updatedSfdt = populate(data, sfdtWithInlines);

		const updatedBlockAfterPopulate = getInline(updatedSfdt, 0, 0, {
			rowPosition: 0,
			cellPosition: 2,
			blockPositionInCell: 0
		});
		expect(get(updatedBlockAfterPopulate, 'inlines[1].text')).toEqual('Monday');
	});

	test('inject data in nested table', () => {
		const data = {
			name: 'testData'
		};

		const updatedSfdt = populate(data, nestedTableInlines);
		const updatedSfdtTable = updatedSfdt.sections[0].blocks[0];
		const levelOne = updatedSfdtTable.rows[0].cells[0].blocks[0];
		const levelTwo = updatedSfdtTable.rows[0].cells[1].blocks[0].rows[0].cells[0].blocks[0];
		expect(get(levelOne, 'inlines[1].text')).toEqual('testData');
		expect(get(levelTwo, 'inlines[1].text')).toEqual('testData');
	});

	test('Text with line separator is split in multiple lines', () => {
		const data = {
			K1: 'Line 1\nLine 2\nLine 3'
		};
		const originalInlines = getInline(sfdt);

		const updatedSfdt = populate(data, {...sfdt});

		const currentInlines = getInline(updatedSfdt);

		//we should have `Line 1` injected in a present inline, line 2 and 3 are new inlines
		// and 2 inlines with vertival tab as separator => size + 4
		expect(currentInlines.length).toEqual(originalInlines.length + 4);

		const targetInlines = [
			{text: 'starting'},
			{bookmarkType: 0, name: 'DATA::bookmarkOne::K1'},
			{text: 'Line 1'},
			{text: '\u000b'},
			{text: 'Line 2'},
			{text: '\u000b'},
			{text: 'Line 3'},
			{bookmarkType: 1, name: 'DATA::bookmarkOne::K1'},
			{bookmarkType: 0, name: 'DATA::bookmarkTwo::K2'},
			{text: 'false'},
			{bookmarkType: 1, name: 'DATA::bookmarkTwo::K2'},
			{text: 'ending'}
		];

		expect(currentInlines).toEqual(targetInlines);
	});
});

describe('Remove empty section from sfdt', () => {
	it('Checks the sfdt is correct or not', () => {
		const originalSfdt = emptyBlockSection;
		expect(get(originalSfdt, 'sections').length).toBe(3);
	});

	it('Removes whole section if block is empty', () => {
		const name = 'COND::877ba8ee-1ccc-4979-86fb-5467b1f919b7';
		const sectionLength = emptyBlockSection.sections.length;
		const updatedSfdt = toggleBookmark(emptyBlockSection, name, false);
		const finalSfdt = populate({test: 'test'}, updatedSfdt);
		expect(get(finalSfdt, 'sections').length).toBe(sectionLength - 1);
	});
});

describe('Populate with Cross reference', () => {
	test('update cross ref data', () => {
		const crossRefSfdt = sfdtWithCrossRef;
		const data = getCrossRefData(crossRefSfdt);
		const updatedSfdt = populate(data, crossRefSfdt);
		expect(updatedSfdt.sections[0].blocks[43].inlines[15].text).toEqual('4.1(a)');
		expect(updatedSfdt.sections[0].blocks[41].inlines[15].text).toEqual('4.2');
	});

	test('populate with multiple crossref reference in same inline', () => {
		const crossRefSfdt = multiRefInSingleInline;
		const cfData = getCrossRefData(crossRefSfdt);
		const updatedSfdt = populate(cfData, crossRefSfdt);
		const inlines = updatedSfdt.sections[0].blocks[6].inlines;
		const data = [];
		inlines.forEach((inline, i) => {
			if (inline.bookmarkType === 0 && inline.name === 'XREF::three') data.push(inlines[i + 1].text);
		});
		// this below test shows the crossref without uuid
		expect(data).toEqual(['3.', '3.', '3.']);
	});
	test('populate with same crossref reference in same inline', () => {
		const crossRefSfdt = nestedCrossRef;
		const cfData = getCrossRefData(crossRefSfdt);

		const updatedSfdt = populate(cfData, crossRefSfdt);
		const inlines = updatedSfdt.sections[0].blocks[0].inlines;
		const data = [];
		inlines.forEach((inline, i) => {
			if (inline.bookmarkType === 0 && inline.name.includes('XREF::uuid')) data.push(inlines[i + 1].text);
    });
    // this is for uuid based xref ^^ for uuid1::2 and uuid2::2
		expect(data).toEqual(['2.', '2.']);
	});
});
