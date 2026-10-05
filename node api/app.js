const http = require("http");
const myuser = [
  {
    id: 1,
    name: "Asha",
    role: "admin",
    age: 93,
  },
  {
    id: 2,
    name: "Ravi",
    role: "member",
    age: 45,
  },
  {
    id: 3,
    name: "Rahul",
    role: "member",
    age: 1,
  },
];

const server = http.createServer((req, res) => {
  try {
    if (req.method === "GET" && req.url === "/users") {
      res.writeHead(200, {
        "Content-Type": "application/json",
      });
      res.end(JSON.stringify(myuser));
      return;
    }
    if (
      req.method === "GET" &&
      req.url.startsWith("/users/")
    ) {
      const id = Number(req.url.split("/")[2]);

      const user = myuser.find(
        (user) => user.id === id
      );

      if (!user) {
        res.writeHead(404, {
          "Content-Type": "application/json",
        });

        res.end(
          JSON.stringify({
            message: "User not found",
          })
        );

        return;
      }

      res.writeHead(200, {
        "Content-Type": "application/json",
      });

      res.end(JSON.stringify(user));

      return;
    }

  
    // GET - Filter Users
    // GET /users?role=admin

    if (
      req.method === "GET" && req.url.startsWith("/users?")
    ) {
      const url = new URL(
        req.url,
        `http://${req.headers.host}`
      );
      const role = url.searchParams.get("role");
      const result = myuser.filter(
        (user) => user.role === role
      );
      res.writeHead(200, {
        "Content-Type": "application/json",
      });
      res.end(JSON.stringify(result));
      return;
    }

    // POST - Create User
    // POST /users
    if (
      req.method === "POST" &&
      req.url === "/users"
    ) {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk;

        console.log("my body - ", body);
      });

      req.on("end", () => {
        try {
          const data = JSON.parse(body);

          const newUser = {
            id: myuser.length + 1,
            name: data.name,
            role: data.role,
            age: data.age,
          };

          myuser.push(newUser);

          res.writeHead(201, {
            "Content-Type": "application/json",
          });

          res.end(JSON.stringify(newUser));
        } catch (error) {
          console.log(error);

          res.writeHead(400, {
            "Content-Type": "application/json",
          });

          res.end(
            JSON.stringify({
              message: "Invalid JSON",
            })
          );
        }
      });

      return;
    }
    // DELETE - Delete User
    // DELETE /users/:id
    if (
      req.method === "DELETE" &&
      req.url.startsWith("/users/")
    ) {
      const id = Number(req.url.split("/")[2]);
      const index = myuser.findIndex(
        (user) => user.id === id
      );
      if (index === -1) {
        res.writeHead(404, {
          "Content-Type": "application/json",
        });
        res.end(
          JSON.stringify({
            message: "User not found",
          })
        );
        return;
      }
      myuser.splice(index, 1);
      res.writeHead(204);
      res.end();
      return;
    }

    // Route Not Found
    res.writeHead(404, {
      "Content-Type": "application/json",
    });

    res.end(
      JSON.stringify({
        message: "Route not found",
      })
    );

  } catch (error) {
    // CENTRAL ERROR HANDLING
    console.log(error);
    res.writeHead(500, {
      "Content-Type": "application/json",
    });

    res.end(
      JSON.stringify({
        message: "Internal Server Error",
      })
    );
  }
});

module.exports = server;