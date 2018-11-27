const mainContainer = document.getElementById('main');
const viewWrapper = document.getElementById('view-wrapper');
const loader = document.getElementById('loader');

let json = {};
let dataArray = [];

const url = "https://cors.io/?https://www.fashionphile.com/json-data?model=Product&date=18-10&take=30";

function request (method, url) {
    return new Promise ((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.responseType = 'json';
        xhr.open(method, url);
        xhr.onload = resolve;
        xhr.onerror = reject;
        xhr.send();
    });
}

request('GET', url)
    .then(json => {
        dataArray = json.target.response.data;
    }, e => {
        console.log('error', e);
    })
    .then(() => {
        if(dataArray.length > 0){
            dataArray.forEach(item => {
                let el = document.createElement('div');
                el.classList.add('item', 'card', 'col', 'm-2', 'p-0');
                el.innerHTML = `
                    <img src="https://www.fashionphile.com${item.images}" alt="${item.name}" class="card-img-top"/>
                    <div class="card-body d-flex flex-column justify-content-between">
                        <div class="mb-3">
                            <p class="card-text text-center text-uppercase border-bottom font-weight-light">${item.brand}</p>
                            <p class="card-text small">${item.name}</p>
                        </div>
                        <button class="btn btn-outline-secondary" id="${item.id}">Details</button>
                    </div>
                `;
                mainContainer.appendChild(el);
            });
        }
        loader.classList.add('loaded');
        viewWrapper.classList.add('loaded');
    });