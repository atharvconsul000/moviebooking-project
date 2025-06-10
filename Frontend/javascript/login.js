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

  document.getElementById("LoginBtn").addEventListener("click", async function() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch("http://localhost:3000/user/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      console.log(data);
      alert(data.message);

      if (data.token) {
        localStorage.setItem("token", data.token);

        // Decode JWT to get role
        const decoded = parseJwt(data.token);
        const role = decoded.role;

        if (role === "admin") {
          location.href = "admin-dashboard.html";
        } else {
          location.href = "movies.html";
        }
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Signin failed");
    }
  });