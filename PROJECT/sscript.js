// Initialize canvas1 and variables
const canvas1 = document.getElementById("wheel");
const ctx = canvas1.getContext("2d");
const spinButton = document.getElementById("spin-btn");
const resultText = document.getElementById("result");
const walletAmountDisplay = document.getElementById("wallet-amount");
const navwal = document.getElementById("nav_wallet");

// List of options on the wheel (positive amounts and "Lose")
const options = ["₹100", "₹200", "₹500", "Lose", "₹50", "₹300", "₹400", "Lose"];

// Wheel properties
const wheelRadius = 200;
const wheelCenter = { x: canvas1.width / 2, y: canvas1.height / 2 };
const numOptions = options.length;
const angleStep = (2 * Math.PI) / numOptions; // Angle for each option

// Starting wallet amount
let walletAmount;
if (localStorage.getItem("balance")) {
  walletAmount = Math.floor(localStorage.getItem("balance"));
} else {
  walletAmount = localStorage.setItem("balance", 1000);
}
walletAmountDisplay.textContent = Math.floor(walletAmount).toString();
navwal.textContent = Math.floor(walletAmount).toString();
let lastWinningAmount = 0; // Store the last winning amount

// Draw the wheel
function drawWheel() {
  ctx.clearRect(0, 0, canvas1.width, canvas1.height); // Clear the canvas1

  for (let i = 0; i < numOptions; i++) {
    const startAngle = angleStep * i;
    const endAngle = startAngle + angleStep;
    const color = `hsl(${Math.random() * 360}, 100%, 70%)`; // Random color for each section

    // Draw the sector
    ctx.beginPath();
    ctx.moveTo(wheelCenter.x, wheelCenter.y);
    ctx.arc(wheelCenter.x, wheelCenter.y, wheelRadius, startAngle, endAngle);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();

    // Draw the option text
    const midAngle = startAngle + angleStep / 2;
    const textX = wheelCenter.x + Math.cos(midAngle) * (wheelRadius / 1.5);
    const textY = wheelCenter.y + Math.sin(midAngle) * (wheelRadius / 1.5);

    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(options[i], textX, textY);
  }
}

// Spin the wheel
function spinWheel() {
  if (walletAmount < 10) {
    resultText.textContent =
      "Insufficient funds to spin! Add money to continue.";
    return;
  }

  // Deduct the cost of the spin (₹10)
  walletAmount -= 10;
  walletAmountDisplay.textContent = Math.floor(walletAmount);
  navwal.textContent = Math.floor(walletAmount);
  localStorage.setItem("balance", walletAmount);

  const spinAngle = Math.random() * 360 + 720; // Random spin angle (min 720 degrees)
  const spins = 5; // Number of spins before stopping
  const totalSpin = spins * 360 + spinAngle; // Total angle for the spin
  let currentAngle = 0;

  // Animation loop
  let animationId = requestAnimationFrame(function rotateWheel(timestamp) {
    if (currentAngle < totalSpin) {
      currentAngle += 10; // Increase the angle incrementally
      ctx.save();
      ctx.translate(wheelCenter.x, wheelCenter.y); // Translate to the center of the wheel
      ctx.rotate((Math.PI / 180) * currentAngle); // Rotate the wheel
      ctx.translate(-wheelCenter.x, -wheelCenter.y); // Translate back
      drawWheel(); // Redraw the wheel with the new angle
      ctx.restore();
      animationId = requestAnimationFrame(rotateWheel);
    } else {
      cancelAnimationFrame(animationId);
      displayResult(currentAngle); // Correct the angle passed here
    }
  });
}

// Display the result of the spin and update the wallet
function displayResult(spinAngle) {
  // The angle calculation now takes the currentAngle of the spin and calculates the winning segment.
  const resultIndex =
    Math.floor(((spinAngle % 360) + angleStep / 2) / angleStep) % numOptions; // Correct calculation for result segment

  const result = options[resultIndex]; // Determine the result from the options array

  // Display the result
  resultText.textContent = `You landed on: ${result}`;

  if (result === "Lose") {
    // Deduct the last winning amount or ₹10 if there was no previous win
    walletAmount = Math.max(0, walletAmount - (lastWinningAmount || 10));
  } else if (result.startsWith("₹")) {
    const amount = parseInt(result.replace("₹", ""));
    lastWinningAmount = amount; // Store the winning amount for next loss
    walletAmount += amount; // Add the rupee amount to wallet
  }

  walletAmountDisplay.textContent = Math.floor(walletAmount); // Update the wallet display
  navwal.textContent = Math.floor(walletAmount);
  localStorage.setItem("balance", walletAmount);
}

// Add event listener to spin button
spinButton.addEventListener("click", function () {
  resultText.textContent = ""; // Clear previous result
  spinWheel(); // Start the spin
});

// Initial wheel draw
drawWheel();
