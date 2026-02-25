
export function addTouchListener(element, callback) {
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastY = 0;
    let startDistance = 0;
    let lastDistance = 0;
    let activeTouches = 0;
    let isPinching = false;
    let isDragging = false;

    function getTouchDistance(t1, t2) {
        const dx = t2.clientX - t1.clientX;
        const dy = t2.clientY - t1.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function handleTouchStart(event) {
        event.preventDefault();
        const touches = event.touches;
        activeTouches = touches.length;

        if (touches.length === 1) {
            isDragging = true;
            startX = lastX = touches[0].clientX;
            startY = lastY = touches[0].clientY;
        } else if (touches.length === 2) {
            isPinching = true;
            isDragging = false;
            startDistance = getTouchDistance(touches[0], touches[1]);
            lastDistance = startDistance;
        }
    }

    function handleTouchMove(event) {
        event.preventDefault();
        const touches = event.touches;
        activeTouches = touches.length;

        let delta_x = 0;
        let delta_y = 0;
        let delta_zoom = 0;

        if (isDragging && touches.length === 1) {
            const currentX = touches[0].clientX;
            const currentY = touches[0].clientY;

            delta_x = currentX - lastX;
            delta_y = currentY - lastY;

            lastX = currentX;
            lastY = currentY;
        } else if (isPinching && touches.length === 2) {
            const currentDistance = getTouchDistance(touches[0], touches[1]);
            delta_zoom = currentDistance - lastDistance;
            lastDistance = currentDistance;
        }

        if (delta_x !== 0 || delta_y !== 0 || delta_zoom !== 0) {
            callback({
                drag_x: delta_x,
                drag_y: delta_y,
                zoom: delta_zoom
            });
        }
    }

    function handleTouchEnd(event) {
        if (event.touches.length === 0) {
            isDragging = false;
            isPinching = false;
        } else {
            activeTouches = event.touches.length;
            if (activeTouches === 1 && isPinching) {
                isPinching = false;
                isDragging = true;
                startX = lastX = event.touches[0].clientX;
                startY = lastY = event.touches[0].clientY;
            }
        }
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('touchcancel', handleTouchEnd);

    return function removeTouchListener() {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchmove', handleTouchMove);
        element.removeEventListener('touchend', handleTouchEnd);
        element.removeEventListener('touchcancel', handleTouchEnd);
    };
}

export function addDoubleTapListener(element, callback) {
    let lastTapTime = 0;
    let tapTimeout = null;
    const DOUBLE_TAP_DELAY = 300;

    function handleTouchEnd(event) {
        const currentTime = Date.now();
        const timeSinceLastTap = currentTime - lastTapTime;

        if (timeSinceLastTap < DOUBLE_TAP_DELAY) {
            clearTimeout(tapTimeout);
            lastTapTime = 0;
            callback(event.clientX, event.clientY);
            event.preventDefault();
        } else {
            lastTapTime = currentTime;
            clearTimeout(tapTimeout);
            tapTimeout = setTimeout(() => {
            lastTapTime = 0;
            }, DOUBLE_TAP_DELAY);
        }
    }

    element.addEventListener('pointerup', handleTouchEnd);

    return function removeDoubleTapListener() {
        element.removeEventListener('pointerup', handleTouchEnd);
        clearTimeout(tapTimeout);
    };
}

// TODO finish
// export function addPointerListener(element, callback) {
//     let rect = element.getBoundingClientRect();

//     element.addEventListener("pointerdown", (event) => {
//         event.preventDefault();
//         console.log(event);
//         rect = element.getBoundingClientRect();
//         let move_a = Vector.vec(0.0);
//         let move_b = Vector.vec(0.0);

//         const move_handler = (event) => {
//             let zoom = 0.0;
//             let pan = Vector.vec(0.0);
//             if (event.isPrimary) {
//                 move_a = Vector.vec(event.movementX, event.movementY, 0.0);
//             } else {
//                 move_b = Vector.vec(event.movementX, event.movementY, 0.0);
//                 zoom = Vector.len(Vector.sub(move_a, move_b));
//                 pan = Vector.add(move_a, move_b);
//             }


//             callback({
//                 pos: {
//                     x: Math.min(Math.max((event.clientX - rect.x) / rect.width, 0.0), 1.0), 
//                     y: Math.min(Math.max((event.clientY - rect.y) / rect.height, 0.0), 1.0)
//                 },
//                 move: {x: 0.0, y: 0.0},
//                 drag: {x: event.movementX, y: event.movementY},
//                 pan: {x: pan.x, y: pan.y},
//                 zoom: zoom,
//             });
//         };

//         const exit_handler = (event) => {
//             element.removeEventListener("pointermove", move_handler);
//             ["pointerup", "pointercancel", "pointerleave"].forEach(el => {element.removeEventListener(el, exit_handler)});
//         };

//         element.addEventListener("pointermove", move_handler);
//         ["pointerup", "pointercancel", "pointerleave"].forEach(el => {element.addEventListener(el, exit_handler)});

//     });

//     // element.addEventListener("pointermove", (event) => {
//     //     callback({
//     //         pos: {
//     //             x: Math.min(Math.max((event.clientX - rect.x) / rect.width, 0.0), 1.0), 
//     //             y: Math.min(Math.max((event.clientY - rect.y) / rect.height, 0.0), 1.0)
//     //         },
//     //         move: {x: event.movementX, y: event.movementY},
//     //         drag: {x: 0.0, y: 0.0},
//     //         pan: {x: 0.0, y: 0.0},
//     //         zoom: 0.0,
//     //     });
//     // });
// }