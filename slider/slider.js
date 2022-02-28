window.addEventListener("load", function () {
    document.querySelectorAll('.slider__container').forEach(sliderContainer => {
        function registerSlider() {
            let isMouseDown = false;

            sliderContainer.addEventListener("mousedown", ev => {
                isMouseDown = true;
            });

            window.addEventListener("mouseup", ev => {
                isMouseDown = false;
            });

            window.addEventListener("mousemove", ev => {
                if (!isMouseDown) {
                    return;
                }

                let sliderLine = sliderContainer.querySelector('.slider__line');
                let slidersLineRect = sliderLine.getBoundingClientRect();
                let percent = Math.min(Math.max((ev.clientX - slidersLineRect.x) / slidersLineRect.width, 0.0), 1.0);
                sliderContainer.style.setProperty("--slider-percent", `${percent * 100}%`);

                sliderContainer.dispatchEvent(new CustomEvent("slidermove", { detail: { percent: percent } }));
            });
        }

        registerSlider();
    });
});