console.log("JavaScript loaded!");

const button = document.getElementById("testBtn");
const result = document.getElementById("result");

button.addEventListener("click", () => {
  result.textContent = "JavaScript is working!";
});
