/**
 * GitHub User Page Bookmarklet Script
 *
 * Purpose:
 * Quickly navigate from a GitHub user page to their Green Wall contribution graph share page
 *
 * Use Cases:
 * - When browsing GitHub user profiles and wanting to view a beautified version of their contribution graph
 * - Need to share a user's contribution graph with others
 * - Quick access to Green Wall user share pages
 *
 * Usage:
 * 1. Save this script as a browser bookmark
 * 2. Click the bookmark on any GitHub user page
 * 3. The system will automatically open the corresponding Green Wall share page in a new tab
 */

// eslint-disable-next-line no-unused-labels
javascript: (function () {
  const usernameBlock = document.querySelector('h1.vcard-names .vcard-username')

  if (usernameBlock instanceof HTMLElement) {
    if (typeof usernameBlock.textContent === 'string') {
      const username = usernameBlock.textContent.trim()

      if (username) {
        window.open(`https://green-wall.leoku.dev/share/${username}`, '_blank')
      }
    }
  }
})()
