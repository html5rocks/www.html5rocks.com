var App = (function() {

// Used to track the enabling of hover effects
var enableTimer = 0;
var enableCheckbox = document.getElementById('enablecheck');

/*
 * Listen for a scroll and use that to remove
 * the possibility of hover effects
 */
window.addEventListener('scroll', function() {
  if (enableCheckbox.checked) {
    clearTimeout(enableTimer);
    removeHoverClass();
    enableTimer = setTimeout(addHoverClass, 1000);
  }
}, false);

/**
 * Removes the hover class from the body. Hover styles
 * are reliant on this class being present
 */
function removeHoverClass() {
  document.body.classList.remove('hover');
}

/**
 * Adds the hover class to the body. Hover styles
 * are reliant on this class being present
 */
function addHoverClass() {
  document.body.classList.add('hover');
}
})();
