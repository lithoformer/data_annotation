const HtmlTableParser = require('html-table-parser-node');

/**
 * Fetches the HTML data table from a given URL.
 *
 * @param {string} url - The URL of the document containing the table.
 * @returns {Promise<string>} A promise that resolves with the table's HTML content.
 */
async function fetchTableData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error(error.message);
        throw error;
    }
}

/**
 * Parses an HTML table and calculates the maximum dimensions of the message.
 *
 * @param {string} html - The HTML content of the table.
 * @returns {{ maxLength: number, maxWidth: number, parsedTable: Array }} An object
 *                                                                       containing
 *                                                                       the maximum
 *                                                                       length, width,
 *                                                                       and parsed table.
 */
function parseAndCalculateDimensions(html) {
    const parser = new HtmlTableParser(html);
    const table = parser.parseAllTables()[0];

    // Calculate maxLength and maxWidth
    let maxLength = 0;
    let maxWidth = 0;

    for (const row of table) {
        for (const cell of row) {
            maxLength = Math.max(maxLength, parseInt(cell.unlabelled_0, 10) + 1);
            maxWidth = Math.max(maxWidth, parseInt(cell.unlabelled_2, 10) + 1);
        }
    }

    return {
        maxLength,
        maxWidth,
        parsedTable,
    };
}

/**
 * Sets the HTML formatting, styles, and creates divs for the message output.
 *
 * @param {number} maxLength - The width of the message in characters.
 * @param {number} maxWidth - The height of the message in characters.
 */
function setUpHTML(maxLength, maxWidth) {
    const body = document.querySelector('body');
    const outer = document.createElement('div');
    outer.style.display = 'flex';
    outer.style.width = (12 * (maxLength - 4)) + 'px';
    outer.style.flexWrap = 'wrap';
    body.appendChild(outer);

    for (let i = 0; i < maxLength * maxWidth; i++) {
        const point = document.createElement('div');
        point.classList.add('position');
        outer.appendChild(point);
    }

    return document.querySelectorAll('.position');
}

/**
 * Mappings each table cell to its output position index.
 *
 * @param {Array} parsedTable - The parsed table with x- and y-coordinates.
 * @param {number} maxLength - The width of the message.
 * @param {number} maxWidth - The height of the message.
 * @returns {Array} The sorted table with an added index property.
 */
function assignPositionIndices(parsedTable, maxLength, maxWidth) {
    parsedTable.sort((a, b) => {
        const aIndex = ((parseInt(a.unlabelled_2, 10) + 1) * maxLength) - 1 + parseInt(a.unlabelled_0, 10);
        const bIndex = ((parseInt(b.unlabelled_2, 10) + 1) * maxLength) - 1 + parseInt(b.unlabelled_0, 10);
        return aIndex - bIndex;
    });

    parsedTable.forEach((item, index) => {
        item.index = index;
    });

    return parsedTable;
}

/**
 * Outputs the characters from the table to the correct positions in the HTML.
 *
 * @param {Array} sortedTable - The sorted table with index properties.
 * @param {Array} positions - The HTML positions to fill with characters.
 */
function outputCharacters(sortedTable, positions) {
    for (let i = 0; i < positions.length; i++) {
        const found = sortedTable.find(element => element.index === i);
        positions[i].textContent = found ? found.unlabelled_1 : 'N';
    }
}

async function main() {
    const url = "https://docs.google.com/document/d/e/2PACX-1vQGUck9HIFCyezsrBSnmENk5ieJuYwpt7YHYEzeNJkIb9OSDdx-ov2nRNReKQyey-cwJOoEKUhLmN9z/pub";
    const html = await fetchTableData(url);

    const { maxLength, maxWidth, parsedTable } = parseAndCalculateDimensions(html);
    const positions = setUpHTML(maxLength, maxWidth);
    const sortedTable = assignPositionIndices(parsedTable, maxLength, maxWidth);
    outputCharacters(sortedTable, positions);
}

main();