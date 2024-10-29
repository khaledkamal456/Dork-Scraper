# Dork-Scraper

Dork-Scraper is a Google Chrome extension designed to help you gather endpoints from search engines as a penetration testing tool. This extension allows you to add custom domains and Dorks, making the search and results collection process easier.

## System Requirements

- Google Chrome browser
- Internet connection

## Installation

1. Download the extension files.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable Developer Mode in the top right corner.
4. Click on "Load unpacked" and select the folder containing the extension.

## Adding Domains and Dorks

1. Right-click on the extension and select "Options."
2. Enter your domain in the top field and click "Add Domain."
3. Click on the "Dork settings" button on the left, enter the Dork you want to add, and replace the domain placeholder with `$target$`. For example, instead of `site:example.com`, use `site:$target$`.
4. Specify the appropriate search engine and click "Add Dork."

## Usage

1. Click on the extension icon to open it.
2. Select the domain, search engine, and Dork you wish to search with.
3. Click "Next Page" to open the first search results page, then click "Page Scraping" to gather results.
4. After collecting results, click "Next Page" to move to the next page and repeat the "Page Scraping" process.

## Downloading Results

1. After finishing, go to the "Options" page where you added the domains and Dorks.
2. Click on the domain you were working with to view its results.
3. Click on "Download Subdomains" or "Download Endpoints" to download a text file containing the results for the selected domain.

## Important Note

DuckDuckGo has only one search results page, where you can scroll down until all results are displayed. Therefore, there is no need to use "Next Page." Just continue scrolling down until you reach the end, then click "Page Scraping" to collect the results.

## Contributing

If you'd like to contribute to the development of Dork-Scraper, feel free to open issues or submit pull requests to improve the extension.


---

If you have any questions, you can reach out through the GitHub page for the extension. Happy searching!
