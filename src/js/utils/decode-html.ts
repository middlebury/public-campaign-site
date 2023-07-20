// https://css-tricks.com/snippets/javascript/unescape-html-in-js/
function decodeHtml(input: string) {
  const e = document.createElement('div');
  e.innerHTML = input;
  return e.childNodes.length === 0 ? '' : e.childNodes[0].nodeValue;
}

export default decodeHtml;
