const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()
app.use(express.json())

//GET METHOD

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
    SELECT 
        *
    FROM
        cricket_team
    ORDER BY
        player_id;`

  const playersArray = await db.all(getPlayersQuery)
  response.send(playersArray)
})

//POST METHOD

app.post('/players/', async (request, response) => {
  const playerDetails = request.body

  const {playerName, jerseyNumber, role} = playerDetails

  const addPlayersQuery = `
  INSERT INTO
    cricket_team
    (player_name, jersey_number, role)
  VALUES
    ('${playerName}', ${jerseyNumber}, '${role}');
`

  const dbResponse = await db.run(
    addPlayersQuery,
    playerName,
    jerseyNumber,
    role,
  )

  response.send('Player Added to Team')
})

//GET METHOD

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayersQuery = `
    SELECT 
        *
    FROM
        cricket_team
    WHERE 
      player_id = ${playerId};`

  const playersArray = await db.all(getPlayersQuery)
  response.send(playersArray)
})

//METHOD PUT

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails

  const updatePlayerQuery = `
    UPDATE
      cricket_team
    SET
      player_name = ?,
      jersey_number = ?,
      role = ?
    WHERE
      player_id = ?;
  `

  await db.run(updatePlayerQuery, playerName, jerseyNumber, role, playerId)
  response.send('Player Details Updated')
})

//DELETE METHOD
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
    DELETE FROM
      cricket_team
    WHERE
      player_id = ${playerId};`
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})
