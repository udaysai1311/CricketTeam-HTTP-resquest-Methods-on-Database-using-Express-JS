const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server has started at https://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};

initializeDbServer();

let convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//GET API
app.get("/players/", async (request, response) => {
  const getTeamDetails = `SELECT * FROM cricket_team;`;
  const playersArray = await db.all(getTeamDetails);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//POST API
app.post("/players/", async (request, response) => {
  const player_details = request.body;
  const { playerName, jerseyNumber, role } = player_details;
  const addPlayerQuery = `INSERT INTO 
            cricket_team (player_name, jersey_number, role)
        VALUES 
            ('${playerName}',
            ${jerseyNumber},
            '${role}');`;
  const dbResponse = await db.run(addPlayerQuery);
  const playerId = dbResponse.playerID;
  response.send("Player Added to Team");
});

//GET Player API
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT * FROM cricket_team WHERE player_id=${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(player));
});

//PUT API
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updateQuery = `
        UPDATE 
            cricket_team
        SET
            player_name = '${playerName}',
            jersey_number = ${jerseyNumber},
            role = '${role}'
        WHERE player_id = ${playerId};`;
  await db.run(updateQuery);
  response.send("Player Details Updated");
});

//DELETE API
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `DELETE FROM cricket_team WHERE player_id=${playerId};`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
