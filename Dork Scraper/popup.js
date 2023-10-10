function extractUrls(domainInput,searchEngine) {
    let endpoints = [];
    let subdomain = new Set();
    if (searchEngine == "google"){
        var links = document.querySelectorAll('a[ping]');
        var link, domain;
        for (var i = 12; i < links.length; i++) {
            link = links[i].getAttribute("ping").split("url=")[1].split("&ved=")[0];
            domain = new URL(link).hostname;
            if (domain.endsWith(domainInput)) {
                endpoints.push(link);
                subdomain.add( link.split("/")[2] );
            }
        }
    }
    
    if (searchEngine == "bing"){
        var links = document.querySelectorAll('a[class="tilk"]');
        var link, domain;
        for (let index = 0; index < links.length; index++) {
            link = links[index].getAttribute("href");
            domain = new URL(link).hostname;
            if (domain.endsWith(domainInput)) {
                endpoints.push(link);
                subdomain.add( link.split("/")[2] );
            }
        }
    }

    if (searchEngine == "duckduckgo"){
        var links = document.querySelectorAll('a[data-testid="result-extras-url-link"]');
        var link, domain;
        for (let index = 0; index < links.length; index++) {
            link = links[index].getAttribute("href");
            domain = new URL(link).hostname;
            if (domain.endsWith(domainInput)) {
                endpoints.push(link);
                subdomain.add( link.split("/")[2] );
            }
        }
    }
    
    if (searchEngine == "yandex"){
        var links = document.getElementsByClassName("organic__greenurl");
        var link, domain;
        for (let index = 0; index < links.length; index++) {
            link = links[index].getAttribute("href");
            domain = new URL(link).hostname;
            if (domain.endsWith(domainInput)) {
                endpoints.push(link);
                subdomain.add( link.split("/")[2] );
            }
        }
    }
    
    if (searchEngine == "yahoo"){
        var links = document.querySelectorAll('a[data-matarget]');
        var link, domain;
        for (let index = 0; index < links.length; index++) {
            link = links[index].getAttribute("href");
            domain = new URL(link).hostname;
            if (domain.endsWith(domainInput)) {
                endpoints.push(link);
                subdomain.add( link.split("/")[2] );
            }
            
            if (domain.endsWith("yahoo.com")) {
                link = decodeURIComponent(link.split("/RU=")[1].split("/RK=")[0])
                endpoints.push(link);
                subdomain.add( link.split("/")[2] );
            }
        }
    }
    
    subdomain = [...subdomain];
    return [endpoints, subdomain];
}

// Redirection function
function redirection(searchUrl,start) {
    chrome.tabs.update({ url: searchUrl });
    document.getElementById('pageStatus').style.color = "red";
    document.getElementById('pageStatus').textContent = "redirected"; 
    document.getElementById('endpointsCounter').textContent = 0;
    document.getElementById('subdomainsCounter').textContent = 0;
    document.getElementById('pageNumber').textContent = start;
}

// Scrapping function
function scrapping(domainInput, start, searchEngine) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const currentPageId = tabs[0].id;
        chrome.scripting.executeScript({
          target: { tabId: currentPageId },
          func: extractUrls,
          args: [domainInput,searchEngine],
        }).then(injectionResults => {
          
          
          for (let i = 0; i < injectionResults[0].result[0].length; i++) {
              addEndpoint(domainInput, injectionResults[0].result[0][i]);
              
          }
          
          console.log(injectionResults[0].result[1]);
          for (let j = 0; j < injectionResults[0].result[1].length; j++) {
              addSubdomain(domainInput, injectionResults[0].result[1][j]);
              console.log(injectionResults[0].result[1][j]);
              
          }
          
          document.getElementById('endpointsCounter').textContent = injectionResults[0].result[0].length;
          document.getElementById('subdomainsCounter').textContent = injectionResults[0].result[1].length;
          
          document.getElementById('pageNumber').textContent = start;
          
          document.getElementById('pageStatus').style.color = "darkgreen";
          document.getElementById('pageStatus').textContent = "scraped";
          
          console.log("crawling page (" + start + ") : " + injectionResults[0].result[0].length + " endpoints");
        });
  });
}
document.addEventListener('DOMContentLoaded', function() {
    const prevPage = document.getElementById('prevPage');
    const scraper = document.getElementById('scraper');
    const nextPage = document.getElementById('nextPage');
    //const nextDork = document.getElementById('nextDork');
    //const printOutput = document.getElementById('printOutput');
    
    let startDork,dork,domain,searchUrl,searchEngine;
    
    let start = 0; //google page counter
    let first = 1; //bing results counter
    let dorkid = 0;
    

    prevPage.addEventListener('click', function() {
        startDork = document.getElementById('startDork').value;
        domain = document.getElementById('targetDomain').value;
        searchEngine = document.getElementById('searchEngine').value;
        
        dork = startDork.replaceAll(" ", "%20").replaceAll(":", "%3A").replaceAll("$target$",domain);
        
        if (searchEngine == "google"){
            start = start - 2;
            dork = dork + '&num=100&start=' + start + "&filter=0";

            searchUrl = 'https://www.google.com/search?q=' + dork;
        }
        
        if (searchEngine == "bing"){
        
            if (first == 70){
                first = first - 79;
            }else{
                first = first - 100;
            }
            
            dork = dork + '&count=50&first=' + first;

            searchUrl = 'https://www.bing.com/search?q=' + dork;
            
            
        }
        
        if (searchEngine == "yahoo"){
        
            first = first - 14;
            
            dork = dork + '&b=' + first;

            searchUrl = 'https://search.yahoo.com/search?p=' + dork;
            
            
        }
        
        if (searchEngine == "duckduckgo"){

            searchUrl = 'https://duckduckgo.com/?q=' + dork;

        }

        if (searchEngine == "yandex"){
            start = start - 2;
            dork = dork + '&p=' + start;

            searchUrl = 'https://yandex.com/search/?text=' + dork;
        }
        
        
        redirection(searchUrl,start);
        displayTotalresults();
    });
    
    scraper.addEventListener('click', function() {
        domain = document.getElementById('targetDomain').value;
        searchEngine = document.getElementById('searchEngine').value;
        scrapping(domain, start, searchEngine);
        displayTotalresults();
    });
    
    nextPage.addEventListener('click', function() {
        startDork = document.getElementById('startDork').value;
        domain = document.getElementById('targetDomain').value;
        searchEngine = document.getElementById('searchEngine').value;
        
        dork = startDork.replaceAll(" ", "%20").replaceAll(":", "%3A").replaceAll("$target$",domain);
        
        if (searchEngine == "google"){
            dork = dork + '&num=100&start=' + start + "&filter=0";

            searchUrl = 'https://www.google.com/search?q=' + dork;
        }
        
        if (searchEngine == "bing"){
            
            dork = dork + '&count=50&first=' + first;

            searchUrl = 'https://www.bing.com/search?q=' + dork;
            
            console.log("before : " + first);
            if (first == 1){
                first = first + 19;
            }else{
                first = first + 50;
            }
            console.log("after : " + first);
        }
        
        if (searchEngine == "yahoo"){
            
            dork = dork + '&b=' + first;

            searchUrl = 'https://search.yahoo.com/search?p=' + dork;
            
            first = first + 7;
        }
        
        
        if (searchEngine == "duckduckgo"){

            searchUrl = 'https://duckduckgo.com/?q=' + dork;

        }

        if (searchEngine == "yandex"){
            dork = dork + '&p=' + start;

            searchUrl = 'https://yandex.com/search/?text=' + dork;
        }
        
        
        
        console.log(dork+targetDomain+searchEngine+first+start);
        redirection(searchUrl,start);      
        displayTotalresults();
        start++;
    });
    
    /*nextDork.addEventListener('click', function() {
        dorkid++;
        start = 0;
    });*/
    
    const searchEngineDropdown = document.getElementById('searchEngine');
    searchEngineDropdown.addEventListener('change', displayDorks);
    
    const startDorkDropdown = document.getElementById('startDork');
    startDorkDropdown.addEventListener('change', function() {
        start = 0;
        first = 1;
    });
    
});

function displayTotalresults(){
    const domain = document.getElementById('targetDomain').value;
    const endpointsCount = document.getElementById("totalEndpointsCounter");
    const subdomainsCount = document.getElementById("totalSubdomainsCounter");
    getTotalEndpoints(domain).then(count => {
        endpointsCount.textContent = count
    })
    getTotalSubdomains(domain).then(count => {
        subdomainsCount.textContent = count
    })
}

// Open IndexedDB database
const request = indexedDB.open('DorkScraperDB', 2);
let db;

request.onsuccess = function(event) {
  db = event.target.result;
  displayDomains(); // Call the function after the database is opened successfully
  displaySearchEngines();
};

// Display domains in the targetDomain dropdown
function displayDomains() {
  const transaction = db.transaction('domains', 'readonly');
  const domainsStore = transaction.objectStore('domains');
  const targetDomainDropdown = document.getElementById('targetDomain');

  // Clear existing options
  targetDomainDropdown.innerHTML = '';

  // Retrieve domains from the object store
  const request = domainsStore.openCursor();
  request.onsuccess = function(event) {
    const cursor = event.target.result;
    if (cursor) {
      const domain = cursor.value.domain;

      // Create option element and set its value and text
      const option = document.createElement('option');
      option.value = domain;
      option.textContent = domain;

      // Append the option to the dropdown
      targetDomainDropdown.appendChild(option);

      // Move to the next domain
      cursor.continue();
    }
  };
}

// Display dorks in the table based on the selected search engine
function displayDorks() {
  const transaction = db.transaction('dorks', 'readonly');
  const dorksStore = transaction.objectStore('dorks');
  const startDorkDropdown = document.getElementById('startDork');
  const searchEngineDropdown = document.getElementById('searchEngine');
  const selectedSearchEngine = searchEngineDropdown.value;

  // Clear existing options
  startDorkDropdown.innerHTML = '';

  // Retrieve dorks from the object store based on the selected search engine
  const index = dorksStore.index('searchEngine');
  const request = index.openCursor(IDBKeyRange.only(selectedSearchEngine));
  request.onsuccess = function(event) {
    const cursor = event.target.result;
    if (cursor) {
      const dork = cursor.value.dork;
      const option = document.createElement('option');
      option.textContent = dork;
      startDorkDropdown.appendChild(option);
      cursor.continue();
    }
  };
}

// Display search engines in the searchEngine dropdown
function displaySearchEngines() {
  const transaction = db.transaction('dorks', 'readonly');
  const dorksStore = transaction.objectStore('dorks');
  const searchEngineDropdown = document.getElementById('searchEngine');

  const searchEngines = new Set(); // Use a Set to avoid duplicate search engines

  dorksStore.openCursor().onsuccess = function(event) {
    const cursor = event.target.result;
    if (cursor) {
      const searchEngine = cursor.value.searchEngine;
      searchEngines.add(searchEngine);
      cursor.continue();
    } else {
      // Add search engines as options in the dropdown
      searchEngines.forEach(function(searchEngine) {
        const option = document.createElement('option');
        option.textContent = searchEngine;
        searchEngineDropdown.appendChild(option);
      });
    }
  };
}
function addEndpoint(domain, endpoint) {
  const transaction = db.transaction('endpoints', 'readwrite');
  const endpointsStore = transaction.objectStore('endpoints');

  const endpointData = {
    domain: domain,
    endpoint: endpoint
  };

  const addRequest = endpointsStore.add(endpointData);

  addRequest.onsuccess = function() {
    console.log('Endpoint added to the database');
  };

  addRequest.onerror = function(event) {
    console.log('Error adding' + endpoint + ' to the database: ' + event.target.errorCode);
  };
}

function addSubdomain(domain, subdomain) {
  const transaction = db.transaction('subdomains', 'readwrite');
  const subdomainsStore = transaction.objectStore('subdomains');

  const subdomainData = {
    domain: domain,
    subdomain: subdomain
  };

  const addRequest = subdomainsStore.add(subdomainData);

  addRequest.onsuccess = function() {
    console.log('subdomain added to the database');
  };

  addRequest.onerror = function(event) {
    console.log('Error adding subdomain to the database: ' + event.target.errorCode);
  };
}

// Function to return the total number of endpoints for a domain
function getTotalEndpoints(domain) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('endpoints', 'readonly');
    const endpointsStore = transaction.objectStore('endpoints');
    const request = endpointsStore.openCursor();

    let count = 0;

    request.onsuccess = function(event) {
      const cursor = event.target.result;
      if (cursor) {
        if (cursor.value.domain === domain) {
          count++;
        }
        cursor.continue();
      } else {
        resolve(count);
      }
    };

    request.onerror = function(event) {
      reject(event.target.error);
    };
  });
}

// Function to return the total number of subdomains for a domain
function getTotalSubdomains(domain) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('subdomains', 'readonly');
    const subdomainsStore = transaction.objectStore('subdomains');
    const request = subdomainsStore.openCursor();

    let count = 0;

    request.onsuccess = function(event) {
      const cursor = event.target.result;
      if (cursor) {
        if (cursor.value.domain === domain) {
          count++;
        }
        cursor.continue();
      } else {
        resolve(count);
      }
    };

    request.onerror = function(event) {
      reject(event.target.error);
    };
  });
}

