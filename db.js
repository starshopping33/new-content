import {Client} from "pg"


export const connection = new Client({
    port:5432,
    database:"senac",
    host:"localhost",
    password:"admin",
    user: "postgres"   
})
await connection.connect().then((res)=>{
    console.log("database connected")
})

export const database = {
    users:[]
}