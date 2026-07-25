import confetti from 'canvas-confetti';

/**
 * Triggers a confetti celebration and returns a personalized greeting.
 * @param {number|string} score - The SGPA or CGPA score.
 * @returns {string} The greeting associated with the score.
 */
export const fireCelebration = (score) => {
    const val = parseFloat(score);
    let greeting = '';

    if (val >= 9.5) {
        greeting = 'Unbelievable! You are a Legend! 🏆🔥';
    } else if (val >= 9.0) {
        greeting = "Outstanding! You're in the elite club! 🌟🚀";
    } else if (val >= 8.5) {
        greeting = 'Incredible! Keep shining bright! ✨💎';
    } else if (val >= 8.0) {
        greeting = "Excellent Work! You've done amazing! 🎉👏";
    } else if (val >= 7.5) {
        greeting = 'Great Achievement! Keep up the momentum! 💪🌈';
    } else if (val >= 7.0) {
        greeting = "Very Good! You're on the right track! 👍📈";
    } else if (val >= 6.5) {
        greeting = 'Good Job! Keep pushing for more! 😊🎯';
    } else if (val >= 6.0) {
        greeting = 'Well Done! Every step counts! 🙌📚';
    } else {
        greeting = 'Keep push yourself hard! 📚🔥';
    }

    if (val >= 6.0) {
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            // since particles fall down, start a bit higher than random
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    }

    return greeting;
};
