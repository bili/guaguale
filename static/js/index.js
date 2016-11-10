window.onload = function() {

    var cvs = document.getElementById("cvs");
    var supportCanvas = !!cvs.getContext;
    if (!supportCanvas) return;

    var hasTouch = "ontouchstart" in window ? true : false;
    var tapStart = hasTouch ? "touchstart" : "mousedown";
    var tapMove = hasTouch ? "touchmove" : "mousemove";
    var tapEnd = hasTouch ? "touchend" : "mouseup";

    // Colored pixel coverage ratio
    // When it's less than coverageRatio, it uncovers automatically.
    var coverageRatio = 0.3;
    var cvsWrapper = document.querySelector('.card');
    var ctx = cvs.getContext("2d");

    var card = document.querySelector(".card");

    cvs.width = card.clientWidth;
    cvs.height = card.clientHeight;

    var img = new Image();
    img.src = "static/images/card-cover.png";
    img.onload = function () {
        var w = cvs.height * img.width / img.height;
        // Align center horizontally
        ctx.drawImage(this, (cvs.width - w) / 2, 0, w, cvs.height);
        tap();
    };

    function getXY(e) {
        var tapX = hasTouch ? e.targetTouches[0].pageX : e.pageX;
        var tapY = hasTouch ? e.targetTouches[0].pageY : e.pageY;
        var x = tapX - cvsWrapper.offsetLeft;
        var y = tapY - cvsWrapper.offsetTop;
        return {x: x, y: y};
    }

    function paint(p1, p2){
        ctx.save();
        ctx.beginPath();
        if(!p2) {
            ctx.arc(p1.x, p1.y, fingerRadius, 0, 2 * Math.PI);
            ctx.fill();
        } else {
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
        ctx.restore();
    }

    var p1, p2;
    var timeout;
    var fingerRadius = 10;
    var delay = 100;
    var distance = 1;

    function tap() {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = fingerRadius * 2;
        ctx.globalCompositeOperation = "destination-out";

        window.addEventListener(tapStart, function (e) {
            e.preventDefault();
            if (timeout) clearTimeout(timeout);

            p1 = getXY(e);

            // Except: click to paint
            // paint(p1);

            this.addEventListener(tapMove, tapMoveHandler, false);
            this.addEventListener(tapEnd, function () {
                this.removeEventListener(tapMove, tapMoveHandler);

                // Check wheather swipe coverage ratio is more than coverageRatio or not
                timeout = setTimeout(function () {
                    var imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
                    var coloredPixelAmount = 0;
                    for (var x = 0; x < imgData.width; x += distance) {
                        for (var y = 0; y < imgData.height; y += distance) {
                            var i = (y * imgData.width + x) * 4;
                            if (imgData.data[i + 3] > 0) coloredPixelAmount++;
                        }
                    }
                    // Compute one colored pixel area / amount of pixels
                    if (coloredPixelAmount / (imgData.width * imgData.height / distance) < coverageRatio) {
                        cvs.classList.add("noOp");
                    }
                }, delay)
            }, false);

            function tapMoveHandler(e) {
                e.preventDefault();
                clearTimeout(timeout);

                p2 = getXY(e);
                paint(p1, p2);

                p1.x = p2.x;
                p1.y = p2.y;
            }
        })
    }
};

