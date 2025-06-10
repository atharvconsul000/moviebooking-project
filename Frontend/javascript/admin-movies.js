
(async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login first.");
    location.href = "login.html";
    return;
  }
  try {
    const res = await fetch("http://localhost:3000/admin/movies", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const data = await res.json();

    const container = document.getElementById("movieContainer");
    data.forEach(movie => {
      const div = document.createElement("div");
      div.classList.add("movieCard");
      div.innerHTML = `
        <input type="text" value="${movie.name}" disabled id="name-${movie._id}" />
        <input type="text" value="${movie.time}" disabled id="time-${movie._id}" />
        <input type="number" value="${movie.availableSeats}" disabled id="seats-${movie._id}" />
        <input type="text" value="${movie.image}" disabled id="image-${movie._id}" />
        <button class="updateBtn" data-movie-id="${movie._id}">Edit</button>
        <button class="deleteBtn" data-movie-id="${movie._id}">Delete</button>
      `;
      container.appendChild(div);
    });

    const updateButtons = document.querySelectorAll(".updateBtn");
    updateButtons.forEach(button => {
      button.addEventListener("click", async () => {
        const movieId = button.getAttribute("data-movie-id");
        const isEdit = button.innerText === "Edit";

        const fields = ["name", "time", "seats", "image"];
        fields.forEach(field => {
          document.getElementById(`${field}-${movieId}`).disabled = !isEdit;
        });

        if (!isEdit) {
          // Save update
          const updatedMovie = {
            name: document.getElementById(`name-${movieId}`).value,
            time: document.getElementById(`time-${movieId}`).value,
            availableSeats: Number(document.getElementById(`seats-${movieId}`).value),
            image: document.getElementById(`image-${movieId}`).value
          };

          try {
            await fetch(`http://localhost:3000/admin/movies/${movieId}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify(updatedMovie)
            });
            alert("Movie updated successfully");
            button.innerText = "Edit";
          } catch (err) {
            console.error(err);
            alert("Update failed");
          }
        } else {
          button.innerText = "Save";
        }
      });
    });

    const deleteButtons = document.querySelectorAll(".deleteBtn");
    deleteButtons.forEach(button => {
      button.addEventListener("click", async () => {
        const movieId = button.getAttribute("data-movie-id");

        //if (!confirm("Are you sure you want to delete this movie?")) return;

        try {
          await fetch(`http://localhost:3000/admin/delete-movie/${movieId}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          alert("Movie deleted successfully");
          location.reload();
        } catch (err) {
          console.error(err);
          alert("Failed to delete movie");
        }
      });
    });

  } catch (err) {
    alert("Failed to load movies");
    console.error(err);
  }
})();
