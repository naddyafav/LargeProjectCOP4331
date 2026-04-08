import { useMemo } from "react";

// === Initial clouds (one-time) ===
const initialClouds = useMemo(() => {
    const cloudImages = ["/cloud1.png", "/cloud2.png", "/cloud3.png"];
    const totalInitial = 10; // number of clouds to appear immediatel

    // Generate evenly spaced horizontal positions
    const horizontalPositions = [0.02, 0.08, 0.13, 0.25, 0.38, 0.43, 0.615, 0.76, 0.91, 0.97];

    // Generate random vertical positions
    const verticalPositions = [0.48, 0.05, 0.82, 0.27, 0.66, 0.98, 0.73, 0.1, 0.5, 0.89];

    let lastIndex = -1;

    const getRandomCloud = () => {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * cloudImages.length);
        } while (newIndex === lastIndex);
        lastIndex = newIndex;
        return cloudImages[newIndex];
    };

    return Array.from({ length: totalInitial }).map((_, i) => {
        const src = getRandomCloud();
        const direction = Math.random() < 0.5 ? "left" : "right";

        // Cloud size factor: 0 → 1
        const sizeFactor = Math.random();
        const width = 100 + sizeFactor * 400; // 100px → 500px
        const duration = 80 - sizeFactor * 40; // 80s → 20s
        const opacity = 0.4 + sizeFactor * 0.6; // 0.4 → 1.0
        const top = verticalPositions[i] * 100;
        const left = horizontalPositions[i] * 100;

        const animation = direction === "left"
            ? `floatCloudLR ${duration}s linear forwards`
            : `floatCloudRL ${duration}s linear forwards`;

        return {
            key: `initial-${i}`,
            src,
            style: {
            position: "absolute" as const,
            top: `${top}%`,
            width: `${width}px`,
            left: `${left}%`,
            animation: animation,
            opacity,
            zIndex: 0,
            },
        };
        });
    }, []);