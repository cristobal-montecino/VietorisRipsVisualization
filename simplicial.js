/**
 * Maps a value in the interval [x0, x1] to the interval [y0, y1].
 * 
 * @param {number} value - A value in the interval [x0, x1].
 * @param {number} x0 - A value less or equal than x1.
 * @param {number} x1 
 * @param {number} y0 - A value less or equal than y1.
 * @param {number} y1
 * @returns {number}
 */
function linearMap(value, x0, x1, y0, y1) {
    return (value - x0) / (x1 - x0) * (y1 - y0) + y0;
}

/**
 * Calculate the distance square between two points.
 * 
 * @param {number} x0 
 * @param {number} y0 
 * @param {number} x1 
 * @param {number} y1 
 * @returns {number}
 */
function distance2(x0, y0, x1, y1) {
    const x = x0 - x1;
    const y = y0 - y1;
    return x * x + y * y;
}

/**
 * Check if two circles intersects.
 * 
 * @param {number} x0
 * @param {number} y0
 * @param {number} radius0
 * @param {number} x1
 * @param {number} y1
 * @param {number} radius1
 * @return {boolean}
 */
function doCircleIntersects(x0, y0, radius0, x1, y1, radius1) {
    const radius = radius0 + radius1;
    return distance2(x0, y0, x1, y1) <= radius * radius;
}

/**
 * Intersects two sets.
 * @param {Set} a 
 * @param {Set} b 
 * @return {Set}
 */
function intersect(a, b) {
    if (b.length < a.length) {
        const c = b;
        b = a;
        a = c;
    }

    const intersection = new Set();
    a.forEach(x => b.has(x) && intersection.add(x));

    return intersection;
}

/**
 * Compute 2D Vietoris Rips Complex.
 * @param {Array<{x: number, y: number}>} points
 * @param {number} ballRadius
 * @returns {{lines: [number, number], triangles: [number, number, number]}}
 */
function vietorisrips(points, ballRadius) {
    const intersectionsWith = [];
    const lines = [];
    const triangles = [];

    for (let i = 0; i < points.length; i++) {
        const intersections = new Set();
        for (let j = i + 1; j < points.length; j++) {
            if (doCircleIntersects(points[i].x, points[i].y, ballRadius, points[j].x, points[j].y, ballRadius)) {
                intersections.add(j);
                lines.push([i, j]);
            }
        }
        intersectionsWith.push(intersections);
    }

    intersectionsWith.forEach((intersections, i) => {
        intersections.forEach(j => {
            intersect(intersections, intersectionsWith[j]).forEach(k => {
                triangles.push([i, j, k]);
            });
        });
    });

    return { lines: lines, triangles: triangles };
}

/**
 * Append a Circle path to the canvas context.
 * 
 * @param {CanvasRenderingContext2D} canvasContext
 * @param {number} x - Circle center x coordinate.
 * @param {number} y - Circle center y coordinate.
 * @param {number} radius - Circle radius.
 * @returns {void}
 * */
function drawCircle(canvasContext, x, y, radius) {
    canvasContext.ellipse(x, y, radius, radius, 0, 0, 2 * Math.PI);
}

/**
 * 
 * @param {number} radius 
 * @return {{x: number, y: number}}
 */
function randomFromCircle(radius) {
    const angle = Math.random() * 2 * Math.PI;
    const dist = radius;

    const x = dist * Math.cos(angle);
    const y = dist * Math.sin(angle);

    return { x: x, y: y };
}

/** 
* Create an renderer object.
* @param {number} num_points 
* @returns {object}
*/
function Renderer() {
    const randomPoints = [];

    for (let i = 0; i < 10; i++) {
        randomPoints.push({
            x: linearMap(Math.random(), 0.0, 1.0, 0.13, 0.9),
            y: linearMap(Math.random(), 0.0, 1.0, 0.13, 0.9)
        });
    }

    for (let i = 0; i < 4; i++) {
        const radius = 0.1;
        const aspect = 1.5;

        const cx = linearMap(Math.random(), 0.0, 1.0, 0.0+radius, 1.0-radius);
        const cy = linearMap(Math.random(), 0.0, 1.0, 0.05+radius*aspect, 0.98-radius*aspect);

        for (let i = 0; i < 20; i++) {
            const pt = randomFromCircle(1.0);
            const x = linearMap(pt.x, -1, 1, cx - radius, cx + radius);
            const y = linearMap(pt.y, -1, 1, cy - radius*aspect, cy + radius*aspect);
            
            randomPoints.push({
                x: x,
                y: y
            });
        }
    }

    return {
        /** 
        * @param {number} ballRadius 
        * @returns {void}
        */
        render: function (ballRadius) {
            /** @type {HTMLDivElement} */
            const canvasContainer = document.querySelector("body > .canvas_container");
            /** @type {HTMLCanvasElement} */
            const canvas = canvasContainer.querySelector("canvas");

            const canvasContainerRect = canvasContainer.getBoundingClientRect();
            const canvasWidth = canvas.width = canvasContainerRect.width;
            const canvasHeight = canvas.height = canvasContainerRect.height;

            /** @type {CanvasRenderingContext2D} */
            const canvasContext = canvas.getContext("2d");

            const scaledPoints = [];

            randomPoints.forEach(pt => {
                scaledPoints.push({
                    x: pt.x * canvasWidth,
                    y: pt.y * canvasHeight
                });
            });

            /** @type {HTMLSpanElement} */
            const ballRadiusSpan = document.getElementById("ball_radius_text");
            ballRadiusSpan.textContent = `${Math.round(ballRadius)}`;

            const p = document.querySelector(".controls > p");
            p.classList.remove('warning_color');
            p.classList.add('normal_color');

            const backgroundColor = "white";
            canvasContext.fillStyle = backgroundColor;
            canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);

            const { lines: lines, triangles: triangles } = vietorisrips(scaledPoints, ballRadius);

            canvasContext.fillStyle = "rgba(0, 255, 0, 0.3)";
            scaledPoints.forEach(pt => {
                canvasContext.beginPath();

                drawCircle(canvasContext, pt.x, pt.y, ballRadius);

                canvasContext.fill();
            });

            canvasContext.fillStyle = "rgba(80, 80, 255, 0.4)";

            const max_num_renderable_triangles = 8000;
            if (triangles.length > max_num_renderable_triangles) {
                p.classList.remove('normal_color');
                p.classList.add('warning_color');
            }

            triangles.slice(0, max_num_renderable_triangles).forEach(triangle => {
                canvasContext.beginPath();

                let a = scaledPoints[triangle[0]];
                let b = scaledPoints[triangle[1]];
                let c = scaledPoints[triangle[2]];

                canvasContext.moveTo(a.x, a.y);
                canvasContext.lineTo(b.x, b.y);
                canvasContext.lineTo(c.x, c.y);
                canvasContext.lineTo(a.x, a.y);

                canvasContext.fill();
            });

            canvasContext.strokeStyle = "rgb(0, 0, 0, 0.4)";
            canvasContext.lineWidth = 1.2;
            lines.forEach(line => {
                canvasContext.beginPath();

                let a = scaledPoints[line[0]];
                let b = scaledPoints[line[1]];

                canvasContext.moveTo(a.x, a.y);
                canvasContext.lineTo(b.x, b.y);

                canvasContext.stroke();
            });

            const pointRadius = 3;

            canvasContext.strokeStyle = "black";
            canvasContext.fillStyle = "#DF0008";
            canvasContext.lineWidth = 0.5;

            scaledPoints.forEach(pt => {
                canvasContext.beginPath();

                drawCircle(canvasContext, pt.x, pt.y, pointRadius);

                canvasContext.fill();
                canvasContext.stroke();
            });
        }
    };
}

window.addEventListener("load", function () {
    let ballRadius = 10;
    const renderer = Renderer();

    const slider = document.querySelector(".controls__radius_slider");
    slider.addEventListener("slidermove", ev => {
        const percent = ev.detail.percent;
        const minSliderValue = 10;
        const maxSliderValue = 100;
        ballRadius = linearMap(percent, 0, 1, minSliderValue, maxSliderValue);
        renderer.render(ballRadius);
    });

    renderer.render(ballRadius);

    window.addEventListener("resize", function () {
        renderer.render(ballRadius);
    })
});