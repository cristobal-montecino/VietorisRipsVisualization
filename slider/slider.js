window.addEventListener("load", function () {
    document.querySelectorAll('.slider__container').forEach(sliderContainer => {
        function registerSlider() {
            let isPointerDown = false;

            sliderContainer.addEventListener("pointerdown", ev => {
                isPointerDown = true;
            });

            window.addEventListener("pointerup", ev => {
                isPointerDown = false;
            });

            window.addEventListener("pointermove", ev => {
                if (!isPointerDown) {
                    return;
                }

                const sliderLine = sliderContainer.querySelector('.slider__line');
                const slidersLineRect = sliderLine.getBoundingClientRect();
                const percent = Math.min(Math.max((ev.clientX - slidersLineRect.x) / slidersLineRect.width, 0.0), 1.0);
                sliderContainer.style.setProperty("--slider-percent", `${percent * 100}%`);

                sliderContainer.dispatchEvent(new CustomEvent("slidermove", { detail: { percent: percent } }));
            });
        }

        registerSlider();
    });
});