export function triggerConfetti() {
  if (typeof window === "undefined") return

  const count = 50
  const defaults = {
    origin: { y: 0.7 },
  }

  function fire(particleRatio: number, opts: any) {
    const colors = ["#FFB5C5", "#FFE5D9", "#E8B4A0", "#FF6B6B", "#A8B5A0"]

    // Simple confetti simulation with DOM elements
    for (let i = 0; i < count * particleRatio; i++) {
      const confetti = document.createElement("div")
      confetti.style.position = "fixed"
      confetti.style.width = "10px"
      confetti.style.height = "10px"
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
      confetti.style.left = Math.random() * window.innerWidth + "px"
      confetti.style.top = "-20px"
      confetti.style.borderRadius = "50%"
      confetti.style.pointerEvents = "none"
      confetti.style.zIndex = "9999"
      confetti.style.transition = "all 2s ease-out"

      document.body.appendChild(confetti)

      setTimeout(() => {
        confetti.style.top = window.innerHeight + "px"
        confetti.style.opacity = "0"
        confetti.style.transform = `translateX(${(Math.random() - 0.5) * 500}px) rotate(${Math.random() * 360}deg)`
      }, 10)

      setTimeout(() => {
        confetti.remove()
      }, 2000)
    }
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  })
  fire(0.2, {
    spread: 60,
  })
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  })
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  })
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  })
}
