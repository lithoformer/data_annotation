const HtmlTableParser = require('html-table-parser-node');

(async function getData() {
    const url = "https://docs.google.com/document/d/e/2PACX-1vQGUck9HIFCyezsrBSnmENk5ieJuYwpt7YHYEzeNJkIb9OSDdx-ov2nRNReKQyey-cwJOoEKUhLmN9z/pub";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error(error.message);
    }
}()).then(x => {
    let parser = new HtmlTableParser(x);
    const sorted1 = parser.parseAllTables()[0].sort((a, b) => {
        return a.unlabelled_0 - b.unlabelled_0;
    });

    const maxLength = parseInt(sorted1[sorted1.length - 1].unlabelled_0) + 1;

    const sorted2 = parser.parseAllTables()[0].sort((a, b) => {
        return a.unlabelled_2 - b.unlabelled_2;
    });

    const maxWidth = parseInt(sorted2[sorted2.length - 1].unlabelled_2) + 1;

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

    const positions = document.querySelectorAll('.position');

    for (item of sorted1) {
        item.index = positions.length - ((parseInt(item.unlabelled_2) + 1) * maxLength) + parseInt(item.unlabelled_0);
    }

    for (let j = 0; j < positions.length; j++) {
        const found = sorted1.find(element => element.index === j);
        if (found) {
            positions[j].textContent = found.unlabelled_1;
        }
        else {
            positions[j].textContent = 'N';
        }
    }
})