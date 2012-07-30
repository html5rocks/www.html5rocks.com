const REV = 6, BRUSHES = ["ribbon", "sketchy", "shaded", "chrome", "fur", "longfur", "web", "", "simple", "squares", "", "circles", "grid"], USER_AGENT = navigator.userAgent.toLowerCase();
var SCREEN_WIDTH = window.innerWidth,
    SCREEN_HEIGHT = window.innerHeight,
    BRUSH_SIZE = 1,
    BRUSH_PRESSURE = 1,
    COLOR = [0, 0, 0],
    STORAGE = window.localStorage,
    brush, saveTimeOut, wacom, i, mouseX = 0,
    mouseY = 0,
    container, foregroundColorSelector, menu, about, canvas, flattenCanvas, context, isFgColorSelectorVisible = false,
    isBgColorSelectorVisible = false,
    isAboutVisible = false,
    isMenuMouseOver = false,
    shiftKeyIsDown = false,
    altKeyIsDown = false;
init();

function init() {
    var hash, palette, embed, localStorageImage;
    if (USER_AGENT.search("android") > -1 || USER_AGENT.search("iphone") > -1) BRUSH_SIZE = 2;
    if (!Modernizr.localstorage) STORAGE = false;
    container = document.getElementById("harmony");

    canvas = document.createElement("canvas");
    canvas.width = 750;
    canvas.height = 400;
    canvas.style.cursor = 'crosshair';
    container.appendChild(canvas);
    context = canvas.getContext("2d");
    flattenCanvas = document.createElement("canvas");
    flattenCanvas.width = 750;
    flattenCanvas.height = 400;
    palette = new Palette();
    foregroundColorSelector = new ColorSelector(palette);
    foregroundColorSelector.addEventListener('change', onForegroundColorSelectorChange, false);
    //container.appendChild(foregroundColorSelector.container);
    menu = new Menu();
    menu.foregroundColor.addEventListener('click', onMenuForegroundColor, false);
    menu.foregroundColor.addEventListener('touchend', onMenuForegroundColor, false);
    menu.selector.addEventListener('change', onMenuSelectorChange, false);
    menu.save.addEventListener('click', onMenuSave, false);
    menu.save.addEventListener('touchend', onMenuSave, false);
    menu.clear.addEventListener('click', onMenuClear, false);
    menu.clear.addEventListener('touchend', onMenuClear, false);
    menu.container.addEventListener('mouseover', onMenuMouseOver, false);
    menu.container.addEventListener('mouseout', onMenuMouseOut, false);
    container.appendChild(menu.container);
    if (STORAGE) {
        if (localStorage.getItem('canvas')) //localStorage.canvas
        {
            localStorageImage = new Image();
            localStorageImage.addEventListener("load", function (event) {
                localStorageImage.removeEventListener(event.type, arguments.callee, false);
                context.drawImage(localStorageImage, 0, 0);
            }, false);
            localStorageImage.src = localStorage.getItem('canvas');
        }
        if (localStorage.getItem('brush_color_red')) {
            COLOR[0] = localStorage.getItem('brush_color_red');
            COLOR[1] = localStorage.getItem('brush_color_green');
            COLOR[2] = localStorage.getItem('brush_color_blue');
        }
    }
    foregroundColorSelector.setColor(COLOR);
    if (window.location.hash) {
        hash = window.location.hash.substr(1, window.location.hash.length);
        for (i = 0; i < BRUSHES.length; i++) {
            if (hash == BRUSHES[i]) {
                brush = eval("new " + BRUSHES[i] + "(context)");
                menu.selector.selectedIndex = i;
                break;
            }
        }
    }
    if (!brush) {
        brush = eval("new " + BRUSHES[0] + "(context)");
    }
    document.getElementById("harmony").addEventListener('mousemove', onWindowMouseMove, false);
    document.getElementById("harmony").addEventListener('resize', onWindowResize, false);
    document.getElementById("harmony").addEventListener('keydown', onWindowKeyDown, false);
    document.getElementById("harmony").addEventListener('keyup', onWindowKeyUp, false);
    document.getElementById("harmony").addEventListener('blur', onWindowBlur, false);
    document.getElementById("harmony").addEventListener('mousedown', onDocumentMouseDown, false);
    document.getElementById("harmony").addEventListener('mouseout', onDocumentMouseOut, false);
    document.getElementById("harmony").addEventListener("dragenter", onDocumentDragEnter, false);
    document.getElementById("harmony").addEventListener("dragover", onDocumentDragOver, false);
    document.getElementById("harmony").addEventListener("drop", onDocumentDrop, false);
    canvas.addEventListener('mousedown', onCanvasMouseDown, false);
    canvas.addEventListener('touchstart', onCanvasTouchStart, false);
    onWindowResize(null);
}

function onWindowMouseMove(event) {
    mouseX = event.offsetX;
    mouseY = event.offsetY;
}

function onWindowResize() {
    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;
    //menu.container.style.left = ((SCREEN_WIDTH - menu.container.offsetWidth) / 2) + 'px';
    //about.container.style.left = ((SCREEN_WIDTH - about.container.offsetWidth) / 2) + 'px';
    //about.container.style.top = ((SCREEN_HEIGHT - about.container.offsetHeight) / 2) + 'px';
}

function onWindowKeyDown(event) {
    if (shiftKeyIsDown) return;
    switch (event.keyCode) {
    case 16:
        // Shift
        shiftKeyIsDown = true;
        foregroundColorSelector.container.style.left = mouseX - 125 + 'px';
        foregroundColorSelector.container.style.top = mouseY - 125 + 'px';
        foregroundColorSelector.container.style.visibility = 'visible';
        break;
    case 18:
        // Alt
        altKeyIsDown = true;
        break;
    case 68:
        // d
        if (BRUSH_SIZE > 1) BRUSH_SIZE--;
        break;
    case 70:
        // f
        BRUSH_SIZE++;
        break;
    }
}

function onWindowKeyUp(event) {
    switch (event.keyCode) {
    case 16:
        // Shift
        shiftKeyIsDown = false;
        foregroundColorSelector.container.style.visibility = 'hidden';
        break;
    case 18:
        // Alt
        altKeyIsDown = false;
        break;
    case 82:
        // r
        brush.destroy();
        brush = eval("new " + BRUSHES[menu.selector.selectedIndex] + "(context)");
        break;
    }
    context.lineCap = BRUSH_SIZE == 1 ? 'butt' : 'round';
}

function onWindowBlur(event) {
    shiftKeyIsDown = false;
    altKeyIsDown = false;
}
// DOCUMENT

function onDocumentMouseDown(event) {
    if (!isMenuMouseOver) event.preventDefault();
}

function onDocumentMouseOut(event) {
    onCanvasMouseUp();
}

function onDocumentDragEnter(event) {
    event.stopPropagation();
    event.preventDefault();
}

function onDocumentDragOver(event) {
    event.stopPropagation();
    event.preventDefault();
}

function onDocumentDrop(event) {
    event.stopPropagation();
    event.preventDefault();
    var file = event.dataTransfer.files[0];
    if (file.type.match(/image.*/)) {
/*
		 * TODO: This seems to work on Chromium. But not on Firefox.
		 * Better wait for proper FileAPI?
		 */
        var fileString = event.dataTransfer.getData('text').split("\n");
    }
}
// COLOR SELECTORS

function onForegroundColorSelectorChange(event) {
    COLOR = foregroundColorSelector.getColor();
    menu.setForegroundColor(COLOR);
    if (STORAGE) {
        localStorage.setItem('brush_color_red', COLOR[0]);
        localStorage.setItem('brush_color_green', COLOR[1]);
        localStorage.setItem('brush_color_blue', COLOR[2]);
    }
}
// MENU

function onMenuForegroundColor() {
    cleanPopUps();
    foregroundColorSelector.show();
    foregroundColorSelector.container.style.left = ((SCREEN_WIDTH - foregroundColorSelector.container.offsetWidth) / 2) + 'px';
    foregroundColorSelector.container.style.top = ((SCREEN_HEIGHT - foregroundColorSelector.container.offsetHeight) / 2) + 'px';
    isFgColorSelectorVisible = true;
}

function onMenuSelectorChange() {
    if (BRUSHES[menu.selector.selectedIndex] == "") return;
    brush.destroy();
    brush = eval("new " + BRUSHES[menu.selector.selectedIndex] + "(context)");
    window.location.hash = BRUSHES[menu.selector.selectedIndex];
}

function onMenuMouseOver() {
    isMenuMouseOver = true;
}

function onMenuMouseOut() {
    isMenuMouseOver = false;
}

function onMenuSave() {
    // window.open(canvas.toDataURL('image/png'),'mywindow');
    flatten();
    window.open(flattenCanvas.toDataURL('image/png'), 'mywindow');
}

function onMenuClear() {
    if (!confirm("Are you sure?")) return;
    context.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    saveToLocalStorage();
    brush.destroy();
    brush = eval("new " + BRUSHES[menu.selector.selectedIndex] + "(context)");
}

function onMenuAbout() {
    cleanPopUps();
    isAboutVisible = true;
    about.show();
}
// CANVAS

function onCanvasMouseDown(event) {
    var data, position;
    clearTimeout(saveTimeOut);
    cleanPopUps();
    if (altKeyIsDown) {
        flatten();
        data = flattenCanvas.getContext("2d").getImageData(0, 0, flattenCanvas.width, flattenCanvas.height).data;
        position = (event.clientX + (event.clientY * canvas.width)) * 4;
        foregroundColorSelector.setColor([data[position], data[position + 1], data[position + 2]]);
        return;
    }
    BRUSH_PRESSURE = wacom && wacom.isWacom ? wacom.pressure : 1;
    brush.strokeStart(event.offsetX, event.offsetY);
    window.addEventListener('mousemove', onCanvasMouseMove, false);
    window.addEventListener('mouseup', onCanvasMouseUp, false);
}

function onCanvasMouseMove(event) {
    BRUSH_PRESSURE = wacom && wacom.isWacom ? wacom.pressure : 1;
    brush.stroke(event.offsetX, event.offsetY);
}

function onCanvasMouseUp() {
    brush.strokeEnd();
    window.removeEventListener('mousemove', onCanvasMouseMove, false);
    window.removeEventListener('mouseup', onCanvasMouseUp, false);
    if (STORAGE) {
        clearTimeout(saveTimeOut);
        saveTimeOut = setTimeout(saveToLocalStorage, 2000, true);
    }
}
//

function onCanvasTouchStart(event) {
    cleanPopUps();
    if (event.touches.length == 1) {
        event.preventDefault();
        brush.strokeStart(event.touches[0].pageX, event.touches[0].pageY);
        window.addEventListener('touchmove', onCanvasTouchMove, false);
        window.addEventListener('touchend', onCanvasTouchEnd, false);
    }
}

function onCanvasTouchMove(event) {
    if (event.touches.length == 1) {
        event.preventDefault();
        brush.stroke(event.touches[0].pageX, event.touches[0].pageY);
    }
}

function onCanvasTouchEnd(event) {
    if (event.touches.length == 0) {
        event.preventDefault();
        brush.strokeEnd();
        window.removeEventListener('touchmove', onCanvasTouchMove, false);
        window.removeEventListener('touchend', onCanvasTouchEnd, false);
    }
}

function saveToLocalStorage() {
    localStorage.setItem('canvas', canvas.toDataURL('image/png'));
}

function flatten() {
    var context = flattenCanvas.getContext("2d");
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(canvas, 0, 0);
}

function cleanPopUps() {
    if (isFgColorSelectorVisible) {
        foregroundColorSelector.hide();
        isFgColorSelectorVisible = false;
    }
    if (isBgColorSelectorVisible) {
        isBgColorSelectorVisible = false;
    }
    if (isAboutVisible) {
        about.hide();
        isAboutVisible = false;
    }
}