const btnSize = document.querySelector('#btnModeSize');
const btnDistance = document.querySelector('#btnModeDistance');
const sizePanel = document.querySelector('#sizePanel');
const distPanel = document.querySelector('#distPanel');

function setMode(mode) {
  const isSize = mode === 'size';
  btnSize.classList.toggle('active', isSize);
  btnSize.setAttribute('aria-pressed', String(isSize));
  btnDistance.classList.toggle('active', !isSize);
  btnDistance.setAttribute('aria-pressed', String(!isSize));
  sizePanel.classList.toggle('active', isSize);
  distPanel.classList.toggle('active', !isSize);
}

btnSize.onclick = () => setMode('size');
btnDistance.onclick = () => setMode('distance');
