async function generate() {
  const prompt = document.getElementById("prompt").value;
  const ratio = document.getElementById("ratio").value;
  const result = document.getElementById("result");

  result.innerHTML = "Generating…";

  const res = await fetch("http://localhost:3000/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      aspectRatio: ratio
    })
  });

  const data = await res.json();

  if (data.success) {
    result.innerHTML = `<img src="${data.imageUrl}" />`;
  } else {
    result.innerHTML = data.error || "Error";
  }
}
