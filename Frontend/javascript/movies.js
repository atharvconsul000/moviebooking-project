function parseJwt(token) {
      let base64Url = token.split('.')[1];
      let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      let jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      return JSON.parse(jsonPayload);
    }

    (async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first.");
        location.href = "login.html";
        return;
      }

      // Decode userId from JWT (if you need it; not strictly required for backend)
      const decoded = parseJwt(token);
      const userId = decoded.id;

      try {
        // Fetch list of movies
        const res = await fetch("http://localhost:3000/user/movies", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await res.json();

        // Render each movie and its Book button
        const container = document.getElementById("movieContainer");
        for (let i = 0; i < data.length; i++) {
          const movie = data[i];
          const div = document.createElement("div");
          div.classList.add("movieCard");
          div.innerHTML = `
            <h3>${movie.name}</h3>
            <p>Time: ${movie.time}</p>
            <p>Available Seats: ${movie.availableSeats}</p>
            <img src="${movie.image}" width="200" alt="${movie.name}" />
            <br/>
            <button
              class="bookBtn"
              data-movie-id="${movie._id}"
              data-user-id="${userId}"
            >
              Book
            </button>
            <hr/>
          `;
          container.appendChild(div);
        }

        // Now that buttons exist in the DOM, attach click listeners
        const bookButtons = document.querySelectorAll(".bookBtn");
        bookButtons.forEach(async button => {
             
             const movieId = button.getAttribute("data-movie-id");
             const token = localStorage.getItem("token");
             const res = await fetch(`http://localhost:3000/user/bookings/${movieId}`, {
             headers: {
             "Authorization": `Bearer ${token}`
             }
            });
            const btn = document.querySelector(`button[data-movie-id='${movieId}']`)
            const existing = await res.json();
              if (existing !==null) {
              btn.innerHTML = "Booked!";
              btn.style.backgroundColor = "#888";     // grey background
              btn.style.color = "#fff";               // white text
              btn.style.cursor = "not-allowed";       // disable pointer
              btn.style.border = "1px solid #666";    // border styling
              btn.style.fontWeight = "bold";          // bold text
              return;
              }
          button.addEventListener("click", async () => {
            const movieId = button.getAttribute("data-movie-id");
            const seats = prompt("Enter number of seats to book:");

            if (!seats || isNaN(seats) || Number(seats) < 1) {
              alert("Please enter a valid number.");
              return;
            }

            try {
              const bookingRes = await fetch(`http://localhost:3000/user/book/${movieId}`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                  numberOfSeats: Number(seats)
                })
              });
              const bookingData = await bookingRes.json();
              alert(bookingData.message);
              const buton = document.querySelector(`button[data-movie-id='${movieId}']`)
              if (buton) {
              btn.innerHTML = "Booked!";
              buton.style.backgroundColor = "#888";     // grey background
              buton.style.color = "#fff";               // white text
              buton.style.cursor = "not-allowed";       // disable pointer
              buton.style.border = "1px solid #666";    // border styling
              buton.style.fontWeight = "bold";          // bold text
              }
            } catch (err) {
              console.error("Booking failed:", err);
              alert("Something went wrong.");
             
            }
          });
        });

      } catch (err) {
        alert("Failed to load movies");
        console.error(err);
      }
    })();
