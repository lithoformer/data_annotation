const HtmlTableParser = require('html-table-parser-node');

/**
 * Fetches the HTML table data from a given URL.
 * 
 * @param {string} url - The URL of the document containing the table.
 * @returns {Promise<string>} A promise resolving to the HTML content of the table.
 */
async function getData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error(error.message);
        return null; // Returning null on failure for better error handling
    }
}

/**
 * Decodes a message hidden in an HTML table based on x and y coordinates.
 * 
 * @param {string} html - The HTML content of the document containing the table.
 * @returns {Promise<void>} A promise resolving after displaying the decoded message on the page.
 */
async function decodeMessage(html) {
    if (!html) {
        console.error('Error fetching or parsing HTML.');
        return;
    }

    // Parse the HTML table
    const parser = new HtmlTableParser(html);
    const tableData = parser.parseAllTables()[0];

    // Sort table data first by x-coordinate (unlabelled_0) and then by y-coordinate (unlabelled_2)
    const sortedData = tableData.sort((a, b) => {
        if (a.unlabelled_0 !== b.unlabelled_0) return a.unlabelled_0 - b.unlabelled_0;
        return b.unlabelled_2 - a.unlabelled_2; // Reverse order because y starts from 0 at the bottom
    });

    // Calculate the dimensions of the message
    const maxLength = parseInt(sortedData[sortedData.length - 1].unlabelled_0) + 1;
    const maxWidth = parseInt(sortedData[sortedData.length - 1].unlabelled_2) + 1;

    // Set up the HTML output
    const body = document.querySelector('body');
    const outer = document.createElement('div');
    outer.style.display = 'flex';
    outer.style.width = (12 * (maxLength - 4)) + 'px'; // Width based on character size
    outer.style.flexWrap = 'wrap';
    body.appendChild(outer);

    // Create a grid of divs to represent the message space
    for (let i = 0; i < maxLength * maxWidth; i++) {
        const point = document.createElement('div');
        point.classList.add('position');
        outer.appendChild(point);
    }

    // Map each character to its output position
    sortedData.forEach((item, index) => {
        item.index = index;
    });

    // Populate the grid with characters from the table, or 'N' if there is no character
    const positions = document.querySelectorAll('.position');
    for (let j = 0; j < positions.length; j++) {
        const found = sortedData.find(element => element.index === j);
        if (found) {
            positions[j].textContent = found.unlabelled_1;
        } else {
            positions[j].textContent = 'N';
        }
    }
}

/**
 * Main function to kick off the process.
 */
(async () => {
    const url = "https://docs.google.com/document/d/e/2PACX-1vQGUck9HIFCyezsrBSnmENk5ieJuYwpt7YHYEzeNJkIb9OSDdx-ov2nRNReKQyey-cwJOoEKUhLmN9z/pub";
    const html = await getData(url);
    if (html) {
        await decodeMessage(html);
    }
})();