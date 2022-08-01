document.addEventListener("click", (e) => {
  console.log(e.target.dataset.short);
  if (e.target.dataset.short) {
    console.log(e.target);
    const url = `${window.location.origin}/${e.target.dataset.short}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        console.log("text copied to clipboard...");
      })
      .catch((err) => {
        console.log("somethin went wrong", err);
      });
  }
});
