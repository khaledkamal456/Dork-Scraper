document.addEventListener('DOMContentLoaded', function() {
  const resultsButton = document.getElementById('resultsButton');
  const dorkSettingsButton = document.getElementById('dorkSettingsButton');
  const resultsFieldset = document.getElementById('resultsFieldset');
  const dorkSettingFieldset = document.getElementById('dorkSettingFieldset');

  resultsButton.addEventListener('click', function() {
    resultsFieldset.style.display = 'block';
    dorkSettingsFieldset.style.display = 'none';
  });

  dorkSettingsButton.addEventListener('click', function() {
    resultsFieldset.style.display = 'none';
    dorkSettingsFieldset.style.display = 'block';
  });
});


// Open IndexedDB database
const request = indexedDB.open('DorkScraperDB', 1);
let db;

request.onupgradeneeded = function(event) {
  db = event.target.result;

  // Create object store for domains
  if (!db.objectStoreNames.contains('domains')) {
    const domainsStore = db.createObjectStore('domains', { keyPath: 'id', autoIncrement: true });
    domainsStore.createIndex('domainIndex', 'domain', { unique: true });
  }
  
  // Create object store for subdomains
  if (!db.objectStoreNames.contains('subdomains')) {
    const subdomainsStore = db.createObjectStore('subdomains', { keyPath: 'id', autoIncrement: true });
    subdomainsStore.createIndex('domainId', 'domainId', { unique: false });
    subdomainsStore.createIndex('subdomainIndex', 'subdomain', { unique: true });
  }

  // Create object store for endpoints
  if (!db.objectStoreNames.contains('endpoints')) {
    const endpointsStore = db.createObjectStore('endpoints', { keyPath: 'id', autoIncrement: true });
    endpointsStore.createIndex('domainId', 'domainId', { unique: false });
    endpointsStore.createIndex('endpointIndex', 'endpoint', { unique: true });
  }
  
  // Create object store for endpoints
  if (!db.objectStoreNames.contains('dorks')) {
    const dorksStore = db.createObjectStore('dorks', { keyPath: 'id', autoIncrement: true });
    dorksStore.createIndex('searchEngine', 'searchEngine', { unique: false });
    dorksStore.createIndex('dorkIndex', 'dork', { unique: false });
  }
  
  // Create object store for settings
  if (!db.objectStoreNames.contains('settings')) {
    const settingsStore = db.createObjectStore('settings', { keyPath: 'id' });
  }
};

request.onsuccess = function(event) {
  db = event.target.result;
  displayDomains();
  displayDorks();
  displayEndpoints();
};

// Add domain to IndexedDB
document.getElementById('addDomainButton').addEventListener('click', function() {
  const domainInput = document.getElementById('domainInput');
  const domain = domainInput.value.trim();
  if (domain) {
    const transaction = db.transaction('domains', 'readwrite');
    const domainsStore = transaction.objectStore('domains');
    const domainData = { domain: domain };
    const addRequest = domainsStore.add(domainData);

    addRequest.onsuccess = function() {
      displayDomains();
    };
    
    addRequest.onerror = function(event) {
        console.log('Error adding domain to the database: ' + event.target.errorCode);
    };
  }
});

// Add dork to IndexedDB
addDorkButton.addEventListener('click', function() {
  const searchEngine = document.getElementById('searchEngine').value;
  const dork = document.getElementById('dorkInput').value;

  const transaction = db.transaction('dorks', 'readwrite');
  const dorksStore = transaction.objectStore('dorks');
  const index = dorksStore.index('searchEngine');

  const request = index.openCursor(IDBKeyRange.only(searchEngine));
  request.onsuccess = function(event) {
    const cursor = event.target.result;
    if (cursor) {
      if (cursor.value.dork === dork) {
        console.log('Dork already exists with the same search engine.');
        return;
      }
      cursor.continue();
    } else {
      const newDork = { searchEngine, dork };
      const addRequest = dorksStore.add(newDork);
      addRequest.onsuccess = function() {
        displayDorks(); // Refresh the table after adding a dork
      };
      addRequest.onerror = function(event) {
        console.log('Error adding dork to the database: ' + event.target.errorCode);
      };
    }
  };
});

// Delete domain from IndexedDB
function deleteDomain(id) {
  const transaction = db.transaction('domains', 'readwrite');
  const domainsStore = transaction.objectStore('domains');
  const deleteRequest = domainsStore.delete(id);

  deleteRequest.onsuccess = function() {
    displayDomains();
  };
}

// Delete dork from IndexedDB
function deleteDork(id) {
  const transaction = db.transaction('dorks', 'readwrite');
  const dorksStore = transaction.objectStore('dorks');
  const deleteRequest = dorksStore.delete(id);

  deleteRequest.onsuccess = function() {
    displayDorks(); // Refresh the table after deleting a dork
  };

  deleteRequest.onerror = function(event) {
    console.log('Error deleting dork from the database: ' + event.target.errorCode);
  };
}

// Function to delete an endpoint
function deleteEndpoint(endpointId,domain) {
  const transaction = db.transaction('endpoints', 'readwrite');
  const endpointsStore = transaction.objectStore('endpoints');

  const request = endpointsStore.delete(endpointId);

  request.onsuccess = function() {
    console.log('Endpoint deleted successfully');
    displayEndpoints(domain);
  };

  request.onerror = function() {
    console.error('Error deleting endpoint');
    // You can handle the error case here
  };
}

// Function to delete an subdomain
function deleteSubdomain(subdomainId,domain) {
  const transaction = db.transaction('subdomains', 'readwrite');
  const subdomainsStore = transaction.objectStore('subdomains');

  const request = subdomainsStore.delete(subdomainId);

  request.onsuccess = function() {
    console.log('subdomain deleted successfully');
    displaySubdomains(domain);
  };

  request.onerror = function() {
    console.error('Error deleting subdomain');
    // You can handle the error case here
  };
}

// Display domains in the table
function displayDomains() {
  const transaction = db.transaction('domains', 'readonly');
  const domainsStore = transaction.objectStore('domains');
  const domainsTable = document.getElementById('domainsTable');
  const tbody = domainsTable.getElementsByTagName('tbody')[0];
  tbody.innerHTML = '';

  domainsStore.openCursor().onsuccess = function(event) {
    const cursor = event.target.result;
    if (cursor) {
      const domain = cursor.value.domain;
      const row = document.createElement('tr');
      const domainCell = document.createElement('td');
      domainCell.textContent = domain;
      row.appendChild(domainCell);

      const actionCell = document.createElement('td');
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', function() {
        deleteDomain(cursor.value.id);
      });
      actionCell.appendChild(deleteButton);
      row.appendChild(actionCell);

      tbody.appendChild(row);
      cursor.continue();
    }
  };
}

// Display dorks in the table
function displayDorks() {
  const transaction = db.transaction('dorks', 'readonly');
  const dorksStore = transaction.objectStore('dorks');
  const dorksTable = document.getElementById('dorksTable');
  const tbody = dorksTable.getElementsByTagName('tbody')[0];
  tbody.innerHTML = '';

  dorksStore.openCursor().onsuccess = function(event) {
    const cursor = event.target.result;
    if (cursor) {
      const searchEngine = cursor.value.searchEngine;
      const dork = cursor.value.dork;
      const id = cursor.value.id; // Get the id of the dork
      const row = document.createElement('tr');
      const searchEngineCell = document.createElement('td');
      searchEngineCell.textContent = searchEngine;
      row.appendChild(searchEngineCell);
      const dorkCell = document.createElement('td');
      dorkCell.textContent = dork;
      row.appendChild(dorkCell);

      const actionCell = document.createElement('td');
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', function() {
        deleteDork(id); // Pass the id to the deleteDork function
      });
      actionCell.appendChild(deleteButton);
      row.appendChild(actionCell);

      tbody.appendChild(row);
      cursor.continue();
    }
  };
}

// Display endpoints in the table
function displayEndpoints(domain) {
  const transaction = db.transaction('endpoints', 'readonly');
  const endpointsStore = transaction.objectStore('endpoints');
  const endpointsTable = document.getElementById('endpointsTable');
  const tbody = endpointsTable.getElementsByTagName('tbody')[0];
  tbody.innerHTML = '';

  endpointsStore.openCursor().onsuccess = function(event) {
    const cursor = event.target.result;
    if (cursor) {
      const endpoint = cursor.value.endpoint;
      if (cursor.value.domain === domain) {
        const row = document.createElement('tr');
        const endpointCell = document.createElement('td');

        endpointCell.textContent = endpoint;
        row.appendChild(endpointCell);

        const actionCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';

        const endpointId = cursor.value.id; // Get the id of the endpoint

        deleteButton.addEventListener('click', function() {
          deleteEndpoint(endpointId, domain); // Pass the id and domain to the deleteEndpoint function
        });
        
        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);
    
        tbody.appendChild(row);
      }
      cursor.continue();
    }
  };
}

// Display endpoints in the table
function displaySubdomains(domain) {
  const transaction = db.transaction('subdomains', 'readonly');
  const subdomainsStore = transaction.objectStore('subdomains');
  const subdomainsTable = document.getElementById('subdomainTable');
  const tbody = subdomainsTable.getElementsByTagName('tbody')[0];
  tbody.innerHTML = '';

  subdomainsStore.openCursor().onsuccess = function(event) {
    const cursor = event.target.result;
    if (cursor) {
      const subdomain = cursor.value.subdomain;
      if (cursor.value.domain === domain) {
        const row = document.createElement('tr');
        const subdomainCell = document.createElement('td');
        subdomainCell.textContent = subdomain;
        row.appendChild(subdomainCell);

        const actionCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';

        const subdomainId = cursor.value.id; // Get the id of the subdomain

        deleteButton.addEventListener('click', function() {
          deleteSubdomain(subdomainId, domain); // Pass the id and domain to the deletesubdomain function
        });

        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);

        tbody.appendChild(row);
      }
      cursor.continue();
    }
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

var selectedDomain = "";

// Attach click event listener to the domains table
document.getElementById('domainsTable').onclick = function(event) {
  const target = event.target;
  const endpointsCount = document.getElementById("endpointsCount");
  const subdomainsCount = document.getElementById("subdomainsCount");
  if (target.tagName === 'TD' && target.cellIndex === 0) {
    const domain = target.textContent;
    displaySubdomains(domain);
    displayEndpoints(domain);
    getTotalEndpoints(domain).then(count => {
        endpointsCount.textContent = count
    })
    getTotalSubdomains(domain).then(count => {
        subdomainsCount.textContent = count
    })
    selectedDomain = domain;
  }
};

// Event listener for download subdomains
document.getElementById("downloadSubdomainsButton").addEventListener('click', function() {
  getSubdomains(selectedDomain).then(function(endpoints) {
    const filename = selectedDomain + '_subdomains.txt';
    const text = endpoints.join('\n');
    downloadTextFile(text, filename);
  }).catch(function(error) {
    console.error(error);
  });
});

// Event listener for download endpoints
document.getElementById("downloadEndpointsButton").addEventListener('click', function() {
  getEndpoints(selectedDomain).then(function(endpoints) {
    const filename = selectedDomain + '_endpoints.txt';
    const text = endpoints.join('\n');
    downloadTextFile(text, filename);
  }).catch(function(error) {
    console.error(error);
  });
});

// Function to download text file
function downloadTextFile(text, filename) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// Function to get subdomains for a domain
function getSubdomains(domain) {
  const transaction = db.transaction('subdomains', 'readonly');
  const subdomainsStore = transaction.objectStore('subdomains');
  const request = subdomainsStore.openCursor();
  
  return new Promise((resolve, reject) => {
    const subdomains = [];
    
    request.onsuccess = function(event) {
      const cursor = event.target.result;
      
      if (cursor) {
        if (cursor.value.domain === domain) {
          subdomains.push(cursor.value.subdomain);
        }
        
        cursor.continue();
      } else {
        resolve(subdomains);
      }
    };
    
    request.onerror = function(event) {
      reject(event.target.error);
    };
  });
}

// Function to get endpoints for a domain
function getEndpoints(domain) {
  const transaction = db.transaction('endpoints', 'readonly');
  const endpointsStore = transaction.objectStore('endpoints');
  const request = endpointsStore.openCursor();

  return new Promise((resolve, reject) => {
    const endpoints = [];

    request.onsuccess = function(event) {
      const cursor = event.target.result;

      if (cursor) {
        if (cursor.value.domain === domain) {
          endpoints.push(cursor.value.endpoint);
        }

        cursor.continue();
      } else {
        resolve(endpoints);
      }
    };

    request.onerror = function(event) {
      reject(event.target.error);
    };
  });
}
