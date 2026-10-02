const search = document.querySelector('#theme-search')
const cards = [...document.querySelectorAll('.theme-card')]
search.addEventListener('input', () => {
  const query = search.value.trim().toLowerCase()
  let visible = 0
  for (const card of cards) {
    card.hidden = !card.dataset.search.includes(query)
    if (!card.hidden) visible++
  }
  document.querySelector('#theme-count').textContent = `${visible} ${visible === 1 ? 'theme' : 'themes'}`
  document.querySelector('#theme-empty').hidden = visible !== 0
})

for (const button of document.querySelectorAll('.copy')) {
  const block = button.closest('.code-block')
  const status = document.createElement('p')
  status.className = 'copy-status'
  status.setAttribute('role', 'status')
  status.hidden = true
  block.after(status)
  button.setAttribute('aria-label', `Copy ${block.querySelector('.code-label').textContent} example`)
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(block.querySelector('pre code').textContent)
      status.textContent = 'Copied to clipboard.'
    } catch {
      status.textContent = 'Clipboard unavailable. Select the code below and copy it manually.'
      const selection = getSelection()
      const range = document.createRange()
      range.selectNodeContents(block.querySelector('pre code'))
      selection.removeAllRanges()
      selection.addRange(range)
    }
    status.hidden = false
  })
}
