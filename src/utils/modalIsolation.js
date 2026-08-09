export function isolateModal(modalElement) {
  const parent = modalElement?.parentElement
  if (!parent) return () => {}

  const siblings = [...parent.children].filter((element) => element !== modalElement)
  const previousState = siblings.map((element) => ({
    element,
    inert: element.inert,
    ariaHidden: element.getAttribute('aria-hidden'),
  }))

  siblings.forEach((element) => {
    element.inert = true
    element.setAttribute('aria-hidden', 'true')
  })

  return () => {
    previousState.forEach(({ element, inert, ariaHidden }) => {
      element.inert = inert
      if (ariaHidden === null) element.removeAttribute('aria-hidden')
      else element.setAttribute('aria-hidden', ariaHidden)
    })
  }
}
