import { useMemo } from "react";

// === Continuous clouds (loops forever) ===
const loopingClouds = useMemo(() => {
    const cloudImages = ["/cloud1.png", "/cloud2.png", "/cloud3.png"];
    const totalLoop = 15;

    let lastIndex = -1;

    const getRandomCloud = () => {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * cloudImages.length);
        } while (newIndex === lastIndex);
        lastIndex = newIndex;
        return cloudImages[newIndex];
    };

    return Array.from({ length: totalLoop }).map((_, i) => {
        const src = getRandomCloud();
        const direction = Math.random() < 0.5 ? "left" : "right";

        // Cloud size factor: 0 → 1
        const sizeFactor = Math.random();
        const width = 100 + sizeFactor * 400; // 100px → 500px
        const duration = 80 - sizeFactor * 40; // 80s → 20s
        const delay = Math.random() * 10;
        const opacity = 0.4 + sizeFactor * 0.6; // 0.4 → 1.0
        const top = 0 + Math.random() * 80;
        const left = direction === "left" ? `-${width + 50}px` : `calc(100vw + 50px)`;

        const animation = direction === "left"
            ? `floatCloudLR ${duration}s linear ${delay}s infinite`
            : `floatCloudRL ${duration}s linear ${delay}s infinite`;

        return {
            key: `loop-${i}`,
            src,
            style: { 
            position: "absolute", 
            top: `${top}%`, 
            width: `${width}px`, 
            left,
            animation, 
            opacity, 
            zIndex: 0 
            },
        };
        });
    }, []);